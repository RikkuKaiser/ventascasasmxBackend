import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { InmueblesService } from './inmuebles.service';

const upload = memoryStorage();

@Controller('inmuebles')
export class InmueblesController {
  private readonly log = new Logger(InmueblesController.name);

  constructor(private readonly inmuebles: InmueblesService) {}

  @Public()
  @Get()
  findAll() {
    return this.inmuebles.findAll();
  }

  @Post()
  create(@Body() dto: CreateInmuebleDto) {
    return this.inmuebles.create(dto);
  }

  /**
   * multipart/form-data: campo `data` (JSON del CreateInmuebleDto), archivos opcionales
   * `principal` (1), `galeria` (varios), `videos` (varios). En GCS: `{id}/img/...` y `{id}/videos/...`.
   * Requiere GCS configurado si envías archivos.
   */
  @Post('con-fotos')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'principal', maxCount: 1 },
        { name: 'galeria', maxCount: 24 },
        { name: 'videos', maxCount: 8 },
      ],
      {
        storage: upload,
        limits: { fileSize: 100 * 1024 * 1024 },
      },
    ),
  )
  async createConFotos(
    @Body('data') dataJson: string,
    @UploadedFiles()
    files: {
      principal?: Express.Multer.File[];
      galeria?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    },
  ) {
    if (!dataJson || typeof dataJson !== 'string') {
      throw new BadRequestException(
        'Envía el campo "data" con un JSON del inmueble (CreateInmuebleDto).',
      );
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(dataJson) as unknown;
    } catch {
      throw new BadRequestException('El campo "data" no es JSON válido.');
    }
    const dto = plainToInstance(CreateInmuebleDto, parsed);
    const errs = await validate(dto);
    if (errs.length) {
      throw new BadRequestException(errs);
    }
    const principal = files?.principal?.[0];
    const nGal = files?.galeria?.length ?? 0;
    const nVid = files?.videos?.length ?? 0;
    this.log.log(
      `POST con-fotos tipoVivienda=${dto.tipoVivienda} principal=${principal ? `${principal.size}b` : 'no'} galeria=${nGal} videos=${nVid}`,
    );
    try {
      return await this.inmuebles.create(dto, {
        principal,
        galeria: files?.galeria,
        videos: files?.videos,
      });
    } catch (e: unknown) {
      if (e instanceof HttpException) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      this.log.error(`POST con-fotos error no-HTTP: ${msg}`, e instanceof Error ? e.stack : undefined);
      throw e;
    }
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inmuebles.findOne(id);
  }
}
