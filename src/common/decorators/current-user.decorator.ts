import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type JwtUser = { userId: string; email: string };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const req = ctx.switchToHttp().getRequest<{ user: JwtUser }>();
    return req.user;
  },
);
