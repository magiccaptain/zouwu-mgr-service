import { PrismaClient } from '@prisma/client';

import { seedBrokers } from './seed/broker';
import { seedFundAccounts } from './seed/fund-account';
import { seedHostServer } from './seed/host-server';
import { seedATPConfigs, seedXTPConfigs } from './seed/td-config';
import { seedUser } from './seed/users';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  await seedUser(prisma);

  await seedBrokers(prisma);

  await seedHostServer(prisma);

  await seedFundAccounts(prisma);

  await seedXTPConfigs(prisma);

  await seedATPConfigs(prisma);

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
