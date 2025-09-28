import { Module } from '@nestjs/common';

import { OpenAIProvider } from './openai.provider';
import { ExamsAuthController } from './exams.controller';
import { ExamsAuthService } from './exams.service';

@Module({
  controllers: [ExamsAuthController],
  providers: [ExamsAuthService, OpenAIProvider],
  exports: [ExamsAuthService],
})
export class ExamsAuthModule {}
