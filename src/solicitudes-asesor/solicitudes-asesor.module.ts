import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAsesor } from '../entities/solicitud-asesor.entity';
import { SolicitudesAsesorController } from './solicitudes-asesor.controller';
import { SolicitudesAsesorService } from './solicitudes-asesor.service';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudAsesor])],
  controllers: [SolicitudesAsesorController],
  providers: [SolicitudesAsesorService],
})
export class SolicitudesAsesorModule {}
