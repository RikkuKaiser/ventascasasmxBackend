import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Inmueble } from './inmueble.entity';

export type InmuebleArchivoTipo = 'principal' | 'galeria' | 'video';

@Entity('inmueble_archivos')
export class InmuebleArchivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inmueble_id', type: 'int' })
  inmuebleId: number;

  @Column({ type: 'varchar', length: 24 })
  tipo: InmuebleArchivoTipo;

  /** URL pública (GCS u externa). */
  @Column('text')
  url: string;

  /** Ruta del objeto en el bucket, p. ej. `12/img/principal.jpg`; null si es URL externa. */
  @Column({ name: 'object_path', type: 'varchar', length: 2048, nullable: true })
  objectPath: string | null;

  /** Orden dentro del mismo `tipo` (principal suele ser 0). */
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @ManyToOne(() => Inmueble, (i) => i.archivos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inmueble_id' })
  inmueble: Inmueble;
}
