// src/chat/chat.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { Public } from '../auth/decorators/is-public.decorator';

@Controller('')
export class ChatController {
  constructor(private readonly ai: AiOrchestratorService) {}

  @Public()
  @Post()
  async chat(@Body() body: { sessionId: string; message: string }) {
    const reply = await this.ai.chat(body.sessionId, body.message);
    return { reply };
  }
}
