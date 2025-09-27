// src/ai/ai-orchestrator.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppointmentsService } from '../appointments/appointments.service';

type Msg = OpenAI.ChatCompletionMessageParam;

type SessionState = {
  step:
    | 'collect_patient'
    | 'collect_specialty_reason'
    | 'choose_doctor'
    | 'choose_slot'
    | 'done';

  // dados do paciente
  patientName?: string;
  patientBirth?: string; // ISO (YYYY-MM-DD)
  city?: string;

  // intenção
  specialtyId?: string;
  reason?: string;

  // escolhas
  doctors?: { id: string; name: string }[];
  slots?: { id: string; dateISO: string }[]; // ISO UTC conservado; exibição com TZ BR
  selectedDoctorId?: string;
  selectedAvailabilityId?: string;
};

function parsePtBrDateToISO(d: string): string | null {
  // Aceita DD/MM/AAAA (com ou sem espaços)
  const m = d.trim().match(/^(\d{2})[\/](\d{2})[\/](\d{4})$/);
  if (!m) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`; // ISO-only date (sem hora)
}

function formatDateTimeBR(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

function tryParsePatientCSV(input: string) {
  // Principal: "Nome, DD/MM/AAAA, Cidade"
  // Também tolera espaços extras.
  const parts = input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    const [name, birthPtBr, city] = parts;
    const iso = parsePtBrDateToISO(birthPtBr);
    if (name && iso && city) {
      return { patientName: name, patientBirth: iso, city };
    }
  }
  return null;
}

function tryParsePatientLabeled(input: string) {
  // Compat. com: "Nome: X; Nascimento: 1990-05-30 ou 30/05/1990; Cidade: Y"
  const name = input.match(/nome[:\-]\s*([^;,\n]+)/i)?.[1]?.trim();
  const nascRaw =
    input.match(/nascimento[:\-]\s*([^;,\n]+)/i)?.[1]?.trim() ??
    input.match(/data\s*de\s*nascimento[:\-]\s*([^;,\n]+)/i)?.[1]?.trim();
  const city = input.match(/cidade[:\-]\s*([^;,\n]+)/i)?.[1]?.trim();

  let birthISO: string | null = null;
  if (nascRaw) {
    // aceita ISO YYYY-MM-DD ou PT-BR DD/MM/AAAA
    const isoMatch = nascRaw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    birthISO = isoMatch ? isoMatch[0] : parsePtBrDateToISO(nascRaw);
  }

  if (name && birthISO && city) {
    return { patientName: name, patientBirth: birthISO, city };
  }
  return null;
}

@Injectable()
export class AiOrchestratorService {
  constructor(
    private readonly openai: OpenAI,
    private readonly appts: AppointmentsService,
  ) {}

  private sessions = new Map<string, { history: Msg[]; state: SessionState }>();

  private sys = `
Você é um agente de agendamento que segue estritamente este fluxo:
(1) Peça nome completo, data de nascimento e cidade **neste formato**: "Nome completo, DD/MM/AAAA, Cidade".
    - Aceite também o formato antigo com rótulos (ex.: "Nome: ...; Nascimento: DD/MM/AAAA; Cidade: ...").
    - Só avance quando os três forem informados.
(2) Pergunte a especialidade e o motivo da consulta. Só avance quando ambos forem informados.
(3) Liste TODOS os médicos dessa especialidade na cidade (lista numerada 1..N, só nome do médico).
(4) Peça que o usuário escolha o número do médico.
(5) Liste as datas disponíveis do médico selecionado nos próximos 30 dias (lista numerada 1..N). **Exiba no fuso de São Paulo (America/Sao_Paulo), em pt-BR**.
(6) Peça que o usuário escolha o número do horário.
(7) Confirme o agendamento e retorne o protocolo. Encerre o atendimento.

Regras:
- Nunca invente dados: use apenas as ferramentas disponíveis.
- Se não houver médicos ou horários, diga claramente que não há e encerre.
- Respostas objetivas em português do Brasil.
`;

  private tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'listDoctorsBySpecialtyCity',
        description:
          'Lista TODOS os médicos de uma especialidade em uma cidade (sem filtrar por disponibilidade).',
        parameters: {
          type: 'object',
          required: ['specialtyId', 'city'],
          properties: {
            specialtyId: { type: 'string' },
            city: { type: 'string' },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'listAvailabilityByDoctor',
        description:
          'Lista horários disponíveis de um médico nos próximos 30 dias.',
        parameters: {
          type: 'object',
          required: ['doctorId'],
          properties: { doctorId: { type: 'string' } },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'createAppointmentFromAvailability',
        description:
          'Agenda a partir do availabilityId (deleta availability) e retorna protocolo.',
        parameters: {
          type: 'object',
          required: [
            'availabilityId',
            'doctorId',
            'patientName',
            'patientBirth',
          ],
          properties: {
            availabilityId: { type: 'string' },
            doctorId: { type: 'string' },
            patientName: { type: 'string' },
            patientBirth: { type: 'string', description: 'YYYY-MM-DD' },
          },
        },
      },
    },
  ];

  private parseIndex(msg: string, max: number): number | null {
    const m = msg.trim().match(/^(\d{1,3})$/);
    if (!m) return null;
    const n = Number(m[1]);
    if (n < 1 || n > max) return null;
    return n - 1;
  }

  private getSession(sessionId: string) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        history: [{ role: 'system', content: this.sys }],
        state: { step: 'collect_patient' },
      });
    }
    return this.sessions.get(sessionId)!;
  }

  async chat(sessionId: string, userMessage: string) {
    const session = this.getSession(sessionId);
    const { state, history } = session;

    // 1) Coleta/validação dos dados do paciente (novo parser)
    if (state.step === 'collect_patient') {
      if (!state.patientName || !state.patientBirth || !state.city) {
        // 1ª tentativa: CSV com vírgulas
        const csv = tryParsePatientCSV(userMessage);
        if (csv) {
          state.patientName = csv.patientName;
          state.patientBirth = csv.patientBirth; // ISO YYYY-MM-DD
          state.city = csv.city;
        } else {
          // 2ª tentativa: formato antigo com rótulos
          const labeled = tryParsePatientLabeled(userMessage);
          if (labeled) {
            state.patientName = labeled.patientName;
            state.patientBirth = labeled.patientBirth;
            state.city = labeled.city;
          } else {
            // 3ª tentativa: heurísticas simples (emergência)
            // Busca uma data pt-BR na frase e assume que o que vem antes é nome e o que vem depois é cidade, se separado por vírgulas
            const adHoc = tryParsePatientCSV(
              userMessage.replace(/\s{2,}/g, ' ').trim(),
            );
            if (adHoc) {
              state.patientName = adHoc.patientName;
              state.patientBirth = adHoc.patientBirth;
              state.city = adHoc.city;
            }
          }
        }
      }

      if (!state.patientName || !state.patientBirth || !state.city) {
        const ask =
          'Por favor, informe **neste formato**: `Nome completo, DD/MM/AAAA, Cidade`.\nEx.: `Maria Silva, 10/05/1990, Franca`.';
        history.push({ role: 'assistant', content: ask });
        return ask;
      }

      state.step = 'collect_specialty_reason';
      const ask = `Obrigado, ${state.patientName}. Qual a especialidade desejada e o motivo da consulta?`;
      history.push({ role: 'assistant', content: ask });
      return ask;
    }

    // 2) Especialidade + motivo
    if (state.step === 'collect_specialty_reason') {
      if (!state.specialtyId) {
        const spec = userMessage.trim();
        if (spec.length > 1) state.specialtyId = spec.toLowerCase();
      }
      if (!state.reason) state.reason = userMessage;

      if (!state.specialtyId) {
        const ask =
          'Qual especialidade? Ex.: cardiologia, ortopedia, ginecologia.';
        history.push({ role: 'assistant', content: ask });
        return ask;
      }

      const doctors = await this.appts.listDoctorsBySpecialtyCity(
        state.specialtyId,
        state.city!,
      );
      state.doctors = doctors.map((d) => ({ id: d.id, name: d.name }));

      if (!state.doctors.length) {
        const msg = `Não encontrei médicos de ${state.specialtyId} em ${state.city}. Encerrando.`;
        history.push({ role: 'assistant', content: msg });
        state.step = 'done';
        return msg;
      }

      state.step = 'choose_doctor';
      const list = state.doctors
        .map((d, i) => `${i + 1}. ${d.name}`)
        .join('\n');
      const ask = `Escolha o médico (digite o número):\n${list}`;
      history.push({ role: 'assistant', content: ask });
      return ask;
    }

    // 3) Escolher médico -> listar horários com TZ BR
    if (state.step === 'choose_doctor') {
      const idx = this.parseIndex(userMessage, state.doctors!.length);
      if (idx === null) {
        const ask = `Por favor, digite um número de 1 a ${state.doctors!.length}.`;
        history.push({ role: 'assistant', content: ask });
        return ask;
      }
      const chosen = state.doctors![idx];
      state.selectedDoctorId = chosen.id;

      const slots = await this.appts.listAvailabilityByDoctor(
        state.selectedDoctorId,
      );

      state.slots = slots.map((s) => ({
        id: s.id,
        // guardamos ISO UTC aqui; exibimos sempre com TZ BR
        dateISO: s.date.toISOString(),
      }));

      if (!state.slots.length) {
        const msg = `Para ${chosen.name}, não há vagas no período de 30 dias. Deseja tentar outro médico?`;
        history.push({ role: 'assistant', content: msg });
        return msg;
      }

      state.step = 'choose_slot';
      const list = state.slots
        .map((s, i) => {
          const dt = new Date(s.dateISO);
          return `${i + 1}. ${formatDateTimeBR(dt)}`;
        })
        .join('\n');
      const ask = `Escolha o horário (digite o número):\n${list}`;
      history.push({ role: 'assistant', content: ask });
      return ask;
    }

    // 4) Escolher horário -> criar agendamento
    if (state.step === 'choose_slot') {
      const idx = this.parseIndex(userMessage, state.slots!.length);
      if (idx === null) {
        const ask = `Por favor, digite um número de 1 a ${state.slots!.length}.`;
        history.push({ role: 'assistant', content: ask });
        return ask;
      }
      const chosen = state.slots![idx];
      state.selectedAvailabilityId = chosen.id;

      // Converter nascimento ISO (YYYY-MM-DD) → Date (meia-noite local não importa; Date é UTC)
      const birthDate = new Date(`${state.patientBirth!}T00:00:00Z`);

      const appt = await this.appts.createAppointmentFromAvailability({
        availabilityId: state.selectedAvailabilityId,
        doctorId: state.selectedDoctorId!,
        patientName: state.patientName!, // apenas o nome limpo
        patientBirth: birthDate,
      });

      state.step = 'done';
      const msg = `Agendamento confirmado! Protocolo: ${appt.protocol}. Data: ${formatDateTimeBR(new Date(appt.date))}.`;
      history.push({ role: 'assistant', content: msg });
      return msg;
    }

    const done =
      'Atendimento encerrado. Se precisar de algo mais, é só chamar.';
    history.push({ role: 'assistant', content: done });
    return done;
  }
}
