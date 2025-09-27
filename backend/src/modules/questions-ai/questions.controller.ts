import { Body, Controller, Post } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Public } from '../auth/decorators/is-public.decorator';

@Controller('')
export class QuestionsController {
  constructor(private readonly qs: QuestionsService) {}

  @Public()
  @Post('ask')
  async ask(
    @Body()
    body: {
      sessionId?: string;
      text: string;
      context?: Record<string, any>;
    },
  ) {
    return this.qs.ask(body);
  }
}
