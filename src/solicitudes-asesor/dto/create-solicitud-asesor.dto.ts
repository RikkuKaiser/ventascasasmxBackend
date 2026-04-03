import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsString, MinLength, ValidateIf } from 'class-validator';

export class CreateSolicitudAsesorDto {
  @IsString()
  @MinLength(1)
  nombreCompleto: string;

  @IsEmail()
  email: string;

  @Transform(({ value }) => String(value ?? '').replace(/\s/g, '').trim())
  @IsString()
  @MinLength(10, { message: 'Indica un teléfono de contacto (mínimo 10 dígitos).' })
  telefono: string;

  @IsString()
  @MinLength(1)
  ciudad: string;

  @IsString()
  @IsIn(['independiente', 'inmobiliaria'])
  perfil: 'independiente' | 'inmobiliaria';

  @ValidateIf((o: CreateSolicitudAsesorDto) => o.perfil === 'inmobiliaria')
  @IsString()
  @MinLength(1, { message: 'Indica el nombre de la inmobiliaria.' })
  nombreInmobiliaria?: string;

  @IsString()
  experiencia: string;

  @IsString()
  mensaje: string;
}
