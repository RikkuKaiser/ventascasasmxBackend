import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inmueble } from '../entities/inmueble.entity';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';

export type InmuebleResponse = {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: string;
  ciudad: string;
  zona: string;
  m2Superficie: number;
  m2Construccion: number;
  habitaciones: number;
  banos: number;
  destacado: boolean;
  etiquetas: string[];
  imagen: string;
  galeria?: string[];
  tipoVivienda: string;
  estacionamientos: number;
  pisosVivienda?: number;
  pisoDepartamento?: number;
  pisosEdificio?: number;
  amenidades: string[];
  cuotaMantenimiento: number;
};

function toDto(i: Inmueble): InmuebleResponse {
  const base: InmuebleResponse = {
    id: i.id,
    titulo: i.titulo,
    descripcion: i.descripcion,
    precio: i.precio,
    moneda: i.moneda,
    ciudad: i.ciudad,
    zona: i.zona,
    m2Superficie: i.m2Superficie,
    m2Construccion: i.m2Construccion,
    habitaciones: i.habitaciones,
    banos: i.banos,
    destacado: i.destacado,
    etiquetas: i.etiquetas ?? [],
    imagen: i.imagen,
    tipoVivienda: i.tipoVivienda,
    estacionamientos: i.estacionamientos,
    amenidades: i.amenidades ?? [],
    cuotaMantenimiento: i.cuotaMantenimiento,
  };
  if (i.galeria?.length) base.galeria = i.galeria;
  if (i.pisosVivienda != null) base.pisosVivienda = i.pisosVivienda;
  if (i.pisoDepartamento != null) base.pisoDepartamento = i.pisoDepartamento;
  if (i.pisosEdificio != null) base.pisosEdificio = i.pisosEdificio;
  return base;
}

@Injectable()
export class InmueblesService {
  constructor(
    @InjectRepository(Inmueble)
    private readonly repo: Repository<Inmueble>,
  ) {}

  async findAll(): Promise<InmuebleResponse[]> {
    const list = await this.repo.find({ order: { titulo: 'ASC' } });
    return list.map(toDto);
  }

  async findOne(id: string): Promise<InmuebleResponse> {
    const i = await this.repo.findOne({ where: { id } });
    if (!i) throw new NotFoundException('Inmueble no encontrado');
    return toDto(i);
  }

  async create(dto: CreateInmuebleDto): Promise<InmuebleResponse> {
    const galeria =
      dto.galeria?.map((u) => u.trim()).filter(Boolean) ?? [];
    const row = this.repo.create({
      titulo: dto.titulo.trim(),
      descripcion: dto.descripcion.trim(),
      precio: dto.precio,
      moneda: (dto.moneda ?? 'MXN').trim().toUpperCase().slice(0, 8),
      ciudad: dto.ciudad.trim(),
      zona: dto.zona.trim(),
      m2Superficie: dto.m2Superficie,
      m2Construccion: dto.m2Construccion,
      habitaciones: dto.habitaciones,
      banos: dto.banos,
      destacado: dto.destacado ?? false,
      etiquetas: dto.etiquetas?.map((e) => e.trim()).filter(Boolean) ?? [],
      imagen: dto.imagen.trim(),
      galeria: galeria.length ? galeria : null,
      tipoVivienda: dto.tipoVivienda,
      estacionamientos: dto.estacionamientos,
      pisosVivienda: dto.pisosVivienda ?? null,
      pisoDepartamento: dto.pisoDepartamento ?? null,
      pisosEdificio: dto.pisosEdificio ?? null,
      amenidades:
        dto.amenidades?.map((a) => a.trim()).filter(Boolean) ?? [],
      cuotaMantenimiento: dto.cuotaMantenimiento ?? 0,
    });
    const saved = await this.repo.save(row);
    return toDto(saved);
  }
}
