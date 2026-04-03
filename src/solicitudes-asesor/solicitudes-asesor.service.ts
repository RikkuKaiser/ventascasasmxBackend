import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudAsesor } from '../entities/solicitud-asesor.entity';
import { CreateSolicitudAsesorDto } from './dto/create-solicitud-asesor.dto';

@Injectable()
export class SolicitudesAsesorService {
  constructor(
    @InjectRepository(SolicitudAsesor)
    private readonly repo: Repository<SolicitudAsesor>,
  ) {}

  async create(dto: CreateSolicitudAsesorDto) {
    const telefono = dto.telefono.replace(/\s/g, '').trim();
    const row = this.repo.create({
      nombreCompleto: dto.nombreCompleto.trim(),
      email: dto.email.trim().toLowerCase(),
      telefono,
      ciudad: dto.ciudad.trim(),
      perfil: dto.perfil,
      nombreInmobiliaria:
        dto.perfil === 'inmobiliaria'
          ? (dto.nombreInmobiliaria ?? '').trim()
          : '',
      experiencia: dto.experiencia,
      mensaje: dto.mensaje.trim(),
    });
    await this.repo.save(row);
    return {
      id: row.id,
      creadoEn: row.creadoEn.toISOString(),
    };
  }
}
