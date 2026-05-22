import { Test, TestingModule } from '@nestjs/testing';
import { ProcessType } from '@prisma/client';

import { HostServerModule } from 'src/host_server/host_server.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

import { ProcessMonitorService } from './process-monitor.service';

describe('ProcessMonitorService', () => {
  let service: ProcessMonitorService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, HostServerModule],
      providers: [ProcessMonitorService],
    }).compile();

    service = module.get<ProcessMonitorService>(ProcessMonitorService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  it('should create quote  process monitor and check process', async () => {
    const hostServer = await prismaService.hostServer.findFirst({
      where: {
        ssh_port: 12730,
      },
    });

    expect(hostServer).toBeDefined();

    const mainshmMonitor = await service.createProcessMonitor({
      name: 'mainshm.py',
      process_type: ProcessType.QUOTE,
      start_command:
        '/home/admin/anaconda3/bin/python3.8 common_v6/api/mainshm.py',
      command_pattern: 'common_v6/api/mainshm.py',
      hostServer: {
        connect: {
          id: hostServer.id,
        },
      },
    });

    await service.checkProcessStatus(
      await prismaService.processMonitor.findFirst({
        where: {
          id: mainshmMonitor.id,
        },
        include: {
          hostServer: true,
        },
      })
    );

    console.log(
      await prismaService.processStatus.findMany({
        where: {
          processMonitorId: mainshmMonitor.id,
        },
        include: {
          processMonitor: true,
        },
      })
    );

    const getAlphaPredictMonitor = await service.createProcessMonitor({
      name: 'get_alpha_predict.py',
      process_type: ProcessType.QUOTE,
      start_command:
        '/home/admin/anaconda3/bin/python3.8 common_v6/get_alpha_predict.py',
      command_pattern: 'common_v6/get_alpha_predict.py',
      hostServer: {
        connect: {
          id: hostServer.id,
        },
      },
    });

    await service.checkProcessStatus(
      await prismaService.processMonitor.findFirst({
        where: {
          id: getAlphaPredictMonitor.id,
        },
        include: {
          hostServer: true,
        },
      })
    );

    console.log(
      await prismaService.processStatus.findMany({
        where: {
          processMonitorId: getAlphaPredictMonitor.id,
        },
        include: {
          processMonitor: true,
        },
      })
    );

    const opClientMonitor = await service.createProcessMonitor({
      name: 'op_client.py',
      process_type: ProcessType.COMMUNICATION,
      start_command: '/home/admin/share_op/run_op_client.sh',
      command_pattern: 'op_client op_client.conf',
      hostServer: {
        connect: {
          id: hostServer.id,
        },
      },
    });

    await service.checkProcessStatus(
      await prismaService.processMonitor.findFirst({
        where: {
          id: opClientMonitor.id,
        },
        include: {
          hostServer: true,
        },
      })
    );

    console.log(
      await prismaService.processStatus.findMany({
        where: {
          processMonitorId: opClientMonitor.id,
        },
        include: {
          processMonitor: true,
        },
      })
    );

    // delete process monitor
    await prismaService.processMonitor.delete({
      where: {
        id: mainshmMonitor.id,
      },
    });

    await prismaService.processMonitor.delete({
      where: {
        id: getAlphaPredictMonitor.id,
      },
    });

    await prismaService.processMonitor.delete({
      where: {
        id: opClientMonitor.id,
      },
    });

    await prismaService.processStatus.deleteMany({
      where: {
        processMonitorId: mainshmMonitor.id,
      },
    });
  }, 3000000);

  xit('should create trader process monitor and check process', async () => {
    const hostServer = await prismaService.hostServer.findFirst({
      where: {
        ssh_port: 12730,
      },
    });

    expect(hostServer).toBeDefined();

    const processMonitor = await service.createProcessMonitor({
      name: 'maintrade.py',
      process_type: ProcessType.TRADER,
      start_command:
        '/home/admin/anaconda3/bin/python3.8 act_v6_109277002626/api/maintrade.py',
      command_pattern: 'act_v6_109277002626/api/maintrade.py',
      hostServer: {
        connect: {
          id: hostServer.id,
        },
      },
      fundAccount: {
        connect: {
          account: '109277002626',
        },
      },
    });

    await service.checkProcessStatus(
      await prismaService.processMonitor.findFirst({
        where: {
          id: processMonitor.id,
        },
        include: {
          hostServer: true,
        },
      })
    );

    const processStatus = await prismaService.processStatus.findMany({
      where: {
        processMonitorId: processMonitor.id,
      },
    });

    console.log(processStatus);

    // delete process monitor
    await prismaService.processMonitor.delete({
      where: {
        id: processMonitor.id,
      },
    });

    await prismaService.processStatus.deleteMany({
      where: {
        processMonitorId: processMonitor.id,
      },
    });
  });
});
