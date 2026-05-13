import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GcsService } from '../storage/gcs.service';
import { Public } from 'src/common/decorators/public.decorator';

const imageMime = /^image\/(jpeg|jpg|png|gif|webp)$/i;

@Controller('debug')
export class DebugUploadController {
  constructor(private readonly gcs: GcsService) {}

  /**
   * Lista URLs de objetos bajo un prefijo (carpeta lógica), p. ej. `test-uploads/` o `inmuebles/5/`.
   * Requiere Bearer JWT. Query: `prefix` (opcional, default `test-uploads`), `limite` (1–500, default 200).
   */
  @Public()
  @Get('urls-gcs')
  async urlsGcs(
    @Query('prefix') prefix?: string,
    @Query('limite') limiteRaw?: string,
  ) {
    if (!this.gcs.isEnabled()) {
      throw new BadRequestException(
        'GCS no está configurado (GCS_BUCKET y credenciales).',
      );
    }
    const limite = Number.parseInt(limiteRaw ?? '200', 10);
    const limiteN = Number.isFinite(limite) ? limite : 200;
    const pref = (prefix ?? 'test-uploads').trim() || 'test-uploads';
    const items = await this.gcs.listObjectUrlsByPrefix(pref, limiteN);
    return {
      bucket: process.env.GCS_BUCKET?.trim() ?? '',
      prefix: pref,
      count: items.length,
      items,
    };
  }

  /**
   * Prueba de subida a GCS. Requiere Bearer JWT (mismo login que el resto del API).
   * multipart/form-data campo: `imagen` (un archivo).
   */
  @Post('subir-imagen')
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async subirImagen(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!this.gcs.isEnabled()) {
      throw new BadRequestException(
        'GCS no está configurado (GCS_BUCKET y credenciales).',
      );
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'Envía un archivo en el campo multipart "imagen".',
      );
    }
    if (!imageMime.test(file.mimetype)) {
      throw new BadRequestException(
        'Solo se aceptan imágenes JPEG, PNG, GIF o WebP.',
      );
    }
    const name = file.originalname || 'imagen.bin';
    const { url, objectName } = await this.gcs.uploadTestFile(
      file.buffer,
      file.mimetype,
      name,
    );
    return { ok: true, url, objectName };
  }
}
