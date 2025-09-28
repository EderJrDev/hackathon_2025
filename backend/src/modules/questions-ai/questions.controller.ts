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
    // o service espera um objeto { message: string }
    const html = await this.svc.ask({ message: dto.message });
    // retorne HTML pronto para renderizar no front
    return { html };
  }
}
