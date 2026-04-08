import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, type JwtUser } from '../common/decorators/current-user.decorator';
import { FavoritosService } from './favoritos.service';

@Controller('favoritos')
@UseGuards(AuthGuard('jwt'))
export class FavoritosController {
  constructor(private readonly favoritos: FavoritosService) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.favoritos.listIds(user.userId).then((ids) => ({ ids }));
  }

  @Post(':inmuebleId/toggle')
  toggle(
    @CurrentUser() user: JwtUser,
    @Param('inmuebleId', ParseIntPipe) inmuebleId: number,
  ) {
    return this.favoritos.toggle(user.userId, inmuebleId);
  }
}
