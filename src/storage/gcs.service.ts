import { existsSync } from 'node:fs';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage, type Bucket } from '@google-cloud/storage';

function resumenErrorGcs(err: unknown): string {
  if (err instanceof Error) return err.message;
  const o = err as {
    message?: string
    code?: number | string
    errors?: { message?: string }[]
  };
  const bits = [
    o.code != null ? String(o.code) : '',
    o.message,
    o.errors?.map((e) => e.message).filter(Boolean).join('; '),
  ].filter(Boolean);
  if (bits.length) return bits.join(' — ');
  try {
    return JSON.stringify(err).slice(0, 400);
  } catch {
    return String(err);
  }
}

@Injectable()
export class GcsService {
  private readonly log = new Logger(GcsService.name);
  private readonly storage: Storage | null;
  private readonly bucketName: string;
  /** Base pública sin barra final (ej. https://storage.googleapis.com/mi-bucket) */
  private readonly publicBase: string;

  constructor(private readonly config: ConfigService) {
    this.bucketName = (this.config.get<string>('GCS_BUCKET') ?? '').trim();
    const customBase = (this.config.get<string>('GCS_PUBLIC_BASE_URL') ?? '').trim();
    this.publicBase = (
      customBase || `https://storage.googleapis.com/${this.bucketName}`
    ).replace(/\/$/, '');

    const jsonRaw = this.config.get<string>('GCS_CREDENTIALS_JSON')?.trim();
    if (this.bucketName && jsonRaw) {
      try {
        const credentials = JSON.parse(jsonRaw) as object;
        const projectId =
          (credentials as { project_id?: string }).project_id ?? undefined;
        this.storage = new Storage({ credentials, projectId });
        this.log.log(`GCS listo (bucket: ${this.bucketName}).`);
      } catch (e) {
        this.log.error('GCS_CREDENTIALS_JSON no es JSON válido.', e);
        this.storage = null;
      }
    } else if (this.bucketName && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS.trim();
      if (!existsSync(credPath)) {
        this.storage = null;
        this.log.warn(
          `GOOGLE_APPLICATION_CREDENTIALS="${credPath}" no existe en este entorno (típico en Docker/Railway: no subes la carpeta src/secrets). Usa la variable GCS_CREDENTIALS_JSON con el JSON del service account en una sola línea, o quita GOOGLE_APPLICATION_CREDENTIALS del despliegue si ya usas GCS_CREDENTIALS_JSON.`,
        );
      } else {
        this.storage = new Storage();
        this.log.log(`GCS listo con GOOGLE_APPLICATION_CREDENTIALS (${credPath}).`);
      }
    } else {
      this.storage = null;
      if (this.bucketName && !this.storage) {
        this.log.warn(
          'GCS_BUCKET definido pero faltan credenciales (GCS_CREDENTIALS_JSON o GOOGLE_APPLICATION_CREDENTIALS).',
        );
      }
    }
  }

  isEnabled(): boolean {
    return !!this.storage && !!this.bucketName;
  }

  private bucket(): Bucket {
    if (!this.storage || !this.bucketName) {
      throw new Error('GCS no configurado');
    }
    return this.storage.bucket(this.bucketName);
  }

  /**
   * Subida con JSON API (uploadType=media) + fetch, sin createWriteStream del SDK.
   * Evita "Cannot call write after a stream was destroyed" en Node/Docker con @google-cloud/storage.
   */
  private async putBufferMediaUpload(
    objectName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    if (!this.storage) throw new Error('GCS no configurado');
    type AuthLike = { getAccessToken: () => Promise<string | null | undefined> };
    const token = await (this.storage.authClient as AuthLike).getAccessToken();
    if (!token) throw new Error('No se obtuvo access token para GCS');

    const url = new URL(
      `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(this.bucketName)}/o`,
    );
    url.searchParams.set('uploadType', 'media');
    url.searchParams.set('name', objectName);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
      },
      body: new Uint8Array(buffer),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `GCS JSON API upload ${res.status} ${res.statusText}: ${text.slice(0, 1000)}`,
      );
    }
  }

  private async setObjectCacheHeaders(
    objectName: string,
    contentType: string,
    cacheControl: string,
  ): Promise<void> {
    const file = this.bucket().file(objectName);
    try {
      await file.setMetadata({ contentType, cacheControl });
    } catch (err: unknown) {
      this.log.warn(
        `GCS setMetadata falló object="${objectName}" — ${resumenErrorGcs(err)}`,
      );
    }
  }

  /**
   * Sube bajo `{inmuebleId}/img/...` o `{inmuebleId}/videos/...` (carpetas lógicas en el bucket).
   */
  async uploadInmuebleMedia(
    inmuebleId: number,
    section: 'img' | 'videos',
    relativePath: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const safeRel = relativePath.replace(/^\/+/, '').replace(/\.\./g, '');
    const objectName = `${inmuebleId}/${section}/${safeRel}`;
    const file = this.bucket().file(objectName);
    try {
      await this.putBufferMediaUpload(objectName, buffer, contentType);
      await this.setObjectCacheHeaders(
        objectName,
        contentType,
        'public, max-age=31536000',
      );
    } catch (err: unknown) {
      this.log.error(
        `GCS upload falló bucket="${this.bucketName}" object="${objectName}" bytes=${buffer.length} contentType=${contentType} — ${resumenErrorGcs(err)}`,
      );
      throw err;
    }
    try {
      await file.makePublic();
    } catch {
      this.log.warn(
        `No se pudo makePublic en ${objectName}; usa IAM del bucket para lectura pública o signed URLs.`,
      );
    }
    return `${this.publicBase}/${objectName}`;
  }

  /**
   * Sube un archivo bajo `test-uploads/` (pruebas de credenciales y bucket).
   */
  async uploadTestFile(
    buffer: Buffer,
    contentType: string,
    originalName: string,
  ): Promise<{ url: string; objectName: string }> {
    const base = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100) || 'archivo.bin';
    const objectName = `test-uploads/${Date.now()}-${base}`;
    const file = this.bucket().file(objectName);
    try {
      await this.putBufferMediaUpload(objectName, buffer, contentType);
      await this.setObjectCacheHeaders(
        objectName,
        contentType,
        'public, max-age=3600',
      );
    } catch (err: unknown) {
      this.log.error(
        `GCS upload (test) bucket="${this.bucketName}" object="${objectName}" — ${resumenErrorGcs(err)}`,
      );
      throw err;
    }
    try {
      await file.makePublic();
    } catch {
      this.log.warn(
        `No se pudo makePublic en ${objectName}; revisa permisos del bucket.`,
      );
    }
    return {
      objectName,
      url: `${this.publicBase}/${objectName}`,
    };
  }

  objectPublicUrl(objectName: string): string {
    const name = objectName.replace(/^\/+/, '');
    return `${this.publicBase}/${name}`;
  }

  /**
   * Lista objetos bajo un prefijo (carpeta lógica en GCS) y devuelve URLs con la base pública configurada.
   */
  async listObjectUrlsByPrefix(
    prefix: string,
    maxResults: number,
  ): Promise<{ name: string; url: string; updated?: string }[]> {
    let p = prefix.trim().replace(/^\/+/, '');
    if (p && !p.endsWith('/')) p = `${p}/`;
    const cap = Math.min(Math.max(1, maxResults), 500);
    const [files] = await this.bucket().getFiles({
      prefix: p || undefined,
      maxResults: cap,
      autoPaginate: false,
    });
    return files
      .filter((f) => !f.name.endsWith('/'))
      .map((f) => ({
        name: f.name,
        url: this.objectPublicUrl(f.name),
        updated: f.metadata.updated,
      }));
  }
}
