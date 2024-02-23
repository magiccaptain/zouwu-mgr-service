import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from 'src/user';
import { UserDocument } from 'src/user/entities/user.entity';

interface SignAccessTokenOption {
  expiresIn?: string;
}

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  async validateUser(login: string, pass: string): Promise<UserDocument> {
    const user = await this.userService.findByLoginWithPassword(login);
    if (user && (await user.checkPassword(pass))) {
      return user;
    }
    return null;
  }

  signAccessToken(payload: any, options?: SignAccessTokenOption) {
    return this.jwtService.sign(payload, options);
  }
}
