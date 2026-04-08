import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inmueble } from '../entities/inmueble.entity';
import { instanceToPlain } from 'class-transformer';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { GcsService } from '../storage/gcs.service';

export type InmuebleResponse = {
  id: number;
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
  terrenoCampestre?: Record<string, unknown>;
};

function extFromMime(mimetype: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return map[mimetype.toLowerCase()] ?? '.bin';
}

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
  if (i.terrenoCampestre && typeof i.terrenoCampestre === 'object')
    base.terrenoCampestre = i.terrenoCampestre as Record<string, unknown>;
  return base;
}

export type CreateInmuebleFiles = {
  principal?: Express.Multer.File;
  galeria?: Express.Multer.File[];
};

@Injectable()
export class InmueblesService {
  constructor(
    @InjectRepository(Inmueble)
    private readonly repo: Repository<Inmueble>,
    private readonly gcs: GcsService,
  ) {}

  async findAll(): Promise<InmuebleResponse[]> {
    const list = await this.repo.find({ order: { titulo: 'ASC' } });
    return list.map(toDto);
  }

  async findOne(id: number): Promise<InmuebleResponse> {
    const i = await this.repo.findOne({ where: { id } });
    if (!i) throw new NotFoundException('Inmueble no encontrado');
    return toDto(i);
  }

  async create(
    dto: CreateInmuebleDto,
    files?: CreateInmuebleFiles,
  ): Promise<InmuebleResponse> {
    const principalFile = files?.principal;
    const galeriaFiles = files?.galeria?.filter(Boolean) ?? [];
    const hasUpload = !!(principalFile || galeriaFiles.length);

    if (hasUpload && !this.gcs.isEnabled()) {
      throw new BadRequestException(
        'Subida de archivos no disponible: configura GCS_BUCKET y credenciales en el servidor.',
      );
    }

    const imagenUrl = dto.imagen?.trim() ?? '';
    if (!imagenUrl && !principalFile) {
      throw new BadRequestException(
        'Indica la URL de la imagen principal o sube un archivo principal.',
      );
    }

    const galeriaFromDto =
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
      imagen: imagenUrl || 'pending-upload',
      galeria: galeriaFromDto.length ? galeriaFromDto : null,
      tipoVivienda: dto.tipoVivienda,
      estacionamientos: dto.estacionamientos,
      pisosVivienda: dto.pisosVivienda ?? null,
      pisoDepartamento: dto.pisoDepartamento ?? null,
      pisosEdificio: dto.pisosEdificio ?? null,
      amenidades:
        dto.amenidades?.map((a) => a.trim()).filter(Boolean) ?? [],
      cuotaMantenimiento: dto.cuotaMantenimiento ?? 0,
      terrenoCampestre: dto.terrenoCampestre
        ? (instanceToPlain(dto.terrenoCampestre) as Record<string, unknown>)
        : null,
    });

    let saved = await this.repo.save(row);

    if (principalFile) {
      const ext = extFromMime(principalFile.mimetype);
      const url = await this.gcs.uploadInmuebleObject(
        saved.id,
        `principal${ext}`,
        principalFile.buffer,
        principalFile.mimetype,
      );
      saved.imagen = url;
    }

    const galUrls = [...(saved.galeria ?? [])];
    for (let i = 0; i < galeriaFiles.length; i++) {
      const f = galeriaFiles[i];
      const ext = extFromMime(f.mimetype);
      const url = await this.gcs.uploadInmuebleObject(
        saved.id,
        `galeria/${i}${ext}`,
        f.buffer,
        f.mimetype,
      );
      galUrls.push(url);
    }
    if (galUrls.length) saved.galeria = galUrls;
    else saved.galeria = null;

    saved = await this.repo.save(saved);
    return toDto(saved);
  }
}
