import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import OpenAI from 'openai';

function parseDob(text: string): Date | null {
  // captura formatos tipo 31/12/1990, 1/1/90 etc.
  const m = text.match(/(\b\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  let year = Number(y);
  if (year < 100) year += 1900 + (year < 50 ? 100 : 0); // heurística 2 dígitos
  const iso = `${year}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00.000Z`;
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? null : dt;
}

@Injectable()
export class QuestionsAiService {
  private openai: OpenAI;
  private model: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
    this.model = this.config.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  async startSession(dto: { name?: string; dob?: string }) {
    const dobDate = dto.dob ? parseDob(dto.dob) : null;

    const session = await this.prisma.chatSession.create({
      data: {
        name: dto.name || null,
        dob: dobDate,
        messages: {
          create: [
            {
              role: 'assistant',
              content:
                dto.name && dobDate
                  ? `Olá, ${dto.name}! Dados recebidos. Como posso ajudar hoje no chat de dúvidas?`
                  : 'Olá! Para começar, por favor, me informe seu nome e sua data de nascimento (ex.: 25/08/1983).',
            },
          ],
        },
      },
      include: { messages: true },
    });

    return {
      sessionId: session.id,
      firstMessage: session.messages[0],
    };
  }

  async handleMessage(sessionId: string, message: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new BadRequestException('Sessão não encontrada');

    // grava a mensagem do usuário
    await this.prisma.message.create({
      data: { sessionId, role: 'user', content: message },
    });

    // se ainda não temos nome/dob, tentar extrair agora
    let updatedName = session.name;
    let updatedDob = session.dob;

    if (!updatedName) {
      // heurística simples: pega primeira palavra com letra maiúscula (ajuste conforme UI)
      const nameMatch = message.match(
        /\b([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)\b/,
      );
      if (nameMatch) updatedName = nameMatch[1];
    }
    if (!updatedDob) updatedDob = parseDob(message) || null;

    if (
      updatedName !== session.name ||
      Number(updatedDob?.getTime() || 0) !== Number(session.dob?.getTime() || 0)
    ) {
      await this.prisma.chatSession.update({
        where: { id: sessionId },
        data: { name: updatedName, dob: updatedDob || null },
      });
    }

    // Prompt do "chat aberto de tira-dúvidas" — por enquanto, sem RAG
    // (depois conectamos ao RAG dos fluxos)
    const systemPrompt = [
      'Você é um atendente objetivo e didático do chat institucional.',
      'Comece confirmando nome e data de nascimento caso ainda não constem.',
      'Responda de forma curta e clara.',
      'Se a pergunta for sobre agendamento ou autorização, oriente que há fluxos específicos (ainda não habilitados nesta versão).',
    ].join(' ');

    const history = await this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 12, // janelinha de contexto
    });

    const messages = [
      { role: 'system', content: systemPrompt },
      // opcional: inserir um resumo de sessão
      {
        role: 'system',
        content: `Contexto sessão: nome=${updatedName ?? 'desconhecido'}; dob=${updatedDob?.toISOString() ?? 'desconhecida'}`,
      },
      ...history.map((m) => ({ role: m.role as any, content: m.content })),
    ];

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages as any,
      temperature: 0.2,
    });

    const assistantText =
      completion.choices[0]?.message?.content?.trim() ||
      'Certo. Como posso te ajudar?';

    const saved = await this.prisma.message.create({
      data: { sessionId, role: 'assistant', content: assistantText },
    });

    return {
      reply: saved.content,
      nameCaptured: updatedName || null,
      dobCaptured: updatedDob ? updatedDob.toISOString().split('T')[0] : null,
    };
  }

  async getHistory(sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new BadRequestException('Sessão não encontrada');
    return {
      session: {
        id: session.id,
        name: session.name,
        dob: session.dob,
        createdAt: session.createdAt,
      },
      messages: session.messages,
    };
  }
}
