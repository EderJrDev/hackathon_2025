import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, RouterModule } from '@nestjs/core';

import { PrismaService } from './common/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { RolesGuard } from './modules/auth/roles/roles.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt.guard';
import { AppointmentsAiModule } from './modules/appointment-ai/ai-orchestrator.module';

// se você usa um barrel em ./modules que exporta só UsersModule, mantenha:
import { UsersModule } from './modules';

// 👇 IMPORTAÇÃO QUE FALTAVA
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ChatModule, // 👈 agora o símbolo existe

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
        path: 'chat',
        module: AppointmentsAiModule,
      },
    ]),

    AuthModule,
    UsersModule,
    AppointmentsAiModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    PrismaService,
  ],
})
export class AppModule {}
