import { setTimeout } from 'timers/promises';

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

export function SSH2Exec(
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
      cmd_ssh?.dispose();
    }
  });
}

/**
 *  自动重试
 * @param config
 * @param command
 * @param options
 * @param max_retry 最大重试次数
 */
export async function SafeSSH2Exec(
  config: SSH2Config,
  command: string,
  options?: SSHExecCommandOptions,
  max_retry = 3
) {
  let times = 0;
  while (times < max_retry) {
    try {
      const ret = await SSH2Exec(config, command, options);
      return ret;
    } catch (error) {
      console.error(error);
      times++;
      const wait_time = Math.pow(2, times) * 1000;
      console.log(
        `Exec command ${command} failed, after ${
          wait_time / 1000
        }s, retry ${times} times...`
      );
      await setTimeout(wait_time);
      continue;
    }
  }

  throw new Error(`Can not exec command ${command}`);
}

/**
 * 远程从服务器中拉取文件
 * @param config
 * @param local_file
 * @param remote_file
 */
export function PullRemoteFile(
  config: SSH2Config,
  local_file: string,
  remote_file: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const scp_ssh = new NodeSSH();
    try {
      await scp_ssh.connect({
        ...config,
        privateKeyPath: settings.ssh.local_private_key_path,
      });

      scp_ssh.connection.on('end', () => {
        reject('Disconnect');
      });

      await scp_ssh.getFile(local_file, remote_file);
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      scp_ssh?.dispose();
    }
  });
}

/**
 * 拉取远程文件，自动重试
 * @param config
 * @param local_file
 * @param remote_file
 * @param max_retry
 * @returns
 */
export function SafePullRemoteFile(
  config: SSH2Config,
  local_file: string,
  remote_file: string,
  max_retry = 3
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    let times = 0;
    while (times < max_retry) {
      try {
        await PullRemoteFile(config, local_file, remote_file);
        resolve();
        return;
      } catch (error) {
        console.error(error);
        times++;
        const wait_time = Math.pow(2, times) * 1000;
        console.log(
          `Pull remote file ${remote_file} failed, after ${
            wait_time / 1000
          }s, retry ${times} times...`
        );
        await setTimeout(wait_time);
        continue;
      }
    }

    reject(new Error(`Can not pull remote file ${remote_file}`));
  });
}
