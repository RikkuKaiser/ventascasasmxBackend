import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inmueble } from '../entities/inmueble.entity';
import { InmuebleArchivo } from '../entities/inmueble-archivo.entity';
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
  publicacionInmueble?: Record<string, unknown>;
  archivos?: {
    id: number;
    tipo: string;
    url: string;
    objectPath: string | null;
    sortOrder: number;
  }[];
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

const videoMime = /^video\/(mp4|webm|quicktime|mpeg|x-msvideo)$/i;

function extFromVideoMime(mimetype: string): string {
  const map: Record<string, string> = {
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
    'video/mpeg': '.mpeg',
    'video/x-msvideo': '.avi',
  };
  return map[mimetype.toLowerCase()] ?? '.bin';
}

function sortArchivosParaRespuesta(
  rows: InmuebleArchivo[],
): NonNullable<InmuebleResponse['archivos']> {
  const tipoRank = (t: string) =>
    t === 'principal' ? 0 : t === 'galeria' ? 1 : 2;
  return [...rows]
    .sort(
      (a, b) =>
        tipoRank(a.tipo) - tipoRank(b.tipo)
        || a.sortOrder - b.sortOrder
        || a.id - b.id,
    )
    .map((a) => ({
      id: a.id,
      tipo: a.tipo,
      url: a.url,
      objectPath: a.objectPath,
      sortOrder: a.sortOrder,
    }));
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
  if (i.publicacionInmueble && typeof i.publicacionInmueble === 'object')
    base.publicacionInmueble = i.publicacionInmueble as Record<string, unknown>;
  if (i.archivos?.length)
    base.archivos = sortArchivosParaRespuesta(i.archivos);
  return base;
}

export type CreateInmuebleFiles = {
  principal?: Express.Multer.File;
  galeria?: Express.Multer.File[];
  videos?: Express.Multer.File[];
};

@Injectable()
export class InmueblesService {
  constructor(
    @InjectRepository(Inmueble)
    private readonly repo: Repository<Inmueble>,
    @InjectRepository(InmuebleArchivo)
    private readonly archivosRepo: Repository<InmuebleArchivo>,
    private readonly gcs: GcsService,
  ) {}

  async findAll(): Promise<InmuebleResponse[]> {
    const list = await this.repo.find({ order: { titulo: 'ASC' } });
    return list.map(toDto);
  }

  async findOne(id: number): Promise<InmuebleResponse> {
    const i = await this.repo.findOne({
      where: { id },
      relations: { archivos: true },
    });
    if (!i) throw new NotFoundException('Inmueble no encontrado');
    return toDto(i);
  }

  async create(
    dto: CreateInmuebleDto,
    files?: CreateInmuebleFiles,
  ): Promise<InmuebleResponse> {
    const principalFile = files?.principal;
    const galeriaFiles = files?.galeria?.filter(Boolean) ?? [];
    const videoFiles = files?.videos?.filter(Boolean) ?? [];
    const hasUpload = !!(principalFile || galeriaFiles.length || videoFiles.length);

    if (hasUpload && !this.gcs.isEnabled()) {
      throw new BadRequestException(
        'Subida de archivos no disponible: en el API configura Google Cloud Storage (GCS_BUCKET y GCS_CREDENTIALS_JSON en una línea, o GOOGLE_APPLICATION_CREDENTIALS apuntando al JSON de la cuenta de servicio).',
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
      publicacionInmueble: dto.publicacionInmueble
        ? (instanceToPlain(dto.publicacionInmueble) as Record<string, unknown>)
        : null,
    });

    let saved = await this.repo.save(row);

    const archivosRows: InmuebleArchivo[] = [];
    let galeriaSort = 1;

    if (principalFile) {
      const ext = extFromMime(principalFile.mimetype);
      const objectPath = `${saved.id}/img/principal${ext}`;
      const url = await this.gcs.uploadInmuebleMedia(
        saved.id,
        'img',
        `principal${ext}`,
        principalFile.buffer,
        principalFile.mimetype,
      );
      saved.imagen = url;
      archivosRows.push(
        this.archivosRepo.create({
          inmuebleId: saved.id,
          tipo: 'principal',
          url,
          objectPath,
          sortOrder: 0,
        }),
      );
    }
    else {
      archivosRows.push(
        this.archivosRepo.create({
          inmuebleId: saved.id,
          tipo: 'principal',
          url: imagenUrl,
          objectPath: null,
          sortOrder: 0,
        }),
      );
    }

    for (const u of galeriaFromDto) {
      archivosRows.push(
        this.archivosRepo.create({
          inmuebleId: saved.id,
          tipo: 'galeria',
          url: u,
          objectPath: null,
          sortOrder: galeriaSort++,
        }),
      );
    }

    const galUrls = [...galeriaFromDto];
    for (let i = 0; i < galeriaFiles.length; i++) {
      const f = galeriaFiles[i];
      const ext = extFromMime(f.mimetype);
      const objectPath = `${saved.id}/img/galeria-${i}${ext}`;
      const url = await this.gcs.uploadInmuebleMedia(
        saved.id,
        'img',
        `galeria-${i}${ext}`,
        f.buffer,
        f.mimetype,
      );
      galUrls.push(url);
      archivosRows.push(
        this.archivosRepo.create({
          inmuebleId: saved.id,
          tipo: 'galeria',
          url,
          objectPath,
          sortOrder: galeriaSort++,
        }),
      );
    }
    if (galUrls.length) saved.galeria = galUrls;
    else saved.galeria = null;

    const uploadedVideoUrls: string[] = [];
    let videoSort = 0;
    for (let i = 0; i < videoFiles.length; i++) {
      const f = videoFiles[i];
      if (!videoMime.test(f.mimetype)) {
        throw new BadRequestException(
          `Video no permitido (${f.mimetype}). Usa MP4, WebM, MOV, MPEG o AVI.`,
        );
      }
      const ext = extFromVideoMime(f.mimetype);
      const objectPath = `${saved.id}/videos/archivo-${i}${ext}`;
      const url = await this.gcs.uploadInmuebleMedia(
        saved.id,
        'videos',
        `archivo-${i}${ext}`,
        f.buffer,
        f.mimetype,
      );
      uploadedVideoUrls.push(url);
      archivosRows.push(
        this.archivosRepo.create({
          inmuebleId: saved.id,
          tipo: 'video',
          url,
          objectPath,
          sortOrder: videoSort++,
        }),
      );
    }

    if (uploadedVideoUrls.length) {
      if (
        saved.terrenoCampestre
        && typeof saved.terrenoCampestre === 'object'
      ) {
        saved.terrenoCampestre = {
          ...(saved.terrenoCampestre as Record<string, unknown>),
          videos: uploadedVideoUrls,
        } as typeof saved.terrenoCampestre;
      } else if (
        saved.publicacionInmueble
        && typeof saved.publicacionInmueble === 'object'
      ) {
        saved.publicacionInmueble = {
          ...(saved.publicacionInmueble as Record<string, unknown>),
          videos: uploadedVideoUrls,
        } as typeof saved.publicacionInmueble;
      } else {
        saved.publicacionInmueble = { videos: uploadedVideoUrls };
      }
    }

    saved = await this.repo.save(saved);
    if (archivosRows.length)
      await this.archivosRepo.save(archivosRows);

    const conArchivos = await this.repo.findOne({
      where: { id: saved.id },
      relations: { archivos: true },
    });
    return toDto(conArchivos ?? saved);
  }
}
