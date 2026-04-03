import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from '../entities/favorito.entity';
import { Inmueble } from '../entities/inmueble.entity';

@Injectable()
export class FavoritosService {
  constructor(
    @InjectRepository(Favorito)
    private readonly favoritos: Repository<Favorito>,
    @InjectRepository(Inmueble)
    private readonly inmuebles: Repository<Inmueble>,
  ) {}

  async listIds(userId: string): Promise<string[]> {
    const rows = await this.favoritos.find({
      where: { userId },
      select: ['inmuebleId'],
    });
    return rows.map((r) => r.inmuebleId);
  }

  async toggle(
    userId: string,
    inmuebleId: string,
  ): Promise<{ ids: string[]; esFavorito: boolean }> {
    const existsInm = await this.inmuebles.exist({ where: { id: inmuebleId } });
    if (!existsInm) throw new NotFoundException('Inmueble no encontrado');
    const existing = await this.favoritos.findOne({
      where: { userId, inmuebleId },
    });
    if (existing) {
      await this.favoritos.remove(existing);
    } else {
      await this.favoritos.save(
        this.favoritos.create({ userId, inmuebleId }),
      );
    }
    const ids = await this.listIds(userId);
    return { ids, esFavorito: !existing };
  }
}
