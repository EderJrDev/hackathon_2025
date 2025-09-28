import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// -------------------- Tipos --------------------
export type FlowGuide = {
  steps_html?: string; // já em <li>...</li>
  obs_html?: string;   // já em <li>...</li>
  steps?: string;      // texto/markdown (fallback)
  obs?: string;        // texto/markdown (fallback)
};

export type FlowItem = {
  key: string;
  title?: string;
  intents?: string[];
  patterns?: string[];
  guide?: FlowGuide;
};

export type NormalizedFlows = {
  items: FlowItem[];
};

export type MatchedFlow = FlowItem & {
  // campos prontos para uso
  steps_html?: string;
  obs_html?: string;
};

// -------------------- Helpers --------------------
function normalizeFlows(raw: any): NormalizedFlows {
  const items: FlowItem[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
    ? raw.items
    : [];
  return { items };
}

/**
 * Procura o arquivo JSON em caminhos comuns para dev e prod (dist).
 * Ajuste os caminhos conforme sua estrutura de pastas.
 */
function loadFlowsJson(): any {
  const candidates = [
    // quando compilado (dist)
    join(__dirname, 'flows.knowledge.json'),

    // quando rodando em ts-node (src)
    join(process.cwd(), 'src/modules/questions-ai/flows.knowledge.json'),

    // alternativa comum (backend/)
    join(process.cwd(), 'backend/src/modules/questions-ai/flows.knowledge.json'),

    // dist em subpasta
    join(process.cwd(), 'dist/modules/questions-ai/flows.knowledge.json'),
  ];

  for (const p of candidates) {
    try {
      if (existsSync(p)) {
        const raw = readFileSync(p, 'utf8');
        return JSON.parse(raw);
      }
    } catch {
      /* ignore */
    }
  }

  // fallback seguro
  return { items: [] };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Converte linhas de texto em <li>...</li> */
function toLiList(text?: string): string {
  if (!text) return '';
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-*\d.]+\s*/, '').trim())
    .filter(Boolean);
  return lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('');
}

/** Garante que steps/obs tenham versão HTML pronta */
function ensureGuideHtml(guide?: FlowGuide): { steps_html?: string; obs_html?: string } {
  if (!guide) return {};
  const steps_html = guide.steps_html?.trim() ?? toLiList(guide.steps);
  const obs_html = guide.obs_html?.trim() ?? toLiList(guide.obs);
  return { steps_html, obs_html };
}

// -------------------- Serviço --------------------
@Injectable()
export class FlowsKnowledgeService {
  private readonly data: NormalizedFlows;

  constructor() {
    this.data = normalizeFlows(loadFlowsJson());
  }

  /** Retorna todos os itens carregados do JSON */
  getAll(): FlowItem[] {
    return this.data.items ?? [];
  }

  /** Lista curta de tópicos para sugestão ao usuário */
  topicsList(): string[] {
    return (this.data.items ?? []).map((i) => i.title || i.key).slice(0, 12);
  }

  /** Busca um fluxo pelo key (ex.: 'agendamento_consultas') */
  getFlowByKey(key: string): FlowItem | null {
    const k = (key || '').toLowerCase().trim();
    return this.getAll().find((i) => (i.key || '').toLowerCase() === k) ?? null;
  }

  /**
   * Tenta casar a frase do usuário com algum fluxo via:
   * 1) intents (inclusão),
   * 2) patterns (regex),
   * 3) fallback por título.
   * Retorna o fluxo já com steps_html/obs_html garantidos.
   */
  matchFlow(text: string): MatchedFlow | null {
    const items = this.getAll();
    const q = (text || '').toLowerCase().trim();

    // 1) intents (inclusão)
    for (const it of items) {
      if (it.intents?.some((intent) => q.includes((intent || '').toLowerCase()))) {
        const { steps_html, obs_html } = ensureGuideHtml(it.guide);
        return { ...it, steps_html, obs_html };
      }
    }

    // 2) patterns (regex)
    for (const it of items) {
      if (
        it.patterns?.some((p) => {
          try {
            return new RegExp(p, 'i').test(q);
          } catch {
            return false;
          }
        })
      ) {
        const { steps_html, obs_html } = ensureGuideHtml(it.guide);
        return { ...it, steps_html, obs_html };
      }
    }

    // 3) fallback por título
    for (const it of items) {
      const t = (it.title || it.key || '').toLowerCase();
      if (t && q.includes(t)) {
        const { steps_html, obs_html } = ensureGuideHtml(it.guide);
        return { ...it, steps_html, obs_html };
      }
    }

    return null;
  }
}
