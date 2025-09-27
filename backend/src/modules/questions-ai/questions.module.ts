// backend/src/modules/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { QuestionsAiController } from './questions.controller';
import { QuestionsAiService } from './questions.service';

@Module({
  imports: [ConfigModule],
  controllers: [QuestionsAiController],
  providers: [QuestionsAiService, PrismaService],
  exports: [QuestionsAiService],
})
export class QuestionsAiModule {}
