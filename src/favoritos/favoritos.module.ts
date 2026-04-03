import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorito } from '../entities/favorito.entity';
import { Inmueble } from '../entities/inmueble.entity';
import { AuthModule } from '../auth/auth.module';
import { FavoritosController } from './favoritos.controller';
import { FavoritosService } from './favoritos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorito, Inmueble]), AuthModule],
  controllers: [FavoritosController],
  providers: [FavoritosService],
})
export class FavoritosModule {}
