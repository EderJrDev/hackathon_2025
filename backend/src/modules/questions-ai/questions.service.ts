import { Injectable, Inject } from '@nestjs/common';
import type OpenAI from 'openai';
import { OPENAI_PROVIDER } from './questions.module';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// -------------------- Tipos auxiliares --------------------
type InputDto = { message: string };

type FlowGuide = {
  steps_html?: string; // já em <li>...</li>
  obs_html?: string;   // já em <li>...</li>
  steps?: string;      // texto/markdown (fallback)
  obs?: string;        // texto/markdown (fallback)
};

type FlowItem = {
  key: string;
  title?: string;
  intents?: string[];
  patterns?: string[];
  guide?: FlowGuide;
};

type NormalizedFlows = {
  items: FlowItem[];
};

// -------------------- Prompt de sistema --------------------
const SYSTEM_PROMPT_HTML = `
Você é uma atendente humana chamada Ana.
Responda SEMPRE em HTML (sem Markdown), usando <section>, <h2>, <p>, <ol>, <ul>, <li>, <strong>.
Tom empático, claro e objetivo (pt-BR). Nunca peça dados pessoais; apenas explique “como fazer”.

Quando houver um assunto/fluxo reconhecido, responda exatamente neste formato:
<section style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.55;color:#0f172a">
  <h2 style="margin:0 0 8px">{{TITULO}}</h2>
  <ol style="margin:0 0 8px 18px">{{PASSOS_HTML}}</ol>
  <p style="margin:0 0 6px"><strong>Observações</strong></p>
  <ul style="margin:0 0 8px 18px">{{OBS_HTML}}</ul>
  <p style="margin:0;font-size:13px;color:#64748b">Precisa de ajuda com algum passo?</p>
</section>

Se NÃO houver fluxo específico, responda com uma saudação e a lista curta de assuntos:
<section style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.55;color:#0f172a">
  <p style="margin:0 0 8px"><strong>{{SAUDACAO}}</strong> 😊 Eu sou a Ana, posso te orientar passo a passo. Sobre qual assunto você precisa?</p>
  <p style="margin:8px 0 6px;font-size:13px;color:#475569">Posso orientar com:</p>
  <ul style="margin:0 0 8px 18px">{{TOPICOS_HTML}}</ul>
  <p style="margin:0;font-size:13px;color:#64748b">Pode escrever, por exemplo: “como agendar consulta” ou “preciso da 2ª via do boleto”.</p>
</section>

Regras:
- Se receber STEPS_HTML/OBS_HTML, use como está. Se vier apenas STEPS/OBS em texto, converta para <li>…</li>.
- NUNCA devolva nada fora de HTML.
`;

// -------------------- Utilitários --------------------
function saudacaoBR(date = new Date()) {
  const hora = Number(
    new Intl.DateTimeFormat('pt-BR', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'America/Sao_Paulo',
    }).format(date),
  );
  if (hora < 12) return 'Bom dia, tudo bem?';
  if (hora < 18) return 'Boa tarde, tudo bem?';
  return 'Boa noite, tudo bem?';
}

function normalizeFlows(raw: any): NormalizedFlows {
  // aceita formatos: { items: [...] } ou diretamente [...]
  const items: FlowItem[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
    ? raw.items
    : [];
  return { items };
}

function topicsList(items: FlowItem[]): string[] {
  return items.map((i) => i.title || i.key).slice(0, 12);
}

function tryMatchFlow(q: string, items: FlowItem[]): FlowItem | null {
  const text = (q || '').toLowerCase().trim();

  // 1) intents (match por inclusão)
  for (const it of items) {
    if (it.intents?.some((intent) => text.includes(intent.toLowerCase()))) {
      return it;
    }
  }

  // 2) patterns (regex)
  for (const it of items) {
    if (
      it.patterns?.some((p) => {
        try {
          return new RegExp(p, 'i').test(text);
        } catch {
          return false;
        }
      })
    ) {
      return it;
    }
  }

  // 3) heurística simples: palavras-chave por título
  for (const it of items) {
    const t = (it.title || it.key || '').toLowerCase();
    if (t && text.includes(t)) return it;
  }

  return null;
}

// -------------------- Carregar JSON sem resolveJsonModule --------------------
// OBS: para produção, garanta que o JSON seja copiado para a pasta dist.
// No Nest, adicione em "nest-cli.json":
// {
//   "compilerOptions": {
//     "assets": [{ "include": "**/*.json", "outDir": "dist" }],
//     "watchAssets": true
//   }
// }
function loadFlowsJson(): any {
  const candidates = [
    // quando compilado (dist)
    join(__dirname, 'flows.knowledge.json'),
    // quando rodando com ts-node na árvore de src
    join(process.cwd(), 'src/modules/questions-ai/flows.knowledge.json'),
    // alternativa comum (monorepo/backends)
    join(process.cwd(), 'backend/src/modules/questions-ai/flows.knowledge.json'),
    // fallback: dist em subpasta
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

  // Se não achar, retorne estrutura vazia (evita crash)
  return { items: [] };
}

// -------------------- Service --------------------
@Injectable()
export class QuestionsService {
  private readonly flows: NormalizedFlows;

  constructor(@Inject(OPENAI_PROVIDER) private readonly openai: OpenAI) {
    this.flows = normalizeFlows(loadFlowsJson());
  }

  /**
   * Recebe a mensagem do usuário, tenta identificar um fluxo correspondente
   * e chama a IA para formatar a resposta em HTML com tom de atendente.
   */
  async ask(dto: InputDto): Promise<string> {
    const assunto = (dto?.message ?? '').trim();
    const items = this.flows.items || [];
    const matched = tryMatchFlow(assunto, items);
    const saud = saudacaoBR();

    const ctx: string[] = [`SAUDACAO=${saud}`];

    if (matched) {
      const title = matched.title || matched.key;

      const stepsHtml = matched.guide?.steps_html?.trim();
      const obsHtml = matched.guide?.obs_html?.trim();
      const stepsTxt = matched.guide?.steps?.trim();
      const obsTxt = matched.guide?.obs?.trim();

      if (title) ctx.push(`FLUXO_TITULO=${title}`);
      if (stepsHtml) ctx.push(`STEPS_HTML=${stepsHtml}`);
      if (!stepsHtml && stepsTxt) ctx.push(`STEPS=${stepsTxt}`);
      if (obsHtml) ctx.push(`OBS_HTML=${obsHtml}`);
      if (!obsHtml && obsTxt) ctx.push(`OBS=${obsTxt}`);
    } else {
      const t = topicsList(items);
      ctx.push(`TOPICOS=${t.join('|')}`);
    }

    const userContent = [
      `Pergunta do usuário: ${assunto || '(vazio)'}`,
      `Contexto:\n${ctx.join('\n')}`,
      matched
        ? `Instruções:
- Monte a resposta no template do fluxo.
- {{TITULO}} = FLUXO_TITULO.
- Se houver STEPS_HTML/OBS_HTML, use diretamente.
- Se vier apenas STEPS/OBS em texto, converta em <li>…</li> preservando o conteúdo.
- Não invente políticas fora do que é padrão do fluxo.`
        : `Instruções:
- Não há fluxo específico; responda com saudação ({{SAUDACAO}}) e uma lista curta de assuntos.
- Gere {{TOPICOS_HTML}} como <li>Assunto</li> a partir de TOPICOS (separados por "|").`,
      `- Responda sempre em HTML (sem Markdown), conforme o SYSTEM_PROMPT_HTML.`,
    ].join('\n');

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_HTML },
        { role: 'user', content: userContent },
      ],
    });

    let html =
      completion.choices?.[0]?.message?.content?.trim() ||
      `<section><p>Desculpe, não consegui gerar a resposta.</p></section>`;

    // Substituição de placeholders (se vierem)
    html = html.replace(/{{SAUDACAO}}/g, saud);

    if (!matched) {
      // monta lista de tópicos se o modelo devolver placeholder
      const t = topicsList(items);
      const topicosHtml = t.map((x) => `<li><strong>${x}</strong></li>`).join('');
      html = html.replace(/{{TOPICOS_HTML}}/g, topicosHtml);
    } else {
      // segurança: se o modelo esquecer de montar <li>, tenta converter linhas simples
      html = html.replace(
        /{{PASSOS_HTML}}/g,
        (matched.guide?.steps_html ?? toLiList(matched.guide?.steps)).trim(),
      );
      html = html.replace(
        /{{OBS_HTML}}/g,
        (matched.guide?.obs_html ?? toLiList(matched.guide?.obs)).trim(),
      );
      html = html.replace(/{{TITULO}}/g, matched.title || matched.key);
    }

    return html;
  }
}

// Converte texto simples/markdown básico em <li>...</li> (fallback leve)
function toLiList(text?: string): string {
  if (!text) return '';
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-*\d.]+\s*/, '').trim())
    .filter(Boolean);
  return lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('');
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
