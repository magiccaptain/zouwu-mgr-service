import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSession(token: string) {
    return await this.prismaService.session.findUnique({
      where: {
        token: token,
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
            name: true,
            permissions: true,
            needResetPwd: true,
            homePage: true,
          },
        },
      },
    });
  }
}
