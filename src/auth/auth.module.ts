import fs from 'fs';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from 'src/user';

import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
    JwtModule.register({
      privateKey: fs.readFileSync('ssl/private.key', 'utf-8'),
      signOptions: {
        allowInsecureKeySizes: true,
        algorithm: 'RS256',
        expiresIn: '60d',
      },
    }),
  ],
  providers: [JwtStrategy, LocalStrategy, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
