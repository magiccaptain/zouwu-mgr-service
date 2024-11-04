import { PrismaClient, type Prisma } from '@prisma/client';
// eslint-disable-next-line import/no-extraneous-dependencies
import bcryptjs from 'bcryptjs';

export const users: Prisma.UserCreateManyInput[] = [
  {
    name: '超级管理员',
    username: 'admin',
    password: bcryptjs.hashSync('admin@12345', 10),
    permissions: ['*'],
    homePage: '/dashboard',
  },
  {
    name: '邵辰',
    username: 'shaochen',
    password: bcryptjs.hashSync('shaochen@12345', 10),
    permissions: ['*'],
    homePage: '/dashboard',
  },
  {
    name: '石千晗',
    username: 'shiqianhan',
    password: bcryptjs.hashSync('shiqianhan@12345', 10),
    permissions: ['fund-account/*'],
    homePage: '/fund-account',
  },
  {
    name: '孙亚博',
    username: 'sunyabo',
    password: bcryptjs.hashSync('sunyabo@12345', 10),
    permissions: ['*'],
    homePage: '/dashboard',
  },
  {
    name: '童靖',
    username: 'tongjing',
    password: bcryptjs.hashSync('tongjing@12345', 10),
    permissions: ['fund-account/*'],
    homePage: '/fund-account',
  },
];

export async function seedUser(prisma: PrismaClient) {
  for (const user of users) {
    const { password, username, ...update } = user;

    await prisma.user.upsert({
      where: {
        username: user.username,
      },
      update,
      create: user,
    });
  }

  console.log('User created successfully');
}
