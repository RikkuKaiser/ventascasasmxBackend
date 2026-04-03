import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type AuthUserDto = { id: string; nombre: string; email: string };

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: AuthUserDto }> {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.users.exist({ where: { email } });
    if (exists) throw new ConflictException('Ese correo ya está registrado.');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({
      nombre: dto.nombre.trim(),
      email,
      passwordHash,
    });
    await this.users.save(user);
    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: AuthUserDto }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findOne({
      where: { email },
      select: ['id', 'nombre', 'email', 'passwordHash'],
    });
    if (!user) throw new UnauthorizedException('Correo o contraseña incorrectos.');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Correo o contraseña incorrectos.');
    return this.issueTokens(user);
  }

  private issueTokens(user: User): { accessToken: string; user: AuthUserDto } {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, nombre: user.nombre, email: user.email },
    };
  }
}
