import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Inmueble } from './inmueble.entity';
import { User } from './user.entity';

@Entity('comentarios')
export class Comentario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inmueble_id' })
  inmuebleId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column('text')
  texto: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @ManyToOne(() => Inmueble, (i) => i.comentarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inmueble_id' })
  inmueble: Inmueble;

  @ManyToOne(() => User, (u) => u.comentarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
