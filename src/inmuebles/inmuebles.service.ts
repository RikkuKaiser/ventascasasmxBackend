import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inmueble } from '../entities/inmueble.entity';
import { InmuebleArchivo } from '../entities/inmueble-archivo.entity';
import { instanceToPlain } from 'class-transformer';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { GcsService } from '../storage/gcs.service';
import {
  normalizeOperacion,
  operacionFromJson,
  type OperacionInmueble,
  withOperacionJson,
} from './operacion-inmueble';

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
  operacion: OperacionInmueble;
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

function videoUrlsFrom(
  json: Record<string, unknown> | null | undefined,
): string[] {
  const v = json?.videos;
  if (!Array.isArray(v)) return [];
  return v.filter(
    (x): x is string => typeof x === 'string' && x.trim().length > 0,
  );
}

function mergeVideoUrls(
  json: Record<string, unknown> | null,
  extra: string[],
): Record<string, unknown> | null {
  const all = [
    ...new Set([
      ...videoUrlsFrom(json),
      ...extra.map((u) => u.trim()).filter(Boolean),
    ]),
  ];
  if (!all.length) return json;
  return { ...(json ?? {}), videos: all };
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
  const operacion = normalizeOperacion(
    i.operacion ?? operacionFromJson(i.terrenoCampestre, i.publicacionInmueble),
  );
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
    operacion,
  };
  if (i.galeria?.length) base.galeria = i.galeria;
  if (i.pisosVivienda != null) base.pisosVivienda = i.pisosVivienda;
  if (i.pisoDepartamento != null) base.pisoDepartamento = i.pisoDepartamento;
  if (i.pisosEdificio != null) base.pisosEdificio = i.pisosEdificio;
  if (i.terrenoCampestre && typeof i.terrenoCampestre === 'object')
    base.terrenoCampestre = withOperacionJson(
      i.terrenoCampestre as Record<string, unknown>,
      operacion,
    ) ?? undefined;
  if (i.publicacionInmueble && typeof i.publicacionInmueble === 'object')
    base.publicacionInmueble = withOperacionJson(
      i.publicacionInmueble as Record<string, unknown>,
      operacion,
    ) ?? undefined;
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
  private readonly log = new Logger(InmueblesService.name);

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
        'Subida de archivos no disponible: configura GCS_BUCKET y credenciales. En Railway/Docker usa GCS_CREDENTIALS_JSON (JSON del service account en una variable); GOOGLE_APPLICATION_CREDENTIALS solo sirve si la ruta al archivo existe en el servidor (p. ej. en tu PC).',
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

    const terrenoPlain = dto.terrenoCampestre
      ? (instanceToPlain(dto.terrenoCampestre) as Record<string, unknown>)
      : null;
    const publicacionPlain = dto.publicacionInmueble
      ? (instanceToPlain(dto.publicacionInmueble) as Record<string, unknown>)
      : null;
    const operacion = normalizeOperacion(
      dto.operacion
        ?? (typeof terrenoPlain?.operacion === 'string'
          ? terrenoPlain.operacion
          : undefined)
        ?? (typeof publicacionPlain?.operacion === 'string'
          ? publicacionPlain.operacion
          : undefined),
    );
    const terrenoCampestre = withOperacionJson(terrenoPlain, operacion);
    const publicacionInmueble = withOperacionJson(publicacionPlain, operacion);

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
      operacion,
      terrenoCampestre,
      publicacionInmueble,
    });

    let saved = await this.repo.save(row);

    if (hasUpload) {
      this.log.log(
        `con-fotos: fila creada id=${saved.id} tipoVivienda=${dto.tipoVivienda} principal=${principalFile ? `${principalFile.size}b ${principalFile.mimetype}` : 'url'} galeriaArchivos=${galeriaFiles.length} videos=${videoFiles.length}`,
      );
    }

    const archivosRows: InmuebleArchivo[] = [];
    let galeriaSort = 1;

    try {
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
    } catch (err: unknown) {
      const detail
        = err instanceof Error ? err.message : JSON.stringify(err).slice(0, 300);
      this.log.error(
        `create con archivos falló inmuebleId=${saved.id} tipo=${dto.tipoVivienda}: ${detail}`,
        err instanceof Error ? err.stack : undefined,
      );
      if (err instanceof HttpException) throw err;
      const exposeDetail =
        process.env.NODE_ENV !== 'production'
        || process.env.DEBUG_UPLOAD_ERRORS === 'true';
      throw new InternalServerErrorException(
        exposeDetail
          ? `Error al subir archivos: ${detail}`
          : 'Error al subir archivos. Revisa logs del API y la configuración de GCS. Activa DEBUG_UPLOAD_ERRORS=true para ver detalle en la respuesta.',
      );
    }
  }

  async update(
    id: number,
    dto: CreateInmuebleDto,
    files?: CreateInmuebleFiles,
  ): Promise<InmuebleResponse> {
    const existing = await this.repo.findOne({
      where: { id },
      relations: { archivos: true },
    });
    if (!existing) throw new NotFoundException('Inmueble no encontrado');

    const principalFile = files?.principal;
    const galeriaFiles = files?.galeria?.filter(Boolean) ?? [];
    const videoFiles = files?.videos?.filter(Boolean) ?? [];
    const hasUpload = !!(
      principalFile || galeriaFiles.length || videoFiles.length
    );

    if (hasUpload && !this.gcs.isEnabled()) {
      throw new BadRequestException(
        'Subida de archivos no disponible: configura GCS_BUCKET y credenciales. En Railway/Docker usa GCS_CREDENTIALS_JSON (JSON del service account en una variable); GOOGLE_APPLICATION_CREDENTIALS solo sirve si la ruta al archivo existe en el servidor (p. ej. en tu PC).',
      );
    }

    const imagenUrl = dto.imagen?.trim() ?? '';
    const imagenAnterior = existing.imagen;
    const prevVideos = [
      ...new Set([
        ...videoUrlsFrom(existing.terrenoCampestre),
        ...videoUrlsFrom(existing.publicacionInmueble),
      ]),
    ];

    const terrenoPlain = dto.terrenoCampestre
      ? (instanceToPlain(dto.terrenoCampestre) as Record<string, unknown>)
      : null;
    const publicacionPlain = dto.publicacionInmueble
      ? (instanceToPlain(dto.publicacionInmueble) as Record<string, unknown>)
      : null;
    const operacion = normalizeOperacion(
      dto.operacion
        ?? (typeof terrenoPlain?.operacion === 'string'
          ? terrenoPlain.operacion
          : undefined)
        ?? (typeof publicacionPlain?.operacion === 'string'
          ? publicacionPlain.operacion
          : undefined),
    );

    const galeriaActual = [...(existing.galeria ?? [])];
    const galeriaNuevasUrls =
      dto.galeria?.map((u) => u.trim()).filter(Boolean) ?? [];
    for (const u of galeriaNuevasUrls) {
      if (!galeriaActual.includes(u)) galeriaActual.push(u);
    }

    existing.titulo = dto.titulo.trim();
    existing.descripcion = dto.descripcion.trim();
    existing.precio = dto.precio;
    existing.moneda = (dto.moneda ?? 'MXN').trim().toUpperCase().slice(0, 8);
    existing.ciudad = dto.ciudad.trim();
    existing.zona = dto.zona.trim();
    existing.m2Superficie = dto.m2Superficie;
    existing.m2Construccion = dto.m2Construccion;
    existing.habitaciones = dto.habitaciones;
    existing.banos = dto.banos;
    existing.destacado = dto.destacado ?? false;
    existing.etiquetas =
      dto.etiquetas?.map((e) => e.trim()).filter(Boolean) ?? [];
    if (imagenUrl && !principalFile) existing.imagen = imagenUrl;
    existing.galeria = galeriaActual.length ? galeriaActual : null;
    existing.tipoVivienda = dto.tipoVivienda;
    existing.estacionamientos = dto.estacionamientos;
    existing.pisosVivienda = dto.pisosVivienda ?? null;
    existing.pisoDepartamento = dto.pisoDepartamento ?? null;
    existing.pisosEdificio = dto.pisosEdificio ?? null;
    existing.amenidades =
      dto.amenidades?.map((a) => a.trim()).filter(Boolean) ?? [];
    existing.cuotaMantenimiento = dto.cuotaMantenimiento ?? 0;
    existing.operacion = operacion;
    existing.terrenoCampestre = mergeVideoUrls(
      withOperacionJson(terrenoPlain, operacion),
      dto.terrenoCampestre ? prevVideos : [],
    );
    existing.publicacionInmueble = mergeVideoUrls(
      withOperacionJson(publicacionPlain, operacion),
      dto.publicacionInmueble ? prevVideos : [],
    );
    if (!existing.terrenoCampestre && !existing.publicacionInmueble && prevVideos.length) {
      existing.publicacionInmueble = { videos: prevVideos, operacion };
    }

    let saved = await this.repo.save(existing);
    const archivosRows: InmuebleArchivo[] = [];
    const urlsConocidas = new Set(
      (existing.archivos ?? []).map((a) => a.url),
    );
    let galeriaSort =
      (existing.archivos ?? [])
        .filter((a) => a.tipo === 'galeria')
        .reduce((m, a) => Math.max(m, a.sortOrder), 0) + 1;

    try {
      if (principalFile) {
        const ext = extFromMime(principalFile.mimetype);
        const nombre = `principal-${Date.now()}${ext}`;
        const url = await this.gcs.uploadInmuebleMedia(
          saved.id,
          'img',
          nombre,
          principalFile.buffer,
          principalFile.mimetype,
        );
        saved.imagen = url;
        await this.archivosRepo.delete({
          inmuebleId: saved.id,
          tipo: 'principal',
        });
        archivosRows.push(
          this.archivosRepo.create({
            inmuebleId: saved.id,
            tipo: 'principal',
            url,
            objectPath: `${saved.id}/img/${nombre}`,
            sortOrder: 0,
          }),
        );
      } else if (imagenUrl && imagenUrl !== imagenAnterior) {
        await this.archivosRepo.delete({
          inmuebleId: saved.id,
          tipo: 'principal',
        });
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

      for (const u of galeriaNuevasUrls) {
        if (urlsConocidas.has(u)) continue;
        urlsConocidas.add(u);
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

      for (let i = 0; i < galeriaFiles.length; i++) {
        const f = galeriaFiles[i];
        const ext = extFromMime(f.mimetype);
        const nombre = `galeria-${Date.now()}-${i}${ext}`;
        const url = await this.gcs.uploadInmuebleMedia(
          saved.id,
          'img',
          nombre,
          f.buffer,
          f.mimetype,
        );
        if (!galeriaActual.includes(url)) galeriaActual.push(url);
        archivosRows.push(
          this.archivosRepo.create({
            inmuebleId: saved.id,
            tipo: 'galeria',
            url,
            objectPath: `${saved.id}/img/${nombre}`,
            sortOrder: galeriaSort++,
          }),
        );
      }
      saved.galeria = galeriaActual.length ? galeriaActual : null;

      const uploadedVideoUrls: string[] = [];
      let videoSort =
        (existing.archivos ?? [])
          .filter((a) => a.tipo === 'video')
          .reduce((m, a) => Math.max(m, a.sortOrder), 0) + 1;
      for (let i = 0; i < videoFiles.length; i++) {
        const f = videoFiles[i];
        if (!videoMime.test(f.mimetype)) {
          throw new BadRequestException(
            `Video no permitido (${f.mimetype}). Usa MP4, WebM, MOV, MPEG o AVI.`,
          );
        }
        const ext = extFromVideoMime(f.mimetype);
        const nombre = `archivo-${Date.now()}-${i}${ext}`;
        const url = await this.gcs.uploadInmuebleMedia(
          saved.id,
          'videos',
          nombre,
          f.buffer,
          f.mimetype,
        );
        uploadedVideoUrls.push(url);
        archivosRows.push(
          this.archivosRepo.create({
            inmuebleId: saved.id,
            tipo: 'video',
            url,
            objectPath: `${saved.id}/videos/${nombre}`,
            sortOrder: videoSort++,
          }),
        );
      }

      if (uploadedVideoUrls.length) {
        if (saved.terrenoCampestre && typeof saved.terrenoCampestre === 'object') {
          saved.terrenoCampestre = mergeVideoUrls(
            saved.terrenoCampestre as Record<string, unknown>,
            uploadedVideoUrls,
          );
        } else if (
          saved.publicacionInmueble
          && typeof saved.publicacionInmueble === 'object'
        ) {
          saved.publicacionInmueble = mergeVideoUrls(
            saved.publicacionInmueble as Record<string, unknown>,
            uploadedVideoUrls,
          );
        } else {
          saved.publicacionInmueble = {
            videos: uploadedVideoUrls,
            operacion,
          };
        }
      }

      saved = await this.repo.save(saved);
      if (archivosRows.length) await this.archivosRepo.save(archivosRows);

      const conArchivos = await this.repo.findOne({
        where: { id: saved.id },
        relations: { archivos: true },
      });
      return toDto(conArchivos ?? saved);
    } catch (err: unknown) {
      const detail =
        err instanceof Error ? err.message : JSON.stringify(err).slice(0, 300);
      this.log.error(
        `update con archivos falló inmuebleId=${saved.id}: ${detail}`,
        err instanceof Error ? err.stack : undefined,
      );
      if (err instanceof HttpException) throw err;
      const exposeDetail =
        process.env.NODE_ENV !== 'production'
        || process.env.DEBUG_UPLOAD_ERRORS === 'true';
      throw new InternalServerErrorException(
        exposeDetail
          ? `Error al subir archivos: ${detail}`
          : 'Error al subir archivos. Revisa logs del API y la configuración de GCS. Activa DEBUG_UPLOAD_ERRORS=true para ver detalle en la respuesta.',
      );
    }
  }
}
