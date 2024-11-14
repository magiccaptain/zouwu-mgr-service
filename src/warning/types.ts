import { type Prisma } from '@prisma/client';

export type OpsWarning = Prisma.OpsWarningGetPayload<{
  include: {
    hostServer: true;
    opsTask: true;
    fundAccount: true;
  };
}>;
