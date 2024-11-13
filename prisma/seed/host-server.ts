import { Broker, PrismaClient, type Prisma } from '@prisma/client';

const company_data: Prisma.CompanyCreateInput[] = [
  {
    key: 'zhisui',
    name: '致邃投资',
  },
  {
    key: 'zouwu',
    name: '驺吾',
  },
];

const host_server_data: Prisma.HostServerCreateManyInput[] = [
  {
    name: '国君(上海)-12762',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12762,
    host_ip: '10.113.155.72',
    brokerKey: 'guojun',
    market: 'SH',
    home_dir: '/root',
    companyKey: 'zhisui',
    is_master: true,
  },
  {
    name: '国君(上海)-12722',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12722,
    host_ip: '10.113.155.71',
    brokerKey: 'guojun',
    market: 'SH',
    home_dir: '/root',
    companyKey: 'zhisui',
  },
  {
    name: '国君(深圳)-12766',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12766,
    host_ip: '10.197.91.58',
    brokerKey: 'guojun',
    market: 'SZ',
    home_dir: '/root',
    companyKey: 'zhisui',
  },
  {
    name: '国君(深圳)-12724',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12724,
    host_ip: '10.197.91.55',
    home_dir: '/root',
    brokerKey: 'guojun',
    market: 'SZ',
    companyKey: 'zhisui',
  },
  {
    name: '国君(深圳)-12726',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12726,
    host_ip: '10.197.91.56',
    brokerKey: 'guojun',
    market: 'SZ',
    home_dir: '/root',
    companyKey: 'zhisui',
    is_master: true,
  },
  {
    name: '国君(深圳)-12764',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12764,
    host_ip: '10.197.91.57',
    brokerKey: 'guojun',
    market: 'SZ',
    home_dir: '/root',
    companyKey: 'zhisui',
  },
  {
    name: '中泰(上海)-12710',
    ssh_host: 'localhost',
    ssh_user: 'admin',
    ssh_port: 12710,
    host_ip: '10.101.5.177',
    brokerKey: 'xtp',
    market: 'SH',
    home_dir: '/home/admin',
    companyKey: 'zhisui',
  },
  {
    name: '中泰(上海)-12730',
    ssh_host: 'localhost',
    ssh_user: 'admin',
    ssh_port: 12730,
    host_ip: '10.101.5.178',
    brokerKey: 'xtp',
    market: 'SH',
    home_dir: '/home/admin',
    companyKey: 'zhisui',
    is_master: true,
  },
  {
    name: '中泰(上海)-驺吾-12714',
    ssh_host: 'localhost',
    ssh_user: 'admin',
    ssh_port: 12714,
    host_ip: '10.101.2.42',
    brokerKey: 'xtp',
    market: 'SH',
    home_dir: '/home/admin',
    companyKey: 'zouwu',
    is_master: true,
  },
  {
    name: '中泰(深圳)-12706',
    ssh_host: 'localhost',
    ssh_user: 'admin',
    ssh_port: 12706,
    host_ip: '10.36.117.118',
    brokerKey: 'xtp',
    market: 'SZ',
    home_dir: '/home/admin',
    companyKey: 'zhisui',
  },
  {
    name: '中泰(深圳)-12712',
    ssh_host: 'localhost',
    ssh_user: 'admin',
    ssh_port: 12712,
    host_ip: '10.36.117.109',
    brokerKey: 'xtp',
    market: 'SZ',
    home_dir: '/home/admin',
    companyKey: 'zhisui',
  },
  {
    name: '中泰(深圳)-12752',
    ssh_host: 'localhost',
    ssh_user: 'admin',
    ssh_port: 12752,
    host_ip: '10.36.121.136',
    brokerKey: 'xtp',
    market: 'SZ',
    home_dir: '/home/admin',
    companyKey: 'zhisui',
  },
  {
    name: '中泰(深圳)-12760',
    ssh_host: 'localhost',
    ssh_user: 'admin',
    ssh_port: 12760,
    host_ip: '10.36.120.156',
    brokerKey: 'xtp',
    market: 'SZ',
    home_dir: '/home/admin',
    companyKey: 'zhisui',
    is_master: true,
  },
  {
    name: '中泰(深圳)-12703',
    ssh_host: 'localhost',
    ssh_user: 'admin',
    ssh_port: 12703,
    host_ip: '10.101.2.89',
    brokerKey: 'xtp',
    market: 'SZ',
    home_dir: '/home/admin',
    companyKey: 'zhisui',
  },
  {
    name: '中泰(深圳)-驺吾-13702',
    ssh_host: 'localhost',
    ssh_user: 'admin',
    ssh_port: 13702,
    host_ip: '10.36.121.42',
    brokerKey: 'xtp',
    market: 'SZ',
    home_dir: '/home/admin',
    companyKey: 'zouwu',
    is_master: true,
  },
  {
    name: '中金-深圳-12772',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12772,
    host_ip: '10.128.144.55',
    brokerKey: 'zhongjin',
    market: 'SZ',
    home_dir: '/root',
    companyKey: 'zhisui',
    is_master: true,
  },
  {
    name: '中金-深圳-12774',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12774,
    host_ip: '10.128.144.56',
    brokerKey: 'zhongjin',
    market: 'SZ',
    home_dir: '/root',
    companyKey: 'zhisui',
  },
  {
    name: '中金-深圳-12776',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12776,
    host_ip: '10.128.144.62',
    brokerKey: 'zhongjin',
    market: 'SZ',
    home_dir: '/root',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '中金-深圳-12778',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12778,
    host_ip: '10.128.144.63',
    brokerKey: 'zhongjin',
    market: 'SZ',
    home_dir: '/root',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '中金-上海-12780',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12780,
    host_ip: '10.129.145.34',
    brokerKey: 'zhongjin',
    market: 'SH',
    home_dir: '/root',
    companyKey: 'zhisui',
    is_master: true,
  },
  {
    name: '中金-上海-12782',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12782,
    host_ip: '10.129.145.35',
    brokerKey: 'zhongjin',
    market: 'SH',
    home_dir: '/root',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '国信-深圳-12732',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12732,
    host_ip: '10.35.81.164',
    home_dir: '/root',
    brokerKey: 'guoxin',
    market: 'SZ',
    companyKey: 'zhisui',
  },
  {
    name: '国信-深圳-12734',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12734,
    host_ip: '10.35.81.166',
    home_dir: '/root',
    brokerKey: 'guoxin',
    market: 'SZ',
    companyKey: 'zhisui',
  },
  {
    name: '国信-深圳-12740',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12740,
    host_ip: '10.35.81.95',
    home_dir: '/root',
    brokerKey: 'guoxin',
    market: 'SZ',
    companyKey: 'zhisui',
  },
  {
    name: '国信-深圳-12742',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12742,
    host_ip: '10.35.81.205',
    home_dir: '/root',
    brokerKey: 'guoxin',
    market: 'SZ',
    companyKey: 'zhisui',
    is_master: true,
  },
  {
    name: '国信-上海-12736',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12736,
    host_ip: '10.49.128.132',
    home_dir: '/root',
    brokerKey: 'guoxin',
    market: 'SH',
    companyKey: 'zhisui',
  },
  {
    name: '国信-上海-12744',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12744,
    host_ip: '10.49.129.64',
    home_dir: '/root',
    brokerKey: 'guoxin',
    market: 'SH',
    companyKey: 'zhisui',
    is_master: true,
  },
  {
    name: '中金EQ-深圳-50',
    ssh_host: '59.36.190.215',
    ssh_user: 'root',
    ssh_port: 8843,
    host_ip: '59.36.190.215',
    home_dir: '/root',
    brokerKey: 'zhongjin_eq',
    market: 'SZ',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '中金EQ-深圳-51',
    ssh_host: '59.36.190.216',
    ssh_user: 'root',
    ssh_port: 8843,
    host_ip: '59.36.190.216',
    home_dir: '/root',
    brokerKey: 'zhongjin_eq',
    market: 'SZ',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '中金EQ-上海-12802',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12802,
    host_ip: '10.95.221.26',
    home_dir: '/root',
    brokerKey: 'zhongjin_eq',
    market: 'SH',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '中金EQ-上海-12804',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12804,
    host_ip: '10.95.221.27',
    home_dir: '/root',
    brokerKey: 'zhongjin_eq',
    market: 'SH',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '方正-深圳-12812',
    ssh_host: 'localhost',
    ssh_user: 'zszb',
    ssh_port: 12812,
    host_ip: '10.128.7.113',
    home_dir: '/home/zszb',
    brokerKey: 'fangzheng',
    market: 'SZ',
    is_master: true,
    companyKey: 'zhisui',
  },
  {
    name: '方正-深圳-12814',
    ssh_host: 'localhost',
    ssh_user: 'zszb',
    ssh_port: 12814,
    host_ip: '10.128.7.114',
    home_dir: '/home/zszb',
    brokerKey: 'fangzheng',
    market: 'SZ',
    is_master: true,
    companyKey: 'zhisui',
  },
  {
    name: '方正-上海-12816',
    ssh_host: 'localhost',
    ssh_user: 'zszb',
    ssh_port: 12816,
    host_ip: '10.129.6.49',
    home_dir: '/home/zszb',
    brokerKey: 'fangzheng',
    market: 'SH',
    companyKey: 'zhisui',
  },
  {
    name: '招商-上海-12822',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12822,
    host_ip: '10.236.27.181',
    home_dir: '/root',
    brokerKey: 'zhaoshang_dma',
    market: 'SH',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '招商-深圳-12824',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12824,
    host_ip: '10.237.30.208',
    home_dir: '/root',
    brokerKey: 'zhaoshang_dma',
    market: 'SH',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '招商-深圳-12826',
    ssh_host: 'localhost',
    ssh_user: 'root',
    ssh_port: 12826,
    host_ip: '10.237.30.209',
    home_dir: '/root',
    brokerKey: 'zhaoshang_dma',
    market: 'SH',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '安信-上海-12842',
    ssh_host: 'localhost',
    ssh_user: 'zwtz',
    ssh_port: 12842,
    host_ip: '10.10.91.84',
    home_dir: '/home/zwtz',
    brokerKey: 'anxin',
    market: 'SH',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '安信-深圳-12844',
    ssh_host: 'localhost',
    ssh_user: 'zwtz',
    ssh_port: 12844,
    host_ip: '10.10.91.160',
    home_dir: '/home/zwtz',
    brokerKey: 'anxin',
    market: 'SZ',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '安信-深圳-12846',
    ssh_host: 'localhost',
    ssh_user: 'zwtz',
    ssh_port: 12846,
    host_ip: '10.10.91.161',
    home_dir: '/home/zwtz',
    brokerKey: 'anxin',
    market: 'SZ',
    active: false,
    companyKey: 'zhisui',
  },
  {
    name: '中信-上海-12852',
    ssh_host: 'localhost',
    ssh_user: 'zhisui',
    ssh_port: 12852,
    host_ip: '10.12.182.248',
    home_dir: '/home/zhisui',
    brokerKey: 'zhongxin',
    market: 'SH',
    companyKey: 'zhisui',
    is_master: true,
  },
  {
    name: '中信-深圳-12854',
    ssh_host: 'localhost',
    ssh_user: 'zhisui',
    ssh_port: 12854,
    host_ip: '10.27.91.226',
    home_dir: '/home/zhisui',
    brokerKey: 'zhongxin',
    market: 'SZ',
    companyKey: 'zhisui',
    is_master: true,
  },
  {
    name: '中信-深圳-12856',
    ssh_host: 'localhost',
    ssh_user: 'zhisui',
    ssh_port: 12856,
    host_ip: '10.27.91.225',
    home_dir: '/home/zhisui',
    brokerKey: 'zhongxin',
    market: 'SZ',
    companyKey: 'zhisui',
  },
  {
    name: '127服务器',
    ssh_host: '1.119.134.78',
    ssh_user: 'root',
    ssh_port: 12701,
    host_ip: '1.119.134.78',
    home_dir: '/root',
    active: false,
    market: 'SH',
    companyKey: 'zhisui',
    brokerKey: 'xtp',
  },
];

export async function seedHostServer(prisma: PrismaClient) {
  for (const company of company_data) {
    await prisma.company.upsert({
      where: {
        key: company.key,
      },
      create: company,
      update: company,
    });
  }

  console.log('Company seed done.');

  for (const host_server of host_server_data) {
    await prisma.hostServer.upsert({
      where: {
        market_brokerKey_companyKey_ssh_host_ssh_port: {
          market: host_server.market!,
          brokerKey: host_server.brokerKey!,
          companyKey: host_server.companyKey!,
          ssh_host: host_server.ssh_host!,
          ssh_port: host_server.ssh_port!,
        },
      },
      create: host_server,
      update: host_server,
    });
  }

  console.log('HostServer seed done.');
}
