import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/common/prisma.service';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const requestuser = request.user;

    if (!requestuser) return false;

    /*
    Escolhi a abordagem de buscar a permissão do usuário no banco de dados,
    pois assim, caso a permissão do usuário seja alterada, a mudança será
    refletida imediatamente.
    */

    const user = await this.prisma.user.findUnique({
      where: { id: requestuser.userId },
      select: { role: true },
    });

    return requiredRoles.some((role) => user.role.includes(role));
  }
}
