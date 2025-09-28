// src/modules/questions-ai/questions-ai.module.ts
import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { OpenAIProvider, OPENAI_PROVIDER } from './openai.provider';

@Module({
  controllers: [QuestionsController],
  providers: [
    OpenAIProvider,
    QuestionsService,
  ],
  exports: [OPENAI_PROVIDER, QuestionsService],
})
export class QuestionsAIModule {}
