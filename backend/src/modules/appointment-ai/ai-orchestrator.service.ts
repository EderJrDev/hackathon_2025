// src/ai/ai-orchestrator.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppointmentsService } from '../appointments/appointments.service';
import { SPECIALTY_MAPPINGS } from './dto/specialities.dto';

// Helpers de HTML simples para padronizar saída (similar ao QuestionsService)
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrapHtml(content: string) {
  return `\n<section style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.55;color:#0f172a">${content}</section>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 8px">${text}</p>`;
}

function small(text: string) {
  return `<p style="margin:0;font-size:13px;color:#64748b">${text}</p>`;
}

function numbered(items: string[]) {
  return `<ol style="margin:4px 0 12px 18px">${items
    .map((i) => `<li>${i}</li>`)
    .join('')}</ol>`;
}

function withExitHint(html: string) {
  return (
    html +
    small(
      'Digite <strong>sair</strong> a qualquer momento para cancelar o agendamento.',
    )
  );
}

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

// Mapeamento de variações de especialidades

function findSpecialtyFromInput(input: string): string | null {
  const cleanInput = input.toLowerCase().trim();

  // Busca direta primeiro
  for (const [specialty, variations] of Object.entries(SPECIALTY_MAPPINGS)) {
    if (variations.some((variation) => cleanInput.includes(variation))) {
      return specialty;
    }
  }

  // Se não encontrou, tenta extrair palavras-chave médicas
  const medicalKeywords = [
    'consulta',
    'médico',
    'doutor',
    'dr',
    'dra',
    'especialista',
    'problema',
    'dor',
    'exame',
    'tratamento',
    'sintomas',
  ];

  // Remove palavras comuns e tenta novamente
  const words = cleanInput
    .split(/\s+/)
    .filter((word) => word.length > 2 && !medicalKeywords.includes(word));

  for (const word of words) {
    for (const [specialty, variations] of Object.entries(SPECIALTY_MAPPINGS)) {
      if (
        variations.some(
          (variation) => variation.includes(word) || word.includes(variation),
        )
      ) {
        return specialty;
      }
    }
  }

  return null;
}

function extractSpecialtyAndReason(input: string): {
  specialty: string | null;
  reason: string;
} {
  const specialty = findSpecialtyFromInput(input);

  if (!specialty) {
    return { specialty: null, reason: input.trim() };
  }

  // Remove a especialidade encontrada do texto para obter o motivo
  let reason = input.toLowerCase();
  const specialtyVariations = SPECIALTY_MAPPINGS[specialty] || [];

  for (const variation of specialtyVariations) {
    reason = reason.replace(new RegExp(`\\b${variation}\\b`, 'gi'), '');
  }

  // Limpa o motivo removendo palavras vazias e conectores
  reason = reason
    .replace(
      /\b(com|para|de|da|do|em|na|no|por|consulta|médico|doutor|dr|dra|especialista)\b/gi,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim();

  // Se o motivo ficou muito curto ou vazio, usa o input original
  if (reason.length < 3) {
    reason = input.trim();
  }

  return { specialty, reason };
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
Você é um agente de agendamento de consultas médicas.
Siga estritamente este fluxo:

(1) Identificação do paciente
- Peça nome completo, data de nascimento e cidade neste formato: "Nome completo, DD/MM/AAAA, Cidade".
- Também aceite o formato antigo com rótulos: "Nome: ...; Nascimento: DD/MM/AAAA; Cidade: ...".
- Reconheça se o usuário digitar só parte dos dados e peça educadamente o que falta.
- Só avance quando os três forem informados.
- Aceite variações comuns (datas com traço ou barra, letras maiúsculas/minúsculas, espaços extras etc.).

(2) Especialidade e motivo da consulta
- Pergunte a especialidade desejada e o motivo da consulta.
- Aceite diferentes formas de se referir à especialidade (ex.: "cardiologista", "cardiologia", "médico do coração").
- O motivo pode ser informado junto (ex.: "cardiologista para dor no peito").
- Só avance quando pelo menos a especialidade for identificada.
- Se o motivo não for informado, prossiga assim mesmo.

(3) Lista de médicos disponíveis
- Liste TODOS os médicos dessa especialidade na cidade.
- Exiba em lista numerada (1..N) contendo apenas o nome do médico.

(4) Seleção do médico
- Peça que o usuário escolha o número do médico.
- Se o usuário digitar o nome do médico em vez do número, aceite também.

(5) Disponibilidade de horários
- Liste as datas e horários disponíveis do médico selecionado nos próximos 30 dias.
- Sempre no fuso horário de São Paulo (America/Sao_Paulo).
- Exiba no formato de data/hora em pt-BR.
- Exiba em lista numerada (1..N).
- Se não houver horários, informe claramente: "Não há vagas nos próximos 30 dias." e encerre o atendimento.

(6) Seleção do horário
- Peça que o usuário escolha o número do horário.
- Se o usuário responder digitando a data/hora completa, aceite também.

(7) Confirmação
- Confirme o agendamento com nome, especialidade, médico, data e horário.
- Retorne um número de protocolo gerado pelo sistema.
- Encerre o atendimento de forma cordial.

Regras gerais:
- Nunca invente dados: use apenas as ferramentas disponíveis.
- Seja flexível e interprete variações de escrita e linguagem natural.
- Sempre responda de forma objetiva, clara e em português do Brasil.
- Se faltar informação para seguir o fluxo, peça educadamente o que está faltando.
- Encerre sempre com uma mensagem simpática, como uma atendente faria.
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

    const lower = (userMessage || '').trim().toLowerCase();
    if (lower === 'sair' && state.step !== 'done') {
      state.step = 'done';
      const exitMsg = wrapHtml(
        paragraph('Agendamento cancelado conforme solicitado.') +
          small(
            'Se precisar iniciar novamente, é só mandar uma nova mensagem.',
          ),
      );
      history.push({ role: 'assistant', content: exitMsg });
      return exitMsg;
    }

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
        const ask = wrapHtml(
          withExitHint(
            paragraph(
              'Por favor, informe os dados no formato: <strong>Nome completo, DD/MM/AAAA, Cidade</strong>.',
            ) +
              paragraph(
                'Exemplo: <code>Maria Silva, 10/05/1990, Franca</code>.',
              ),
          ),
        );
        history.push({ role: 'assistant', content: ask });
        return ask;
      }

      state.step = 'collect_specialty_reason';
      const ask = wrapHtml(
        withExitHint(
          paragraph(
            `Obrigado, <strong>${escapeHtml(
              state.patientName,
            )}</strong>. Qual a especialidade desejada e o motivo da consulta?`,
          ),
        ),
      );
      history.push({ role: 'assistant', content: ask });
      return ask;
    }

    // 2) Especialidade + motivo
    if (state.step === 'collect_specialty_reason') {
      if (!state.specialtyId || !state.reason) {
        const extracted = extractSpecialtyAndReason(userMessage);

        if (extracted.specialty) {
          state.specialtyId = extracted.specialty;
        }

        if (extracted.reason && extracted.reason.length > 2) {
          state.reason = extracted.reason;
        } else if (!state.reason) {
          state.reason = userMessage.trim();
        }
      }

      if (!state.specialtyId) {
        const ask = wrapHtml(
          withExitHint(
            paragraph(
              'Qual especialidade desejada? <span style="font-size:13px;color:#475569">Ex.: cardiologista, ortopedia, gineco, médico do coração, etc.</span>',
            ),
          ),
        );
        history.push({ role: 'assistant', content: ask });
        return ask;
      }

      const doctors = await this.appts.listDoctorsBySpecialtyCity(
        state.specialtyId,
        state.city!,
      );
      state.doctors = doctors.map((d) => ({ id: d.id, name: d.name }));

      if (!state.doctors.length) {
        const msg = wrapHtml(
          paragraph(
            `Não encontrei médicos de <strong>${escapeHtml(
              state.specialtyId,
            )}</strong> em <strong>${escapeHtml(state.city!)}</strong>.`,
          ) + small('Atendimento encerrado.'),
        );
        history.push({ role: 'assistant', content: msg });
        state.step = 'done';
        return msg;
      }

      state.step = 'choose_doctor';
      const ask = wrapHtml(
        withExitHint(
          paragraph('Escolha o médico (digite o número):') +
            numbered(state.doctors.map((d) => escapeHtml(d.name))),
        ),
      );
      history.push({ role: 'assistant', content: ask });
      return ask;
    }

    // 3) Escolher médico -> listar horários com TZ BR
    if (state.step === 'choose_doctor') {
      const idx = this.parseIndex(userMessage, state.doctors!.length);
      if (idx === null) {
        const listHtml = numbered(
          state.doctors!.map((d) => escapeHtml(d.name)),
        );
        const ask = wrapHtml(
          withExitHint(
            paragraph(
              `Entrada inválida. Escolha um número de 1 a ${state.doctors!.length}:`,
            ) + listHtml,
          ),
        );
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
        const msg = wrapHtml(
          withExitHint(
            paragraph(
              `Para <strong>${escapeHtml(
                chosen.name,
              )}</strong> não há vagas no período de 30 dias. Deseja tentar outro médico?`,
            ),
          ),
        );
        history.push({ role: 'assistant', content: msg });
        return msg;
      }

      state.step = 'choose_slot';
      const ask = wrapHtml(
        withExitHint(
          paragraph('Escolha o horário (digite o número):') +
            numbered(
              state.slots.map((s) => {
                const dt = new Date(s.dateISO);
                return formatDateTimeBR(dt);
              }),
            ),
        ),
      );
      history.push({ role: 'assistant', content: ask });
      return ask;
    }

    // 4) Escolher horário -> criar agendamento
    if (state.step === 'choose_slot') {
      const idx = this.parseIndex(userMessage, state.slots!.length);
      if (idx === null) {
        const listHtml = numbered(
          state.slots!.map((s) => formatDateTimeBR(new Date(s.dateISO))),
        );
        const ask = wrapHtml(
          withExitHint(
            paragraph(
              `Entrada inválida. Escolha um número de 1 a ${state.slots!.length}:`,
            ) + listHtml,
          ),
        );
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
      const msg = wrapHtml(
        paragraph('Agendamento confirmado!') +
          paragraph(
            `Protocolo: <strong>${escapeHtml(
              appt.protocol,
            )}</strong><br>Data: <strong>${formatDateTimeBR(
              new Date(appt.date),
            )}</strong>.`,
          ) +
          small('Atendimento encerrado. Obrigado!'),
      );
      history.push({ role: 'assistant', content: msg });
      return msg;
    }

    const done = wrapHtml(
      paragraph(
        'Atendimento encerrado. Se precisar de algo mais, é só chamar.',
      ),
    );
    history.push({ role: 'assistant', content: done });
    return done;
  }
}
