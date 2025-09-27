import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { FlowsKnowledge, FlowDef } from './flows.types';

@Injectable()
export class FlowsKnowledgeService {
  private readonly logger = new Logger(FlowsKnowledgeService.name);
  private data!: FlowsKnowledge;

  constructor() {
    const filePath =
      process.env.FLOWS_FILE ||
      join(process.cwd(), 'src', 'modules', 'questions-ai', 'flows.knowledge.json');
    this.logger.log(`Carregando base de fluxos: ${filePath}`);
    const raw = readFileSync(filePath, 'utf-8');
    this.data = JSON.parse(raw);
  }

  getAll(): FlowsKnowledge {
    return this.data;
  }

  getFlow(id: string): FlowDef | undefined {
    return this.data.flows.find((f) => f.id === id);
  }

  // --- roteador "atendente": normaliza, usa intents, patterns (regex) e título para pontuar ---
  private normalize(s: string) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  findFlowByIntent(userText: string): FlowDef | null {
    const textRaw = userText || '';
    const text = this.normalize(textRaw);

    let best: { flow: FlowDef; score: number } | null = null;

    for (const f of this.data.flows) {
      let score = 0;

      // 1) intents/sinônimos
      const intents = [...(f.intents || []), ...(f.synonyms || [])].map((k) =>
        this.normalize(k),
      );
      for (const k of intents) {
        if (!k) continue;
        if (text.includes(k)) score += Math.min(3, Math.ceil(k.split(' ').length / 2));
      }

      // 2) patterns (regex)
      const pats = (f as any).patterns as string[] | undefined;
      if (pats?.length) {
        for (const p of pats) {
          try {
            const re = new RegExp(p, 'i');
            if (re.test(textRaw) || re.test(text)) score += 5; // peso forte
          } catch {
            /* ignora regex inválida */
          }
        }
      }

      // 3) tokens do título ajudam quando o usuário fala só "consulta", "boleto" etc.
      const titleTokens = this.normalize(f.title).split(' ').filter(Boolean);
      let overlaps = 0;
      for (const t of titleTokens) if (text.includes(t)) overlaps++;
      score += overlaps * 0.5;

      if (!best || score > best.score) best = { flow: f, score };
    }

    // limiar mínimo para aceitar
    if (best && best.score >= 2) return best.flow;
    return null;
  }
}
