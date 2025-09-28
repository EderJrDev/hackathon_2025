export const ProceduresJsonSchema = {
  name: 'ProceduresExtraction',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      patient: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          birthDate: {
            type: 'string',
            description: 'DD/MM/AAAA ou AAAA-MM-DD',
          },
          docDate: { type: 'string', description: 'DD/MM/AAAA ou AAAA-MM-DD' },
        },
        required: [],
      },
      procedures: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
              description:
                'Nome do exame/procedimento como aparece no documento',
            },
            qty: {
              type: 'integer',
              description: 'Quantidade quando houver',
              minimum: 1,
            },
          },
          required: ['name'],
        },
      },
    },
    required: ['procedures'],
  },
};

export type ExamDecision =
  | 'AUTHORIZED'
  | 'DENIED_NO_COVER'
  | 'PENDING_AUDIT_5D'
  | 'PENDING_AUDIT_10D';

export class ProcedureDecisionDTO {
  inputName: string; // Nome capturado do PDF
  matchedExamId?: string; // ID do exam encontrado (se houver)
  matchedName?: string; // Nome exato salvo no banco
  decision: ExamDecision;
  reason: string; // Mensagem amigável
  slaDays?: number; // 5 ou 10 quando pendente
  protocol?: string; // Protocolo gerado e salvo em ExamAuthorization
}

export class AuthorizeResponseDTO {
  patient?: { name?: string; birthDate?: string };
  procedures: ProcedureDecisionDTO[];
  source: 'gpt-json+db';
  protocolBatch?: string; // Protocolo geral do arquivo (opcional caso queira um único para todo upload)
}
