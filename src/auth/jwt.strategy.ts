import fs from 'fs';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PassportAuth } from './dto/passport-request.dto';
import { JwtPayload } from './entities/jwt.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: fs.readFileSync('ssl/public.key', 'utf-8'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<PassportAuth> {
    return {
      subject: payload.sub,
      ns: payload.ns,
    };
  }
}
