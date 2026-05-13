import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CurrentUser, type JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';

@Controller('inmuebles/:inmuebleId/comentarios')
export class ComentariosController {
  constructor(private readonly comentarios: ComentariosService) {}

  @Public()
  @Get()
  list(@Param('inmuebleId', ParseIntPipe) inmuebleId: number) {
    return this.comentarios.listByInmueble(inmuebleId);
  }

  @Post()
  create(
    @Param('inmuebleId', ParseIntPipe) inmuebleId: number,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateComentarioDto,
  ) {
    return this.comentarios.create(inmuebleId, user.userId, dto);
  }
}
