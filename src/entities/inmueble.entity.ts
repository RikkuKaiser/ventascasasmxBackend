import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comentario } from './comentario.entity';
import { Favorito } from './favorito.entity';
import { InmuebleArchivo } from './inmueble-archivo.entity';

@Entity('inmuebles')
export class Inmueble {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column('text')
  descripcion: string;

  @Column('double precision')
  precio: number;

  @Column({ length: 8, default: 'MXN' })
  moneda: string;

  @Column()
  ciudad: string;

  @Column()
  zona: string;

  @Column({ name: 'm2_superficie', type: 'double precision' })
  m2Superficie: number;

  @Column({ name: 'm2_construccion', type: 'double precision' })
  m2Construccion: number;

  @Column({ type: 'int' })
  habitaciones: number;

  @Column({ type: 'int' })
  banos: number;

  @Column({ default: false })
  destacado: boolean;

  @Column('jsonb', { default: [] })
  etiquetas: string[];

  @Column()
  imagen: string;

  @Column('jsonb', { nullable: true })
  galeria: string[] | null;

  @Column({ name: 'tipo_vivienda' })
  tipoVivienda: string;

  @Column({ type: 'int' })
  estacionamientos: number;

  @Column({ name: 'pisos_vivienda', type: 'int', nullable: true })
  pisosVivienda: number | null;

  @Column({ name: 'piso_departamento', type: 'int', nullable: true })
  pisoDepartamento: number | null;

  @Column({ name: 'pisos_edificio', type: 'int', nullable: true })
  pisosEdificio: number | null;

  @Column('jsonb', { default: [] })
  amenidades: string[];

  @Column({ name: 'cuota_mantenimiento', type: 'double precision', default: 0 })
  cuotaMantenimiento: number;

  /** venta | renta. Null histórico → venta al leer. */
  @Column({ length: 16, default: 'venta' })
  operacion: string;

  /** JSON: ubicación extendida, servicios, frente/fondo, etc. (terreno campestre). */
  @Column('jsonb', { name: 'terreno_campestre', nullable: true })
  terrenoCampestre: Record<string, unknown> | null;

  /** JSON: calle, CP, mapa, video (publicar inmueble con construcción). */
  @Column('jsonb', { name: 'publicacion_inmueble', nullable: true })
  publicacionInmueble: Record<string, unknown> | null;

  @OneToMany(() => Comentario, (c) => c.inmueble)
  comentarios: Comentario[];

  @OneToMany(() => Favorito, (f) => f.inmueble)
  favoritos: Favorito[];

  @OneToMany(() => InmuebleArchivo, (a) => a.inmueble)
  archivos: InmuebleArchivo[];
}
