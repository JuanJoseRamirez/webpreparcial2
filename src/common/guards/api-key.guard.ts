import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-api-key'] || req.headers['x-api-key'.toLowerCase()];
    const expected = process.env.ADMIN_TOKEN || 'secret-token';

    if (!token || token !== expected) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }
}
