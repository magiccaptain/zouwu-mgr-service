import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UserService } from 'src/user';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

import { AuthService } from './auth.service';

const mockUser: CreateUserDto = {
  email: 'aaa@aa.com',
  name: 'kitty',
  password: '123456',
  username: 'kitty',
  ns: 'haivivi.com/pal',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: UserService,
          useValue: {
            list: jest.fn().mockResolvedValue([mockUser]),
            create: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
