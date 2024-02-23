import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from './auth.service';
import { PassportAuth } from './dto/passport-request.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'login' });
  }

  async validate(login: string, password: string): Promise<PassportAuth> {
    const user = await this.authService.validateUser(login, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      subject: user.id,
      ns: user.ns,
      roles: user.roles,
    };
  }
}
