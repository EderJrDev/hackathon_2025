// src/ai/ai-orchestrator.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppointmentsService } from '../appointments/appointments.service';

type Msg = OpenAI.ChatCompletionMessageParam;

type SessionState = {
  step:
    | 'collect_patient' // 1) nome, nascimento, cidade
    | 'collect_specialty_reason' // 2) especialidade + motivo
    | 'choose_doctor' // 3) lista numerada de médicos -> usuário escolhe
    | 'choose_slot' // 4) lista numerada de slots -> usuário escolhe
    | 'done';

  // dados do paciente
  patientName?: string;
  patientBirth?: string; // ISO (YYYY-MM-DD)
  city?: string;

  // intenção
  specialtyId?: string; // você pode usar "cardiologia" como id legível se não tiver tabela de Specialty
  reason?: string;

  // escolhas
  doctors?: { id: string; name: string }[];
  slots?: { id: string; date: string }[];
  selectedDoctorId?: string;
  selectedAvailabilityId?: string;
};

@Injectable()
export class AiOrchestratorService {
  constructor(
    private readonly openai: OpenAI,
    private readonly appts: AppointmentsService,
  ) {}

  private sessions = new Map<string, { history: Msg[]; state: SessionState }>();

  private sys = `
Você é um agente de agendamento que segue estritamente este fluxo:
(1) Pergunte nome completo, data de nascimento (YYYY-MM-DD) e cidade. Só avance quando os três forem informados.
(2) Pergunte a especialidade e o motivo da consulta. Só avance quando ambos forem informados.
(3) Liste TODOS os médicos dessa especialidade na cidade (lista numerada 1..N, só nome do médico).
(4) Peça que o usuário escolha o número do médico.
(5) Liste as datas disponíveis do médico selecionado nos próximos 30 dias (lista numerada 1..N, formato ISO local: AAAA-MM-DD HH:mm).
(6) Peça que o usuário escolha o número do horário.
(7) Confirme o agendamento e retorne o protocolo. Encerre o atendimento.

Regras:
- Nunca invente dados: use apenas as ferramentas disponíveis.
- Se não houver médicos ou horários, diga claramente que não há e encerre.
- Use respostas objetivas em português do Brasil.
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

  // util: extrai 1..N
  private parseIndex(msg: string, max: number): number | null {
    const m = msg.trim().match(/^(\d{1,3})$/);
    if (!m) return null;
    const n = Number(m[1]);
    if (n < 1 || n > max) return null;
    return n - 1;
  }

  // cria/obtém sessão
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

    // 1) FSM: coleta/valida dados sem tool-calls
    if (state.step === 'collect_patient') {
      // tenta capturar tudo em um prompt (nome, nascimento, cidade)
      // Para robustez, peça explicitamente se faltar algo
      const needed: string[] = [];
      if (!state.patientName) needed.push('nome completo');
      if (!state.patientBirth) needed.push('data de nascimento (AAAA-MM-DD)');
      if (!state.city) needed.push('cidade');

      // tentativa simples de preencher campos
      if (!state.patientName && /nome[:\- ]/i.test(userMessage)) {
        const m = userMessage.match(/nome[:\- ](.+)/i);
        if (m) state.patientName = m[1].trim();
      }
      if (!state.patientBirth && /(\d{4}-\d{2}-\d{2})/.test(userMessage)) {
        state.patientBirth = userMessage.match(/(\d{4}-\d{2}-\d{2})/)![1];
      }
      if (!state.city && /cidade[:\- ]/i.test(userMessage)) {
        const m = userMessage.match(/cidade[:\- ](.+)/i);
        if (m) state.city = m[1].trim();
      }

      // fallback simples: se a msg for "nome; 1990-05-10; Franca"
      if (!state.patientName || !state.patientBirth || !state.city) {
        history.push({ role: 'user', content: userMessage });
        const missing = [];
        if (!state.patientName) missing.push('nome completo');
        if (!state.patientBirth)
          missing.push('data de nascimento (AAAA-MM-DD)');
        if (!state.city) missing.push('cidade');
        const ask = `Por favor, informe ${missing.join(', ')}. Exemplo: "Nome: Maria Silva; Nascimento: 1990-05-10; Cidade: Franca".`;
        history.push({ role: 'assistant', content: ask });
        return ask;
      }

      state.step = 'collect_specialty_reason';
      const ask = `Obrigado, ${state.patientName}. Qual a especialidade desejada e o motivo da consulta?`;
      history.push({ role: 'assistant', content: ask });
      return ask;
    }

    if (state.step === 'collect_specialty_reason') {
      // especialidade = qualquer string identificadora que você usa como specialtyId
      // motivo = texto livre
      console.log(
        'User message for specialty/reason:',
        state.specialtyId,
        userMessage,
      );
      if (!state.specialtyId) {
        // heurística: pega primeira palavra "cardiologia" etc.
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

      // chama tool: listDoctorsBySpecialtyCity
      const doctors = await this.appts.listDoctorsBySpecialtyCity(
        state.specialtyId,
        state.city!,
      );
      state.doctors = doctors.map((d) => ({ id: d.id, name: d.name }));
      console.log('Doctors found:', state.doctors);

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

    if (state.step === 'choose_doctor') {
      const idx = this.parseIndex(userMessage, state.doctors!.length);
      if (idx === null) {
        const ask = `Por favor, digite um número de 1 a ${state.doctors!.length}.`;
        history.push({ role: 'assistant', content: ask });
        return ask;
      }
      const chosen = state.doctors![idx];
      state.selectedDoctorId = chosen.id;

      // chama tool: listAvailabilityByDoctor (30 dias)
      const slots = await this.appts.listAvailabilityByDoctor(
        state.selectedDoctorId,
      );
      state.slots = slots.map((s) => ({
        id: s.id,
        date: s.date.toISOString(),
      }));
      console.log('Slots found:', state.slots);

      if (!state.slots.length) {
        const msg = `Para ${chosen.name}, não há vagas no período de 30 dias. Deseja tentar outro médico?`;
        history.push({ role: 'assistant', content: msg });
        // Você pode retornar ao passo choose_doctor aqui, se preferir.
        return msg;
      }

      state.step = 'choose_slot';
      const list = state.slots
        .map((s, i) => `${i + 1}. ${new Date(s.date).toLocaleString()}`)
        .join('\n');
      const ask = `Escolha o horário (digite o número):\n${list}`;
      history.push({ role: 'assistant', content: ask });
      return ask;
    }

    if (state.step === 'choose_slot') {
      const idx = this.parseIndex(userMessage, state.slots!.length);
      if (idx === null) {
        const ask = `Por favor, digite um número de 1 a ${state.slots!.length}.`;
        history.push({ role: 'assistant', content: ask });
        return ask;
      }
      const chosen = state.slots![idx];
      state.selectedAvailabilityId = chosen.id;

      // chama tool: createAppointmentFromAvailability
      const appt = await this.appts.createAppointmentFromAvailability({
        availabilityId: state.selectedAvailabilityId,
        doctorId: state.selectedDoctorId!,
        patientName: state.patientName!,
        patientBirth: new Date(state.patientBirth!),
      });

      state.step = 'done';
      const msg = `Agendamento confirmado! Protocolo: ${appt.protocol}. Data: ${new Date(appt.date).toLocaleString()}.`;
      history.push({ role: 'assistant', content: msg });
      return msg;
    }

    // done
    const done =
      'Atendimento encerrado. Se precisar de algo mais, é só chamar.';
    history.push({ role: 'assistant', content: done });
    return done;
  }
}
