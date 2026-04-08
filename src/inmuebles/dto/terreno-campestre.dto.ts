import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** Servicios / infraestructura del terreno (checkboxes del formulario). */
export class TerrenoServiciosDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  aguaPotable?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  drenaje?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  empedrado?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  luz?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  pavimentado?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  rural?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  planFinanciamiento?: boolean;
}

/** Detalle específico de publicación tipo terreno campestre (JSON en BD). */
export class TerrenoCampestreDto {
  @IsOptional()
  @IsString()
  @IsIn(['venta', 'renta', 'proyecto'])
  operacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  subtipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  calleNumero?: string;

  /** Lote junto a calle (opcional en ubicación). */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  loteCalle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  estado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  ciudadMunicipio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  colonia?: string;

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
  @IsIn(['m2', 'ha', 'na'])
  unidadSuperficie?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  manzana?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lotePredial?: string;

  @IsOptional()
  @IsString()
  @IsIn(['listo_construir', 'obra_negra', 'venta_como_terreno'])
  estadoTerreno?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  notas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  videoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  planosUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  metrosFondo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  metrosFrente?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tipoRiego?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  usoSuelo?: string;

  @IsOptional()
  @IsString()
  @IsIn(['regular', 'irregular', 'plano'])
  formaTerreno?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  casetaGuardia?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  seguridadPrivada?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  aptoCredito?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => TerrenoServiciosDto)
  servicios?: TerrenoServiciosDto;
}
