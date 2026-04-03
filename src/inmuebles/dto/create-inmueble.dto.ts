import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const TIPOS_VIVIENDA = [
  'casa',
  'casa_residencial',
  'departamento',
  'duplex',
  'terreno',
  'loft',
] as const;

export class CreateInmuebleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  titulo: string;

  @IsString()
  @MinLength(1)
  descripcion: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  moneda?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  ciudad: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  zona: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  m2Superficie: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  m2Construccion: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  habitaciones: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  banos: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  destacado?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  etiquetas?: string[];

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  imagen: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galeria?: string[];

  @IsString()
  @IsIn([...TIPOS_VIVIENDA])
  tipoVivienda: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  estacionamientos: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pisosVivienda?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pisoDepartamento?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pisosEdificio?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenidades?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cuotaMantenimiento?: number;
}
