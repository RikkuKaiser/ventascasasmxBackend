import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, type JwtUser } from '../common/decorators/current-user.decorator';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';

@Controller('inmuebles/:inmuebleId/comentarios')
export class ComentariosController {
  constructor(private readonly comentarios: ComentariosService) {}

  @Get()
  list(@Param('inmuebleId', ParseIntPipe) inmuebleId: number) {
    return this.comentarios.listByInmueble(inmuebleId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Param('inmuebleId', ParseIntPipe) inmuebleId: number,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateComentarioDto,
  ) {
    return this.comentarios.create(inmuebleId, user.userId, dto);
  }
}
