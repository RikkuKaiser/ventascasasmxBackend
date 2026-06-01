import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/** Datos extra del formulario de casas/deptos (no terreno). */
export class PublicacionInmuebleDto {
  @IsOptional()
  @IsIn(['venta', 'renta'])
  operacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  calleNumero?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  estado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  cp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  pais?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  videoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  planosUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  notas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  condominio?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  mediosBanos?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tipoCocina?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complementos?: string[];

  @IsOptional()
  @IsIn(['nueva', 'usada', 'remodelada'])
  estadoVivienda?: string;
}
