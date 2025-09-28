import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthorizationStatus } from '@prisma/client';
import OpenAI from 'openai';
import { OPENAI } from './openai.provider';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuthorizeResponseDTO, ProcedureDecisionDTO } from './dtos/exams.dto';
import pdfParse from 'pdf-parse';
import sharp from 'sharp';

@Injectable()
export class ExamsAuthService {
  constructor(
    @Inject(OPENAI) private readonly openai: OpenAI,
    private readonly prisma: PrismaService,
  ) {}

  private async generateUniqueProtocol(): Promise<string> {
    const year = new Date().getFullYear();
    let protocol: string;
    for (let i = 0; i < 5; i++) {
      const random = Math.floor(100000 + Math.random() * 900000);
      protocol = `${year}${random}`;
      const exists = await this.prisma.examAuthorization.findUnique({
        where: { protocol },
      });
      if (!exists) return protocol;
    }
    return `${year}${Date.now().toString().slice(-6)}`;
  }

  private normalizeDate(input?: string): string | undefined {
    if (!input) return undefined;
    const trimmed = input.trim();
    if (!trimmed) return undefined;
    // Formato DD/MM/AAAA
    const dmy = /^(\d{2})[\/](\d{2})[\/](\d{4})$/;
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
    let year: string, month: string, day: string;
    if (dmy.test(trimmed)) {
      const m = trimmed.match(dmy)!;
      day = m[1];
      month = m[2];
      year = m[3];
    } else if (iso.test(trimmed)) {
      const m = trimmed.match(iso)!;
      year = m[1];
      month = m[2];
      day = m[3];
    } else {
      return undefined; // formato não suportado
    }
    // validação básica
    if (Number(month) < 1 || Number(month) > 12) return undefined;
    if (Number(day) < 1 || Number(day) > 31) return undefined;
    return `${year}-${month}-${day}`;
  }

  async processFileAndAuthorize(
    file: Express.Multer.File,
  ): Promise<AuthorizeResponseDTO> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Arquivo vazio ou inválido.');
    }

    // Validação de tamanho do arquivo (10MB max)
    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.buffer.length > maxSizeInBytes) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB.`,
      );
    }

    // Validação de tipos de arquivo aceitos
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'application/pdf',
    ];

    const fileExtension = file.originalname?.toLowerCase().split('.').pop();
    const allowedExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'bmp',
      'webp',
      'pdf',
    ];

    if (
      !allowedMimeTypes.includes(file.mimetype) ||
      !allowedExtensions.includes(fileExtension)
    ) {
      throw new BadRequestException(
        'Tipo de arquivo não suportado. Aceitos: imagens (JPG, JPEG, PNG, GIF, BMP, WEBP) e PDF.',
      );
    }

    const isPdf = file.mimetype === 'application/pdf';

    // 1) Extrair conteúdo do arquivo de forma otimizada
    let extractedContent: string;
    let optimizedImageBuffer: Buffer | null = null;

    if (isPdf) {
      // Extrair texto do PDF localmente
      try {
        const pdfData = await pdfParse(file.buffer);
        extractedContent = pdfData.text;

        if (extractedContent.length === 0) {
          throw new BadRequestException(
            'Não foi possível extrair texto do PDF. Verifique se o arquivo não está corrompido ou protegido.',
          );
        }

        // Limitar o tamanho do texto extraído para não exceder tokens
        if (extractedContent.length > 15000) {
          extractedContent = extractedContent.substring(0, 15000) + '...';
        }
      } catch (error) {
        throw new BadRequestException(
          'Erro ao processar PDF: ' +
            ((error as Error)?.message || 'Arquivo inválido'),
        );
      }
    } else {
      // Otimizar imagem para reduzir tokens
      try {
        optimizedImageBuffer = await sharp(file.buffer)
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
      } catch (error) {
        throw new BadRequestException(
          'Erro ao processar imagem: ' +
            ((error as Error)?.message || 'Arquivo inválido'),
        );
      }
    }

    // 2) Prompt otimizado focado apenas no essencial
    const prompt = [
      'Você é um extrator médico especializado.',
      'TAREFA: Extrair APENAS procedimentos/exames médicos, nome completo do paciente e data de nascimento (quando disponível). Se houver data do documento (emissão) inclua também.',
      'FORMATO DE RESPOSTA: JSON exato no formato: {"patient": {"name": "string|null", "birthDate": "AAAA-MM-DD|null"}, "procedures": [{"name": "string", "qty": number}]}',
      'REGRAS:',
      '- Extrair apenas nomes de procedimentos/exames claramente visíveis',
      '- Nome do paciente se estiver presente',
      '- birthDate: aceitar formatos DD/MM/AAAA ou AAAA-MM-DD e converter para AAAA-MM-DD',
      '- Não inventar informações',
      '- Ignorar outras informações médicas',
      '- Retornar APENAS o JSON, sem explicações',
    ].join('\n');

    let resp: any;

    try {
      if (isPdf) {
        // Para PDFs: usar apenas o texto extraído
        resp = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini', // Usar modelo mais econômico para texto
          messages: [
            { role: 'system', content: prompt },
            {
              role: 'user',
              content: `Texto extraído do documento médico:\n\n${extractedContent}`,
            },
          ],
          max_tokens: 500, // Limitar resposta
          temperature: 0, // Mais determinístico
        });
      } else {
        // Para imagens: usar imagem otimizada
        resp = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini', // Usar modelo mais econômico
          messages: [
            { role: 'system', content: prompt },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extrair procedimentos e nome do paciente desta imagem médica:',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`,
                    detail: 'low', // Usar detail baixo para economizar tokens
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0,
        });
      }
    } catch (error) {
      if (
        (error as Error)?.message?.includes('429') ||
        (error as Error)?.message?.includes('tokens')
      ) {
        throw new BadRequestException(
          'Arquivo muito complexo para processar. Tente com um arquivo menor ou mais simples.',
        );
      }
      throw error;
    }

    // 3) Processar resposta JSON
    const jsonText = resp.choices?.[0]?.message?.content || '{}';

    let payload: any;
    try {
      const cleanJson = jsonText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      payload = JSON.parse(cleanJson);
    } catch {
      payload = { procedures: [] };
    }

    const procedures: Array<{ name: string; qty?: number }> =
      payload?.procedures ?? [];
    const patient = payload?.patient ?? {};

    // 4) Para cada procedimento, procurar no banco (case-insensitive)
    const decisions: ProcedureDecisionDTO[] = [];
    for (const proc of procedures) {
      const inputName = (proc.name || '').trim();
      if (!inputName) continue;

      const exam = await this.prisma.exam.findFirst({
        where: { name: { equals: inputName, mode: 'insensitive' } },
      });

      if (!exam) {
        decisions.push({
          inputName,
          decision: 'DENIED_NO_COVER',
          reason:
            'Não encontrado na base de procedimentos (sem cobertura cadastrada).',
        });
        continue;
      }

      // 5) Aplica as regras de decisão
      if (exam.audit === false) {
        decisions.push({
          inputName,
          matchedExamId: exam.id,
          matchedName: exam.name,
          decision: 'AUTHORIZED',
          reason:
            'Coberto pelo plano e sem necessidade de auditoria. Autorizado automaticamente.',
        });
      } else if (exam.audit === true && exam.opme === false) {
        decisions.push({
          inputName,
          matchedExamId: exam.id,
          matchedName: exam.name,
          decision: 'PENDING_AUDIT_5D',
          reason: 'Necessita auditoria. Prazo estimado de retorno: 5 dias.',
          slaDays: 5,
        });
      } else {
        decisions.push({
          inputName,
          matchedExamId: exam.id,
          matchedName: exam.name,
          decision: 'PENDING_AUDIT_10D',
          reason:
            'Necessita auditoria com OPME. Prazo estimado de retorno: 10 dias.',
          slaDays: 10,
        });
      }
    }

    const normalizedBirth = this.normalizeDate(patient?.birthDate);

    const protocolBatch = await this.generateUniqueProtocol();

    const proceduresWithProtocols = [];
    for (const d of decisions) {
      let status: AuthorizationStatus = AuthorizationStatus.PENDING;
      if (d.decision === 'AUTHORIZED') status = AuthorizationStatus.APPROVED;
      else if (d.decision === 'DENIED_NO_COVER')
        status = AuthorizationStatus.DENIED;
      else status = AuthorizationStatus.PENDING; // pendências de auditoria

      const protocol = await this.generateUniqueProtocol();
      await this.prisma.examAuthorization.create({
        data: {
          protocol,
          pacientName: patient?.name || 'DESCONHECIDO',
          pacientBirth: normalizedBirth
            ? new Date(normalizedBirth)
            : new Date('1970-01-01'),
          status,
        },
      });
      proceduresWithProtocols.push({ ...d, protocol });
    }

    return {
      patient: {
        name: patient?.name,
        birthDate: normalizedBirth,
      },
      procedures: proceduresWithProtocols,
      source: 'gpt-json+db',
      protocolBatch,
    };
  }

  /**
   * Busca autorizações de exames por nome do paciente (case-insensitive) e data de nascimento.
   * Retorna somente protocolo e status conforme requisito.
   */
  async findAuthorizationsByPatient(name: string, birthDate: string) {
    const normalized = this.normalizeDate(birthDate);
    if (!normalized) {
      throw new BadRequestException(
        'Data de nascimento inválida. Use DD/MM/AAAA ou AAAA-MM-DD',
      );
    }

    const dateObj = new Date(normalized);
    // Ignorar parte de hora comparando somente a data (UTC vs local). Como persistimos Date sem hora relevante,
    // compararemos intervalo do dia.
    const start = new Date(dateObj);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateObj);
    end.setHours(23, 59, 59, 999);

    const results = await this.prisma.examAuthorization.findMany({
      where: {
        pacientName: { equals: name, mode: 'insensitive' },
        pacientBirth: { gte: start, lte: end },
      },
      select: { protocol: true, status: true },
      orderBy: { createdAt: 'desc' },
      take: 50, // pequena salvaguarda
    });

    return results.map((r) => ({ protocol: r.protocol, status: r.status }));
  }
}
