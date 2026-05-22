import { type Prisma } from '@prisma/client';

export type RemoteCommand = Prisma.RemoteCommandGetPayload<{
  include: {
    hostServer: true;
    opsTask: true;
    fundAccount: true;
  };
}>;

export class RemoteCommandError extends Error {
  constructor(remoteCommand: RemoteCommand, message?: string) {
    const { hostServer, opsTask } = remoteCommand;
    const { cmd, cwd, code, stdout, stderr } = remoteCommand;

    const msg = [
      message,
      `HostServer: ${hostServer.brokerKey}:${hostServer.ssh_port}`,
      opsTask && `opsTask: ${opsTask.name}`,
      `cmd: ${cmd}`,
      `cwd: ${cwd}`,
      `code: ${code}`,
      `stdout: ${stdout}`,
      `stderr: ${stderr}`,
    ]
      .filter(Boolean)
      .join('\n');

    super(msg);
  }
}
