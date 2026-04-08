import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comentario } from '../entities/comentario.entity';
import { Inmueble } from '../entities/inmueble.entity';
import { User } from '../entities/user.entity';
import { CreateComentarioDto } from './dto/create-comentario.dto';

export type ComentarioResponse = {
  id: string;
  inmuebleId: number;
  userId: string;
  nombreUsuario: string;
  texto: string;
  creadoEn: string;
};

@Injectable()
export class ComentariosService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarios: Repository<Comentario>,
    @InjectRepository(Inmueble)
    private readonly inmuebles: Repository<Inmueble>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async listByInmueble(inmuebleId: number): Promise<ComentarioResponse[]> {
    const exists = await this.inmuebles.exist({ where: { id: inmuebleId } });
    if (!exists) throw new NotFoundException('Inmueble no encontrado');
    const rows = await this.comentarios.find({
      where: { inmuebleId },
      relations: ['user'],
      order: { creadoEn: 'DESC' },
    });
    return rows.map((c) => ({
      id: c.id,
      inmuebleId: c.inmuebleId,
      userId: c.userId,
      nombreUsuario: c.user.nombre,
      texto: c.texto,
      creadoEn: c.creadoEn.toISOString(),
    }));
  }

  async create(
    inmuebleId: number,
    userId: string,
    dto: CreateComentarioDto,
  ): Promise<ComentarioResponse> {
    const inmueble = await this.inmuebles.findOne({ where: { id: inmuebleId } });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const texto = dto.texto.trim();
    if (!texto) throw new BadRequestException('Escribe un comentario.');
    const c = this.comentarios.create({
      inmuebleId,
      userId,
      texto,
    });
    await this.comentarios.save(c);
    const withUser = await this.comentarios.findOne({
      where: { id: c.id },
      relations: ['user'],
    });
    if (!withUser) throw new NotFoundException();
    return {
      id: withUser.id,
      inmuebleId: withUser.inmuebleId,
      userId: withUser.userId,
      nombreUsuario: withUser.user.nombre,
      texto: withUser.texto,
      creadoEn: withUser.creadoEn.toISOString(),
    };
  }
}
