import { Module } from '@nestjs/common';
import { FlowsKnowledgeService } from './flows-knowledge.service';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';

@Module({
  providers: [FlowsKnowledgeService, QuestionsService],
  controllers: [QuestionsController],
  exports: [FlowsKnowledgeService, QuestionsService],
})
export class QuestionsAiModule {}
