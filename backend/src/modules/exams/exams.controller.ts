import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthorizeResponseDTO } from './dtos/exams.dto';
import { ExamsAuthService } from './exams.service';
import { Public } from '../auth/decorators/is-public.decorator';
import { ExamAuthorizationStatusDTO } from './dtos/exams.dto';

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

  @Public()
  @Get('authorizations')
  async getAuthorizations(
    @Query('name') name?: string,
    @Query('birthDate') birthDate?: string,
  ): Promise<ExamAuthorizationStatusDTO[]> {
    if (!name || !birthDate) {
      throw new BadRequestException(
        'Parâmetros obrigatórios: name e birthDate (DD/MM/AAAA ou AAAA-MM-DD)',
      );
    }
    return this.svc.findAuthorizationsByPatient(name, birthDate);
  }
}
