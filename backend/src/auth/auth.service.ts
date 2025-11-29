import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) { }

  async register(data: { name: string; email: string; password: string }) {
    const exists = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (exists) throw new BadRequestException('Email already exists');

    const hashed = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: { ...data, password: hashed }
    });

    return this.tokenResponse(user);
  }

  async login(email: string, password: string) {
    console.log(`Login attempt for: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found');
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.password) {
      console.log('User has no password');
      throw new BadRequestException('Invalid credentials');
    }

    console.log('User found, comparing password...');
    const match = await bcrypt.compare(password, user.password);
    console.log(`Password match result: ${match}`);

    if (!match) {
      console.log('Password mismatch');
      throw new BadRequestException('Invalid credentials');
    }

    return this.tokenResponse(user);
  }

  async googleLogin(profile: any) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          password: null
        },
      });
    }

    return this.tokenResponse(user);
  }

  tokenResponse(user) {
    const token = this.jwt.sign({ id: user.id, email: user.email });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan
      }
    };
  }
}
