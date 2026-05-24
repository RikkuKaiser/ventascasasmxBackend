import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { DEMO_USERS_PLAIN } from './demo-users';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedUsers();
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
}
