import {
  FundAccount,
  HostServer,
  Prisma,
  PrismaClient,
  ProcessType,
} from '@prisma/client';

type ProcessMonitorData = {
  name: string;
  process_type: ProcessType;
  start_command: string;
  command_pattern: string;
  config_files: string[];
  log_files: string[];
};

const process_monitor_data: ProcessMonitorData[] = [
  {
    name: 'mainshm',
    process_type: ProcessType.QUOTE,
    start_command:
      '{home_dir}/anaconda3/bin/python3.8 common_v6/api/mainshm.py',
    command_pattern: 'common_v6/api/mainshm.py',
    config_files: ['{home_dir}/common_v6/api/config.json'],
    log_files: ['{home_dir}/common_v6/market.log'],
  },
  {
    name: 'get_alpha_predict',
    process_type: ProcessType.QUOTE,
    start_command:
      '{home_dir}/anaconda3/bin/python3.8 common_v6/get_alpha_predict.py',
    command_pattern: 'common_v6/get_alpha_predict.py',
    config_files: ['{home_dir}/common_v6/api/config.json'],
    log_files: ['{home_dir}/common_v6/run/{date}/get_alpha_predict.py.log'],
  },
  {
    name: 'op_client',
    process_type: ProcessType.COMMUNICATION,
    start_command: '{home_dir}/share_op/run_op_client.sh',
    command_pattern: 'op_client op_client.conf',
    config_files: ['{home_dir}/share_op/op_client.conf'],
    log_files: ['{home_dir}/share_op/log/op_client.{date}.log'],
  },
  {
    name: 'op_server',
    process_type: ProcessType.COMMUNICATION,
    start_command: '{home_dir}/share_op/run_op_server.sh',
    command_pattern: 'op_server op_server.conf',
    config_files: ['{home_dir}/share_op/op_server.conf'],
    log_files: ['{home_dir}/share_op/log/op_server.{date}.log'],
  },
  {
    name: '{fund_account}/maintrade',
    process_type: ProcessType.TRADER,
    start_command:
      '{home_dir}/anaconda3/bin/python3.8 act_v6_{fund_account}/api/maintrade.py',
    command_pattern: 'act_v6_{fund_account}/api/maintrade.py',
    config_files: ['{home_dir}/act_v6_{fund_account}/api/config.json'],
    log_files: ['{home_dir}/act_v6_{fund_account}/trader.log'],
  },
  {
    name: '{fund_account}/model_trade',
    process_type: ProcessType.TRADER,
    start_command:
      '{home_dir}/anaconda3/bin/python3.8 act_v6_{fund_account}/api/maintrade.py',
    command_pattern: 'act_v6_{fund_account}/api/maintrade.py',
    config_files: ['{home_dir}/act_v6_{fund_account}/api/config.json'],
    log_files: ['{home_dir}/act_v6_{fund_account}/trader.log'],
  },
];

const init_monitors = async (
  hostServer: HostServer,
  fundAccounts: FundAccount[],
  monitors: ProcessMonitorData[],
  prisma: PrismaClient
) => {
  const update_data: Prisma.ProcessMonitorCreateInput[] = [];

  for (const monitor of monitors) {
    if (monitor.process_type === ProcessType.TRADER) {
      for (const fundAccount of fundAccounts) {
        const data = {
          name: monitor.name.replace('{fund_account}', fundAccount.account),
          process_type: monitor.process_type,
          start_command: monitor.start_command
            .replace('{home_dir}', hostServer.home_dir ?? '')
            .replace('{fund_account}', fundAccount.account),
          command_pattern: monitor.command_pattern
            .replace('{home_dir}', hostServer.home_dir ?? '')
            .replace('{fund_account}', fundAccount.account),
          hostServer: {
            connect: {
              id: hostServer.id,
            },
          },
          config_files: monitor.config_files.map((item) =>
            item
              .replace('{home_dir}', hostServer.home_dir ?? '')
              .replace('{fund_account}', fundAccount.account)
          ),
          log_files: monitor.log_files.map((item) =>
            item
              .replace('{home_dir}', hostServer.home_dir ?? '')
              .replace('{fund_account}', fundAccount.account)
          ),
          fundAccount: {
            connect: {
              account: fundAccount.account,
            },
          },
        };

        update_data.push(data);
      }
    }

    if (monitor.process_type !== ProcessType.TRADER) {
      const data = {
        name: monitor.name,
        process_type: monitor.process_type,
        start_command: monitor.start_command.replace(
          '{home_dir}',
          hostServer.home_dir ?? ''
        ),
        command_pattern: monitor.command_pattern.replace(
          '{home_dir}',
          hostServer.home_dir ?? ''
        ),
        hostServer: {
          connect: {
            id: hostServer.id,
          },
        },
        config_files: monitor.config_files.map((item) =>
          item.replace('{home_dir}', hostServer.home_dir ?? '')
        ),
        log_files: monitor.log_files.map((item) =>
          item.replace('{home_dir}', hostServer.home_dir ?? '')
        ),
      };
      update_data.push(data);
    }
  }

  for (const data of update_data) {
    await prisma.processMonitor.upsert({
      where: {
        hostServerId_name: {
          hostServerId: hostServer.id,
          name: data.name,
        },
      },
      create: data,
      update: data,
    });
  }
};

const init_quote_server = async (ssh_port: number, prisma: PrismaClient) => {
  const monitors = process_monitor_data.filter((item) =>
    ['mainshm', 'get_alpha_predict', 'op_server'].includes(item.name)
  );

  const hostServer = await prisma.hostServer.findFirst({
    where: {
      ssh_port: ssh_port,
    },
  });

  if (!hostServer) {
    console.error(`HostServer ${ssh_port} not found`);
    return;
  }

  await init_monitors(hostServer, [], monitors, prisma);
};

const init_trade_server = async (
  ssh_port: number,
  accounts: string[],
  prisma: PrismaClient
) => {
  const monitors = process_monitor_data.filter((item) =>
    [
      'mainshm',
      'get_alpha_predict',
      'op_server',
      'op_client',
      '{fund_account}/maintrade',
      '{fund_account}/model_trade',
    ].includes(item.name)
  );

  const hostServer = await prisma.hostServer.findFirst({
    where: {
      ssh_port: ssh_port,
    },
  });

  if (!hostServer) {
    console.error(`HostServer ${ssh_port} not found`);
    return;
  }

  const fundAccounts: FundAccount[] = [];

  for (const account of accounts) {
    const fundAccount = await prisma.fundAccount.findFirst({
      where: {
        account: account,
      },
    });
    if (fundAccount) {
      fundAccounts.push(fundAccount);
    } else {
      console.error(`FundAccount ${account} not found`);
    }
  }

  await init_monitors(hostServer, fundAccounts, monitors, prisma);
};

export async function seedProcessMonitor(prisma: PrismaClient) {
  // 中泰
  await init_quote_server(12710, prisma);
  await init_quote_server(12706, prisma);
  await init_quote_server(12752, prisma);

  // zhisui
  await init_trade_server(12730, ['109277002626'], prisma);
  await init_trade_server(12760, ['109277002626'], prisma);

  // zouwu
  await init_trade_server(
    13702,
    ['109180010410', '109004038415', '109004038416'],
    prisma
  );
  await init_trade_server(
    12714,
    ['109180010410', '109004038415', '109004038416'],
    prisma
  );

  // 国君
  await init_quote_server(12724, prisma);
  await init_quote_server(12764, prisma);
  await init_quote_server(12722, prisma);
  await init_quote_server(12726, prisma);

  await init_trade_server(
    12762,
    ['0311040018566660', '0331040028136983'],
    prisma
  );
  await init_trade_server(
    12766,
    ['0311040018566660', '0331040028136983'],
    prisma
  );

  // 国信
  await init_quote_server(12736, prisma);
  await init_quote_server(12734, prisma);
  await init_quote_server(12732, prisma);
  await init_quote_server(12740, prisma);

  await init_trade_server(
    12744,
    ['330200062400', '330200062401', '190000613731', '190000616455'],
    prisma
  );

  await init_trade_server(
    12742,
    ['330200062400', '330200062401', '190000613731', '190000616455'],
    prisma
  );

  // 中信
  await init_quote_server(12856, prisma);

  await init_trade_server(
    12852,
    ['101800002107', '101800002923', '101800002922', '101800003112'],
    prisma
  );
  await init_trade_server(
    12854,
    ['101800002107', '101800002923', '101800002922', '101800003112'],
    prisma
  );

  // 中金
  await init_quote_server(12774, prisma);

  await init_trade_server(12780, ['6687803588', '6699806238'], prisma);
  await init_trade_server(12772, ['6687803588', '6699806238'], prisma);

  console.log('ProcessMonitor seed done');
}
