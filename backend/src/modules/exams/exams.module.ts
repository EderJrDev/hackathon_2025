import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

import { OpenAIProvider } from './openai.provider';
import { ExamsAuthController } from './exams.controller';
import { ExamsAuthService } from './exams.service';

@Module({
  controllers: [ExamsAuthController],
  providers: [ExamsAuthService, OpenAIProvider, PrismaService],
  exports: [ExamsAuthService],
})
export class ExamsAuthModule {}
