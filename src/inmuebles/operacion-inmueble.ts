export type OperacionInmueble = 'venta' | 'renta';

/** Null, vacío o desconocido → venta. */
export function normalizeOperacion(
  value?: string | null,
): OperacionInmueble {
  return value === 'renta' ? 'renta' : 'venta';
}

export function operacionFromJson(
  terrenoCampestre?: Record<string, unknown> | null,
  publicacionInmueble?: Record<string, unknown> | null,
): OperacionInmueble {
  const tc = terrenoCampestre?.operacion;
  const pi = publicacionInmueble?.operacion;
  if (typeof tc === 'string') return normalizeOperacion(tc);
  if (typeof pi === 'string') return normalizeOperacion(pi);
  return 'venta';
}

export function withOperacionJson(
  json: Record<string, unknown> | null,
  operacion: OperacionInmueble,
): Record<string, unknown> | null {
  if (!json) return null;
  return { ...json, operacion };
}
