import { Module } from '@nestjs/common';
import OpenAI from 'openai';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { AppointmentsModule } from '../appointments/appointments.module';
import { ChatController } from './ai-orchestrator.controller';

@Module({
  imports: [AppointmentsModule],
  providers: [
    {
      provide: OpenAI,
      useFactory: () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }),
    },
    AiOrchestratorService,
  ],
  controllers: [ChatController],
  exports: [AiOrchestratorService],
})
export class AppointmentsAiModule {}
