import {
  NodeSSH,
  SSHExecCommandOptions,
  SSHExecCommandResponse,
} from 'node-ssh';

import { settings } from 'src/config';

export type SSH2Config = {
  host: string;
  port: number;
  username: string;
};

export function ssh2Exec(
  config: SSH2Config,
  command: string,
  options?: SSHExecCommandOptions
): Promise<SSHExecCommandResponse> {
  return new Promise(async (resolve, reject) => {
    const cmd_ssh = new NodeSSH();

    try {
      await cmd_ssh.connect({
        ...config,
        privateKeyPath: settings.ssh.local_private_key_path,
      });

      cmd_ssh.connection.on('end', () => {
        reject('Disconnect');
      });

      const ret = await cmd_ssh.execCommand(command, options);

      resolve(ret);
    } catch (error) {
      reject(error);
    } finally {
      cmd_ssh.dispose();
    }
  });
}
