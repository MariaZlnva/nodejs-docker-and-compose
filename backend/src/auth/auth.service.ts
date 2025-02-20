import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async auth(user: User) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '365d' }),
    };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findOne({ username });
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (user && passwordMatched) {
      const { password, ...result } = user;
      return user;
    }
    return null;
  }
}
