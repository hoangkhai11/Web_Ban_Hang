import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

type AuthedRequest = Request & { user?: AuthUser };

/**
 * Xác thực JWT gửi qua header "Authorization: Bearer <token>".
 * Kiểm tra lại người dùng trong DB để vai trò luôn là giá trị mới nhất (không tin dữ liệu client).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const [type, token] = (req.headers.authorization ?? '').split(' ');
    if (type !== 'Bearer' || !token) throw new UnauthorizedException('Vui lòng đăng nhập để tiếp tục');
    let payload: { sub: number };
    try {
      payload = await this.jwt.verifyAsync<{ sub: number }>(token);
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');
    req.user = { id: user.id, email: user.email, role: user.role };
    return true;
  }
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** Kiểm tra vai trò ở BACK-END — phải dùng sau JwtAuthGuard. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!roles?.length) return true;
    const user = ctx.switchToHttp().getRequest<AuthedRequest>().user;
    if (!user || !roles.includes(user.role)) throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<AuthedRequest>().user!,
);
