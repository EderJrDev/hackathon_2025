import { Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { UsersModule } from './modules';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { RolesGuard } from './modules/auth/roles/roles.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt.guard';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'users',
        module: UsersModule,
      },
      {
        path: 'login',
        module: AuthModule,
      },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    PrismaService,
  ],
})
export class AppModule {}
