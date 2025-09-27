import { Injectable } from '@nestjs/common';
import { FlowsKnowledgeService } from './flows-knowledge.service';
import type { FlowDef } from './flows.types';

type AskInput = { sessionId?: string; text: string; context?: Record<string, any> };
type AskOutput = { reply: string; flowId?: string; done?: boolean };

@Injectable()
export class QuestionsService {
  constructor(private readonly flows: FlowsKnowledgeService) {}

  // ===== Helpers =====
  private friendlyGreeting(text: string) {
    const t = (text || '').toLowerCase();
    if (/(oi|ol[aá]|boa (tarde|noite|dia))/.test(t)) return 'Oi! ';
    return '';
    }

  private formatGuide(flow: FlowDef) {
    const g = (flow as any).guide as
      | { steps: string[]; notes?: string[]; contact?: string; when_to_use?: string }
      | undefined;
    if (!g || !g.steps?.length) return null;

    const steps = g.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const notes = g.notes?.length ? `\n\nObservações:\n- ${g.notes.join('\n- ')}` : '';
    const contact = g.contact ? `\n\nSe precisar de uma mãozinha, fale com: ${g.contact}` : '';

    return `Claro! Vou te explicar o passo a passo de **${flow.title}**:\n\n${steps}${notes}${contact}`;
  }

  private matchQa(text: string, flow: FlowDef) {
    const qa = flow.qa_bank || [];
    const t = (text || '').toLowerCase();
    return qa.find((item) => t.includes((item.q || '').toLowerCase()));
  }

  // ===== Entrada principal consumida pelo controller =====
  async ask({ text }: AskInput): Promise<AskOutput> {
    const greeting = this.friendlyGreeting(text);

    // 1) Escolher o fluxo mais provável a partir do texto livre
    const flow = this.flows.findFlowByIntent(text);
    if (!flow) {
      const topics = this.flows.getAll().flows.map((f) => f.title).join(', ');
      return {
        reply: `${greeting}Desculpa, não consegui identificar o tema de cara. Posso ajudar com: ${topics}. Me diga em poucas palavras o que você precisa, tipo “minha fatura venceu” ou “como agendar consulta”.`,
      };
    }

    // 2) Se tiver guia, respondemos de forma humana e direta
    const guide = this.formatGuide(flow);
    if (guide) {
      return { reply: `${greeting}${guide}`, flowId: flow.id, done: true };
    }

    // 3) Caso não haja guia, tentar Q&A
    const qa = this.matchQa(text, flow);
    if (qa) return { reply: `${greeting}${qa.a}`, flowId: flow.id, done: true };

    // 4) Fallback amigável
    return {
      reply: `${greeting}Posso te orientar sobre **${flow.title}**. Se quiser, me pergunte “como fazer” que eu te passo o passo a passo.`,
      flowId: flow.id,
      done: true,
    };
  }
}
