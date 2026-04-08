import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { DatabaseModule } from './database/database.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { InmueblesModule } from './inmuebles/inmuebles.module';
import { SolicitudesAsesorModule } from './solicitudes-asesor/solicitudes-asesor.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StorageModule,
    DatabaseModule,
    AuthModule,
    InmueblesModule,
    ComentariosModule,
    FavoritosModule,
    SolicitudesAsesorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
