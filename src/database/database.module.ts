import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Comentario,
  Favorito,
  Inmueble,
  SolicitudAsesor,
  User,
} from '../entities';
import { SeedService } from './seed.service';

function useSsl(config: ConfigService, databaseUrl?: string): boolean {
  if (config.get<string>('DATABASE_SSL', '').toLowerCase() === 'true')
    return true;
  const u = databaseUrl ?? '';
  return (
    u.includes('sslmode=require')
    || u.includes('sslmode=verify-full')
    || u.includes('sslmode=verify-ca')
  );
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL')?.trim();
        const ssl = useSsl(config, databaseUrl);
        const common = {
          type: 'postgres' as const,
          entities: [User, Inmueble, Comentario, Favorito, SolicitudAsesor],
          synchronize: config.get<string>('TYPEORM_SYNC', 'true') === 'true',
          logging: config.get<string>('TYPEORM_LOGGING', 'false') === 'true',
          ...(ssl
            ? { ssl: { rejectUnauthorized: false } }
            : {}),
        };

        if (databaseUrl) {
          return {
            ...common,
            url: databaseUrl,
          };
        }

        return {
          ...common,
          host: config.get<string>('DATABASE_HOST', 'localhost'),
          port: config.get<number>('DATABASE_PORT', 5432),
          username: config.get<string>('DATABASE_USER', 'postgres'),
          password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
          database: config.get<string>('DATABASE_NAME', 'ventascasasmx'),
        };
      },
    }),
    TypeOrmModule.forFeature([Inmueble, User]),
  ],
  providers: [SeedService],
})
export class DatabaseModule {}
