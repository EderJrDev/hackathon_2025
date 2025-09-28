import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthorizeResponseDTO } from './dtos/exams.dto';
import { ExamsAuthService } from './exams.service';
import { Public } from '../auth/decorators/is-public.decorator';

@Controller('')
export class ExamsAuthController {
  constructor(private readonly svc: ExamsAuthService) {}

  @Public()
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async authorize(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AuthorizeResponseDTO> {
    return this.svc.processFileAndAuthorize(file);
  }
}
