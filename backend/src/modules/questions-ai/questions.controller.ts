import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { QuestionsService } from './questions.service';
import { Public } from '../auth/decorators/is-public.decorator';

class AskDto {
  @IsString()
  @MinLength(1)
  message!: string;
}

@Controller('')
export class QuestionsController {
  constructor(private readonly svc: QuestionsService) {}

  @Public()
  @Post('ask')
  async ask(@Body() dto: AskDto) {
    // O service agora pode responder com HTML ou uma diretiva de roteamento
    return this.svc.ask({ message: dto.message });
  }
}
