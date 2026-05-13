import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CreateSolicitudAsesorDto } from './dto/create-solicitud-asesor.dto';
import { SolicitudesAsesorService } from './solicitudes-asesor.service';

@Controller('solicitudes-asesor')
export class SolicitudesAsesorController {
  constructor(private readonly solicitudes: SolicitudesAsesorService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateSolicitudAsesorDto) {
    return this.solicitudes.create(dto);
  }
}
