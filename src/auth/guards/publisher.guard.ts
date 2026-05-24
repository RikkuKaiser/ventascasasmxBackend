import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { isPublisherEmail } from '../publisher-emails';

@Injectable()
export class PublisherGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    if (!isPublisherEmail(req.user?.email)) {
      throw new ForbiddenException(
        'No autorizado para publicar inmuebles.',
      );
    }
    return true;
  }
}
