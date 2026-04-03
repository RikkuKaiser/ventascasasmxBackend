import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('solicitudes_asesor')
export class SolicitudAsesor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nombre_completo' })
  nombreCompleto: string;

  @Column()
  email: string;

  @Column()
  telefono: string;

  @Column()
  ciudad: string;

  @Column()
  perfil: string;

  @Column({ name: 'nombre_inmobiliaria', default: '' })
  nombreInmobiliaria: string;

  @Column('text', { default: '' })
  experiencia: string;

  @Column('text', { default: '' })
  mensaje: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}
