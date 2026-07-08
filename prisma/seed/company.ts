import { PrismaClient, type Prisma } from '@prisma/client';

const companies: Prisma.CompanyCreateInput[] = [
  {
    name: '致邃',
    key: 'zhisui',
  },
];

export async function seedCompanies(client: PrismaClient) {
  for (const company of companies) {
    await client.company.upsert({
      where: {
        key: company.key,
      },
      create: company,
      update: company,
    });
  }

  console.log('seed companies success');
}
