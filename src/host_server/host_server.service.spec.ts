import fs from 'fs';
import os from 'os';
import path from 'path';

import { Market } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { RemoteCommandService } from 'src/remote-command';

import { HostServerService } from './host_server.service';

describe('HostServerService', () => {
  let service: HostServerService;
  let prismaService: {
    hostServer: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    xTPConfig: { findFirst: jest.Mock };
    fundAccount: { findFirst: jest.Mock };
  };
  let remoteCommandService: jest.Mocked<RemoteCommandService>;

  beforeEach(() => {
    prismaService = {
      hostServer: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      xTPConfig: { findFirst: jest.fn() },
      fundAccount: { findFirst: jest.fn() },
    };
    remoteCommandService = {} as unknown as jest.Mocked<RemoteCommandService>;
    service = new HostServerService(
      prismaService as unknown as PrismaService,
      remoteCommandService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncTDConfig (ssh 写入落到本机目录)', () => {
    let home_dir: string;

    beforeEach(() => {
      home_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hostsrv-'));
    });

    afterEach(() => {
      fs.rmSync(home_dir, { recursive: true, force: true });
    });

    /**
     * 用一个假的 NodeSSH 替换真实连接：putFile 直接把临时文件拷到本机目录
     * （相当于 SSH 到 127.0.0.1 写本地文件），从而无需真实托管机即可验证 INI 生成与落盘。
     */
    const fakeSsh = () => {
      const putFile = jest.fn(async (local: string, remote: string) => {
        fs.mkdirSync(path.dirname(remote), { recursive: true });
        fs.copyFileSync(local, remote);
      });
      return {
        ssh: {
          execCommand: jest
            .fn()
            .mockResolvedValue({ code: 0, stdout: '', stderr: '' }),
          putFile,
          dispose: jest.fn(),
        },
        putFile,
      };
    };

    it('生成 INI 并写入 home_dir/td_config/<account>.config.ini（剔除 null 字段）', async () => {
      const hostServer = {
        id: 1,
        brokerKey: 'guojun',
        home_dir,
        ssh_host: '127.0.0.1',
        ssh_port: 22,
        ssh_user: 'tester',
      } as any;

      const tdConfig = {
        fund_account: 'ACC001',
        market: Market.SH,
        ip: '10.0.0.1',
        port: 6001,
        user: 'u',
        password: 'p',
        spare_ip: null, // 应被剔除
        spare_port: null, // 应被剔除
        account_mode: 2,
      } as any;

      const { ssh, putFile } = fakeSsh();
      jest.spyOn(service, 'connect').mockResolvedValue(ssh as any);

      await service.syncTDConfig(hostServer, tdConfig);

      const written = path.join(home_dir, 'td_config', 'ACC001.config.ini');
      expect(fs.existsSync(written)).toBe(true);
      expect(putFile).toHaveBeenCalledWith(expect.any(String), written);

      const content = fs.readFileSync(written, 'utf-8');
      expect(content).toContain('[trader]');
      expect(content).toContain('[atp_guojun_td]');
      expect(content).toContain('fund_account_id=ACC001');
      expect(content).toContain('ip=10.0.0.1');
      expect(content).toContain('port=6001');
      // null 字段应被剔除
      expect(content).not.toMatch(/spare_ip=/);
      expect(content).not.toMatch(/spare_port=/);
      expect(ssh.dispose).toHaveBeenCalled();
    });

    it('未知券商直接返回，不进行任何写入', async () => {
      const hostServer = {
        id: 2,
        brokerKey: 'unknown_broker',
        home_dir,
      } as any;
      const { ssh, putFile } = fakeSsh();
      const connectSpy = jest
        .spyOn(service, 'connect')
        .mockResolvedValue(ssh as any);

      await service.syncTDConfig(hostServer, {
        fund_account: 'ACC002',
        market: Market.SZ,
      } as any);

      expect(connectSpy).not.toHaveBeenCalled();
      expect(putFile).not.toHaveBeenCalled();
    });
  });

  xit('should sync xtp config', async () => {
    const hostServer = await prismaService.hostServer.findFirst({
      where: {
        active: true,
        is_master: true,
        brokerKey: 'xtp',
      },
    });

    const xtpConfig = await prismaService.xTPConfig.findFirst({});

    await service.syncTDConfig(hostServer, xtpConfig);
  });

  xit('should sync atp config', async () => {
    const fundAccount = await prismaService.fundAccount.findFirst({
      where: {
        brokerKey: 'guojun',
      },
      include: {
        ATPConfig: true,
      },
    });

    const { ATPConfig = [] } = fundAccount;

    for (const atpConfig of ATPConfig) {
      const hostServer = await prismaService.hostServer.findFirst({
        where: {
          active: true,
          is_master: true,
          brokerKey: 'guojun',
          market: atpConfig.market,
        },
      });
      await service.syncTDConfig(hostServer, atpConfig);
    }
  });
});
