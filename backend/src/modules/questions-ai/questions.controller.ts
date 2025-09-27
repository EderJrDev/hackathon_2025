import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { QuestionsAiService } from './questions.service';
import { Public } from '../auth/decorators/is-public.decorator'; // ajuste o caminho se precisar

@Public()
@Controller('chat')
export class QuestionsAiController {
  constructor(private readonly chatService: QuestionsAiService) {}

  @Public()
  @Post('')
  start(@Body() dto: any) {
    return this.chatService.startSession(dto);
  }

  @Public()
  @Post('message')
  message(@Body() dto: any) {
    return this.chatService.handleMessage(dto.sessionId, dto.message);
  }

  @Public()
  @Get(':sessionId/history')
  history(@Param('sessionId') id: string) {
    return this.chatService.getHistory(id);
  }
}
