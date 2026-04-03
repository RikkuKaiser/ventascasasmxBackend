/** Datos iniciales alineados con el front (stores/inmuebles). */
export const DEMO_INMUEBLES: Array<{
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: string;
  ciudad: string;
  zona: string;
  m2Superficie: number;
  m2Construccion: number;
  habitaciones: number;
  banos: number;
  destacado: boolean;
  etiquetas: string[];
  tipoVivienda: string;
  estacionamientos: number;
  pisosVivienda?: number;
  pisoDepartamento?: number;
  pisosEdificio?: number;
  amenidades: string[];
  cuotaMantenimiento: number;
  imagen: string;
  galeria?: string[];
}> = [
  {
    titulo: 'Penthouse con vista panorámica',
    descripcion:
      'Terraza privada, acabados de lujo y domótica. Ubicación premium con luz natural todo el día.',
    precio: 12800000,
    moneda: 'MXN',
    ciudad: 'Ciudad de México',
    zona: 'Polanco',
    m2Superficie: 285,
    m2Construccion: 280,
    habitaciones: 3,
    banos: 3,
    destacado: true,
    etiquetas: ['Nuevo', 'Amueblado', 'Estacionamiento'],
    tipoVivienda: 'departamento',
    estacionamientos: 3,
    pisoDepartamento: 22,
    pisosEdificio: 24,
    amenidades: [
      'Concierge',
      'Gimnasio',
      'Spa',
      'Alberca infinity',
      'Salón de eventos',
      'Business center',
      'Terraza común',
    ],
    cuotaMantenimiento: 18500,
    imagen:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80',
    ],
  },
  {
    titulo: 'Residencia minimalista en bosque',
    descripcion:
      'Arquitectura contemporánea, amplios ventanales y jardín integrado. Ideal para quien busca calma.',
    precio: 8950000,
    moneda: 'MXN',
    ciudad: 'Monterrey',
    zona: 'Valle',
    m2Superficie: 340,
    m2Construccion: 320,
    habitaciones: 4,
    banos: 4,
    destacado: true,
    etiquetas: ['Jardín', 'Alberca'],
    tipoVivienda: 'casa_residencial',
    estacionamientos: 4,
    pisosVivienda: 2,
    amenidades: [
      'Alberca',
      'Jardín',
      'Cuarto de servicio',
      'Bodega',
      'Persianas eléctricas',
      'Preparación paneles solares',
    ],
    cuotaMantenimiento: 0,
    imagen:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
      'https://images.unsplash.com/photo-1600585152915-c8a5b68f51b0?w=1600&q=80',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1600&q=80',
      'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1600&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1600&q=80',
    ],
  },
  {
    titulo: 'Loft industrial reformado',
    descripcion:
      'Techos altos, acero y madera recuperada. Espacio diáfano perfecto para estudio o vivienda.',
    precio: 4250000,
    moneda: 'MXN',
    ciudad: 'Guadalajara',
    zona: 'Lafayette',
    m2Superficie: 95,
    m2Construccion: 95,
    habitaciones: 1,
    banos: 2,
    destacado: false,
    etiquetas: ['Loft', 'Pet friendly'],
    tipoVivienda: 'loft',
    estacionamientos: 1,
    pisosVivienda: 1,
    amenidades: [
      'Pet friendly',
      'Cocina integral',
      'Closet vestidor',
      'Bodega en sótano',
    ],
    cuotaMantenimiento: 3200,
    imagen:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80',
      'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1600&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1600&q=80',
    ],
  },
  {
    titulo: 'Casa mediterránea frente al mar',
    descripcion:
      'Acceso a playa, alberca infinita y muelle privado. Experiencia resort en tu hogar.',
    precio: 24500000,
    moneda: 'MXN',
    ciudad: 'Los Cabos',
    zona: 'Costa',
    m2Superficie: 480,
    m2Construccion: 410,
    habitaciones: 5,
    banos: 5,
    destacado: true,
    etiquetas: ['Frente al mar', 'Lujo'],
    tipoVivienda: 'casa',
    estacionamientos: 6,
    pisosVivienda: 2,
    amenidades: [
      'Frente a playa',
      'Alberca infinity',
      'Muelle',
      'Cava de vinos',
      'Cine en casa',
      'Cuarto de blancos',
    ],
    cuotaMantenimiento: 22000,
    imagen:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80',
      'https://images.unsplash.com/photo-1613977256644-880a9c0d0b9f?w=1600&q=80',
      'https://images.unsplash.com/photo-1602343164077-7e9717d1aacc?w=1600&q=80',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1600&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
    ],
  },
  {
    titulo: 'Departamento boutique en centro histórico',
    descripcion:
      'Fachada restaurada, interior contemporáneo. A pasos de cultura y gastronomía.',
    precio: 5100000,
    moneda: 'MXN',
    ciudad: 'Querétaro',
    zona: 'Centro',
    m2Superficie: 110,
    m2Construccion: 110,
    habitaciones: 2,
    banos: 2,
    destacado: false,
    etiquetas: ['Centro', 'Inversión'],
    tipoVivienda: 'departamento',
    estacionamientos: 1,
    pisoDepartamento: 2,
    pisosEdificio: 4,
    amenidades: [
      'Azotea común',
      'Elevador',
      'Intercom',
      'Preparación minisplit',
    ],
    cuotaMantenimiento: 2800,
    imagen:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1600&q=80',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1600&q=80',
      'https://images.unsplash.com/photo-1556020685-ae41ab2f55b2?w=1600&q=80',
    ],
  },
  {
    titulo: 'Villa con viñedo',
    descripcion:
      'Parcela amplia, bodega de vinos y vistas al valle. Para una vida sin prisas.',
    precio: 18700000,
    moneda: 'MXN',
    ciudad: 'Ensenada',
    zona: 'Valle de Guadalupe',
    m2Superficie: 520,
    m2Construccion: 285,
    habitaciones: 4,
    banos: 4,
    destacado: false,
    etiquetas: ['Campo', 'Viñedo'],
    tipoVivienda: 'casa_residencial',
    estacionamientos: 4,
    pisosVivienda: 1,
    amenidades: [
      'Viñedo',
      'Bodega de vinos',
      'Asador',
      'Huerto',
      'Estacionamiento visitas',
    ],
    cuotaMantenimiento: 0,
    imagen:
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1600&q=80',
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80',
    ],
  },
  {
    titulo:
      'Torre residencial con amenidades de hotel y vista urbana',
    descripcion:
      'Ubicación estratégica a minutos de corporativos y zona gastronómica. El desarrollo incluye lobby con doble altura, gimnasio equipado, spa seco, alberca infinity en azotea, coworking privado y estacionamiento techado con acceso controlado. El interior combina pisos de mármol en áreas sociales, carpintería oculta en closets, iluminación escénica LED y preparación para domótica. Ideal para quien busca invertir en renta premium o habitar con servicios tipo concierge sin renunciar a la privacidad de un hogar propio.',
    precio: 9200000,
    moneda: 'MXN',
    ciudad: 'Ciudad de México',
    zona: 'Santa Fe',
    m2Superficie: 145,
    m2Construccion: 145,
    habitaciones: 2,
    banos: 2,
    destacado: false,
    etiquetas: ['Amenidades', 'Inversión', 'Nuevo'],
    tipoVivienda: 'departamento',
    estacionamientos: 2,
    pisoDepartamento: 24,
    pisosEdificio: 42,
    amenidades: [
      'Lobby doble altura',
      'Gimnasio',
      'Spa seco',
      'Alberca infinity (azotea)',
      'Coworking',
      'Estacionamiento techado',
      'Seguridad 24 h',
      'Salón de juegos',
    ],
    cuotaMantenimiento: 15200,
    imagen:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80',
    ],
  },
  {
    titulo: 'Terreno habitacional en esquina',
    descripcion:
      'Polígono regular, servicios en banqueta y uso de suelo habitacional. Listo para proyecto residencial o dúplex.',
    precio: 3180000,
    moneda: 'MXN',
    ciudad: 'Tijuana',
    zona: 'Zona Río',
    m2Superficie: 240,
    m2Construccion: 0,
    habitaciones: 0,
    banos: 0,
    destacado: false,
    etiquetas: ['Terreno', 'Inversión'],
    tipoVivienda: 'terreno',
    estacionamientos: 0,
    amenidades: [
      'Esquina',
      'Uso habitacional',
      'Agua y drenaje en banqueta',
      'Cerca de avenida principal',
    ],
    cuotaMantenimiento: 0,
    imagen:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80',
      'https://images.unsplash.com/photo-1524813686510-a57563d77965?w=1600&q=80',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80',
    ],
  },
  {
    titulo: 'Dúplex con roof garden privado',
    descripcion:
      'Dos niveles independientes en condominio cerrado. Roof garden con asador y excelente iluminación.',
    precio: 6850000,
    moneda: 'MXN',
    ciudad: 'Puebla',
    zona: 'Angelópolis',
    m2Superficie: 185,
    m2Construccion: 168,
    habitaciones: 3,
    banos: 3,
    destacado: false,
    etiquetas: ['Dúplex', 'Roof garden'],
    tipoVivienda: 'duplex',
    estacionamientos: 2,
    pisosVivienda: 2,
    amenidades: [
      'Roof garden',
      'Asador',
      'Condominio cerrado',
      'Áreas verdes comunes',
      'Juegos infantiles',
    ],
    cuotaMantenimiento: 4500,
    imagen:
      'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=1200&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1600&q=80',
    ],
  },
];
