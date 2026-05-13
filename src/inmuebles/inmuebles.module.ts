import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Inmueble } from '../entities/inmueble.entity';
import { InmuebleArchivo } from '../entities/inmueble-archivo.entity';
import { InmueblesController } from './inmuebles.controller';
import { InmueblesService } from './inmuebles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inmueble, InmuebleArchivo]), AuthModule],
  controllers: [InmueblesController],
  providers: [InmueblesService],
})
export class InmueblesModule {}
