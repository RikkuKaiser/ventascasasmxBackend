import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Inmueble } from '../entities/inmueble.entity';
import { User } from '../entities/user.entity';
import { DEMO_INMUEBLES } from './demo-inmuebles';
import { DEMO_USERS_PLAIN } from './demo-users';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Inmueble)
    private readonly inmuebles: Repository<Inmueble>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedUsers();
    await this.seedInmuebles();
  }

  private async seedUsers(): Promise<void> {
    const count = await this.users.count();
    if (count > 0) return;
    const rows: User[] = [];
    for (const u of DEMO_USERS_PLAIN) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      rows.push(
        this.users.create({
          nombre: u.nombre,
          email: u.email.toLowerCase(),
          passwordHash,
        }),
      );
    }
    await this.users.save(rows);
    this.log.log(
      `Sembrados ${rows.length} usuarios de demostración (ej. ${DEMO_USERS_PLAIN[0].email}).`,
    );
  }

  private async seedInmuebles(): Promise<void> {
    const count = await this.inmuebles.count();
    if (count > 0) return;
    const rows = DEMO_INMUEBLES.map((d) =>
      this.inmuebles.create({
        titulo: d.titulo,
        descripcion: d.descripcion,
        precio: d.precio,
        moneda: d.moneda,
        ciudad: d.ciudad,
        zona: d.zona,
        m2Superficie: d.m2Superficie,
        m2Construccion: d.m2Construccion,
        habitaciones: d.habitaciones,
        banos: d.banos,
        destacado: d.destacado,
        etiquetas: d.etiquetas,
        imagen: d.imagen,
        galeria: d.galeria ?? null,
        tipoVivienda: d.tipoVivienda,
        estacionamientos: d.estacionamientos,
        pisosVivienda: d.pisosVivienda ?? null,
        pisoDepartamento: d.pisoDepartamento ?? null,
        pisosEdificio: d.pisosEdificio ?? null,
        amenidades: d.amenidades,
        cuotaMantenimiento: d.cuotaMantenimiento,
      }),
    );
    await this.inmuebles.save(rows);
    this.log.log(`Sembrados ${rows.length} inmuebles de demostración.`);
  }
}
