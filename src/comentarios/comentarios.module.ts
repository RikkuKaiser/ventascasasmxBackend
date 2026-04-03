import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comentario } from '../entities/comentario.entity';
import { Inmueble } from '../entities/inmueble.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comentario, Inmueble, User]),
    AuthModule,
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}
