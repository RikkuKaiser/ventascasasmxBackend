import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Inmueble } from './inmueble.entity';
import { User } from './user.entity';

@Entity('favoritos')
@Unique(['userId', 'inmuebleId'])
export class Favorito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'inmueble_id' })
  inmuebleId: string;

  @ManyToOne(() => User, (u) => u.favoritos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Inmueble, (i) => i.favoritos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inmueble_id' })
  inmueble: Inmueble;
}
