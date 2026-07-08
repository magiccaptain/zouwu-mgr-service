import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { seedBrokers } from './seed/broker';
import { seedCompanies } from './seed/company';
import { seedFundAccounts } from './seed/fund-account';
import { seedHostServer } from './seed/host-server';
import { seedProcessMonitor } from './seed/process-monitor';
import { seedATPConfigs, seedXTPConfigs } from './seed/td-config';
import { seedUser } from './seed/users';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await seedUser(prisma);
  await seedCompanies(prisma);

  await seedBrokers(prisma);

  // await seedHostServer(prisma);

  // await seedFundAccounts(prisma);

  // await seedXTPConfigs(prisma);

  // await seedATPConfigs(prisma);

  // await seedProcessMonitor(prisma);

  console.log('Seed success!');
}

// Execute the main function and handle disconnection and errors
main()
  .then(() => prisma.$disconnect()) // Disconnect from the database on successful completion
  .catch(async (e) => {
    console.log('Seed failed!');
    console.error(e); // Log any errors
    await prisma.$disconnect(); // Ensure disconnection even if an error occurs
    process.exit(1); // Exit the process with an error code
  });
