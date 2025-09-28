// src/modules/questions-ai/questions-ai.module.ts
import { Module } from '@nestjs/common';
import OpenAI from 'openai';
import { QuestionsService } from './questions.service';
import { FlowsKnowledgeService } from './flows-knowledge.service';
import { QuestionsController } from './questions.controller';

export const OPENAI_PROVIDER = 'OPENAI';

@Module({
  controllers: [QuestionsController],
  providers: [
    {
      provide: OPENAI_PROVIDER,
      useFactory: () => {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY não definido no ambiente.');
        return new OpenAI({ apiKey });
      },
    },
    QuestionsService,
  ],
  exports: [OPENAI_PROVIDER, QuestionsService],
})
export class QuestionsAIModule {}
