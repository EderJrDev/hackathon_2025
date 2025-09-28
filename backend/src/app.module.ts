import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, RouterModule } from '@nestjs/core';

import { PrismaService } from './common/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { RolesGuard } from './modules/auth/roles/roles.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt.guard';
import { AppointmentsAiModule } from './modules/appointment-ai/ai-orchestrator.module';

import { UsersModule } from './modules';
import { QuestionsAiModule } from './modules/questions-ai/questions-ai.module';
import { ExamsAuthModule } from './modules/exams/exams.module';

@Module({
  imports: [
    QuestionsAiModule,
    ConfigModule.forRoot({ isGlobal: true }),
    RouterModule.register([
      {
        path: 'users',
        module: UsersModule,
      },
      {
        path: 'login',
        module: AuthModule,
      },
      {
        path: 'chat/appointment',
        module: AppointmentsAiModule,
      },
      {
        path: 'chat/exams',
        module: ExamsAuthModule,
      },
      {
        path: 'chat/questions',
        module: QuestionsAiModule,
      },
    ]),

    AuthModule,
    UsersModule,
    AppointmentsAiModule,
    ExamsAuthModule,
    QuestionsAiModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    PrismaService,
  ],
})
export class AppModule {}
