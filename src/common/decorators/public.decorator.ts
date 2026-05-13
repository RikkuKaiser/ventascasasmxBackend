import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marca la ruta (o controlador) como accesible sin JWT. Por defecto todo exige token. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
