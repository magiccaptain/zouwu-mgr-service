import { Market, PrismaClient, type Prisma } from '@prisma/client';

const xtpConfigs: Prisma.XTPConfigCreateManyInput[] = [
  {
    fund_account: '106110006463',
    market: Market.SH,
    ip: '10.101.6.82',
    port: 6102,
    user: '106110006463',
    password: '756840',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '106110006463',
    market: Market.SZ,
    ip: '10.36.118.46',
    port: 6102,
    user: '106110006463',
    password: '756840',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '106110007069',
    market: Market.SH,
    ip: '10.101.6.81',
    port: 6102,
    user: '106110007069',
    password: '756840',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '106110007069',
    market: Market.SZ,
    ip: '10.36.53.55',
    port: 6102,
    user: '106110007069',
    password: '756840',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109233002533',
    market: Market.SH,
    ip: '10.101.6.82',
    port: 6102,
    user: '109233002533',
    password: '911074',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109233002533',
    market: Market.SZ,
    ip: '10.36.118.50',
    port: 6102,
    user: '109233002533',
    password: '911074',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109277002421',
    market: Market.SH,
    ip: '10.101.6.81',
    port: 6102,
    user: '109277002421',
    password: '756840',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109277002421',
    market: Market.SZ,
    ip: '10.36.118.50',
    port: 6102,
    user: '109277002421',
    password: '756840',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109277002626',
    market: Market.SH,
    ip: '10.101.7.11',
    port: 6102,
    user: '109277002626',
    password: '125830',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109277002626',
    market: Market.SZ,
    ip: '10.36.53.55',
    port: 6102,
    user: '109277002626',
    password: '125830',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109289001865',
    market: Market.SH,
    ip: '10.101.6.81',
    port: 6102,
    user: '109289001865',
    password: '102106',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109289001865',
    market: Market.SZ,
    ip: '10.36.53.55',
    port: 6102,
    user: '109289001865',
    password: '102106',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109277002803',
    market: Market.SZ,
    ip: '10.36.53.55',
    port: 6102,
    user: '109277002803',
    password: '911074',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109180006960',
    market: Market.SH,
    ip: '10.101.6.81',
    port: 6102,
    user: '109180006960',
    password: '102106',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
  {
    fund_account: '109180006960',
    market: Market.SZ,
    ip: '10.36.53.55',
    port: 6102,
    user: '109180006960',
    password: '102106',
    account_key: '9491cb1f5bae809dd2eaf5a353a3cda0',
  },
];

const atpConfigs: Prisma.ATPConfigCreateManyInput[] = [
  // 国泰君安
  {
    fund_account: '0311040018566660',
    market: Market.SH,
    ip: '10.113.137.14',
    port: 32001,
    spare_ip: '10.113.137.114',
    spare_port: 32001,
    branch_id: '1104',
    cust_id: '03000066212779',
    cust_password:
      '55f2682392372195c597d446cc90378d43405d5f92d231f0e4df08d684ed1042',
    sh_account_id: 'B885914952',
    sz_account_id: '0899395758',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=192.168.113.254;IPORT=NA;LIP=192.168.113.254;MAC=000F53AA1371;HD=5A1739AC-3C2C-4CDB-A707-22710703;PCN=JQ-ZSSYSTEM-2;CPU=BFEBFBFF000606A6@ZHISUI;V1.0.0',
    user: 'zs01',
    password: 'cjs@zssys',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '0311040018566660',
    market: Market.SZ,
    ip: '10.197.77.11',
    port: 32001,
    spare_ip: '10.197.77.110',
    spare_port: 32001,
    branch_id: '1104',
    cust_id: '03000066212779',
    cust_password:
      '55f2682392372195c597d446cc90378d43405d5f92d231f0e4df08d684ed1042',
    sh_account_id: 'B885914952',
    sz_account_id: '0899395758',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=192.168.123.104;IPORT=NA;LIP=192.168.123.104;MAC=000F53A9C731;HD=8D93BCFC-49A7-4A8D-A06F-354E5A1D;PCN=SDC-ZSSYSTEM-4;CPU=BFEBFBFF000606A6@ZHISUI;V1.0.0',
    user: 'zs01',
    password: 'cjs@zssys',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '0343010010883355',
    market: Market.SH,
    ip: '10.113.137.14',
    port: 32001,
    spare_ip: '10.113.137.114',
    spare_port: 32001,
    branch_id: '8508',
    cust_id: '03000066839315',
    cust_password:
      '55f2682392372195c597d446cc90378d43405d5f92d231f0e4df08d684ed1042',
    sh_account_id: 'B882673769',
    sz_account_id: '0899192921',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=192.168.113.254;IPORT=NA;LIP=192.168.113.254;MAC=000F53AA1371;HD=5A1739AC-3C2C-4CDB-A707-22710703;PCN=JQ-ZSSYSTEM-2;CPU=BFEBFBFF000606A6@ZHISUI;V1.0.0',
    user: 'zs01',
    password: 'cjs@zssys',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '0343010010883355',
    market: Market.SZ,
    ip: '10.197.77.11',
    port: 32001,
    spare_ip: '10.197.77.110',
    spare_port: 32001,
    branch_id: '8508',
    cust_id: '03000066839315',
    cust_password:
      '55f2682392372195c597d446cc90378d43405d5f92d231f0e4df08d684ed1042',
    sh_account_id: 'B882673769',
    sz_account_id: '0899192921',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=192.168.123.104;IPORT=NA;LIP=192.168.123.104;MAC=000F53A9C731;HD=8D93BCFC-49A7-4A8D-A06F-354E5A1D;PCN=SDC-ZSSYSTEM-4;CPU=BFEBFBFF000606A6@ZHISUI;V1.0.0',
    user: 'zs01',
    password: 'cjs@zssys',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '0333010018328888',
    market: Market.SH,
    ip: '10.113.137.14',
    port: 32001,
    spare_ip: '10.113.137.114',
    spare_port: 32001,
    branch_id: '8359',
    cust_id: '03000066888176',
    cust_password:
      '55f2682392372195c597d446cc90378d43405d5f92d231f0e4df08d684ed1042',
    sh_account_id: 'B882518236',
    sz_account_id: '0899188678',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=192.168.113.254;IPORT=NA;LIP=192.168.113.254;MAC=000F53AA1371;HD=5A1739AC-3C2C-4CDB-A707-22710703;PCN=JQ-ZSSYSTEM-2;CPU=BFEBFBFF000606A6@ZHISUI;V1.0.0',
    user: 'zs01',
    password: 'cjs@zssys',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '0333010018328888',
    market: Market.SZ,
    ip: '10.197.77.11',
    port: 32001,
    spare_ip: '10.197.77.110',
    spare_port: 32001,
    branch_id: '8359',
    cust_id: '03000066888176',
    cust_password:
      '55f2682392372195c597d446cc90378d43405d5f92d231f0e4df08d684ed1042',
    sh_account_id: 'B882518236',
    sz_account_id: '0899188678',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=192.168.123.104;IPORT=NA;LIP=192.168.123.104;MAC=000F53A9C731;HD=8D93BCFC-49A7-4A8D-A06F-354E5A1D;PCN=SDC-ZSSYSTEM-4;CPU=BFEBFBFF000606A6@ZHISUI;V1.0.0',
    user: 'zs01',
    password: 'cjs@zssys',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  // 中金财富
  {
    fund_account: '6687802443',
    market: Market.SH,
    ip: '10.145.10.1',
    port: 32001,
    spare_ip: '10.145.10.2',
    spare_port: 32001,
    branch_id: '87',
    cust_id: '878005360',
    cust_password: '911074',
    sh_account_id: 'B885697893',
    sz_account_id: '0899382405',
    client_name: 'api_test',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=10.0.163.17;IPORT=NA;LIP=10.128.144.55;MAC=3CECEF8377D0;HD=BTYF209303BJ960CGN;PI=NA;VOL=NA;PCN=localhost.localdomain;CPU=57060500FFFBEBBF@ICN=ZHISUI;V0.0.1',
    user: 'zhjz2443',
    password: 'zhjz2443',
    order_way: 'P',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '6687802443',
    market: Market.SZ,
    ip: '10.144.10.1',
    port: 32001,
    spare_ip: '10.144.10.2',
    spare_port: 32001,
    branch_id: '87',
    cust_id: '878005360',
    cust_password: '911074',
    sh_account_id: 'B885697893',
    sz_account_id: '0899382405',
    client_name: 'api_test',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=10.0.163.17;IPORT=NA;LIP=10.128.144.55;MAC=3CECEF8377D0;HD=BTYF209303BJ960CGN;PI=NA;VOL=NA;PCN=localhost.localdomain;CPU=57060500FFFBEBBF@ICN=ZHISUI;V0.0.1',
    user: 'zhjz2443',
    password: 'zhjz2443',
    order_way: 'P',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '6687803588',
    market: Market.SH,
    ip: '10.145.10.4',
    port: 32001,
    spare_ip: '10.145.10.5',
    spare_port: 32001,
    branch_id: '87',
    cust_id: '878006056',
    cust_password: '911074',
    sh_account_id: 'B885714580',
    sz_account_id: '0899383432',
    client_name: 'api_test',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=10.0.163.17;IPORT=NA;LIP=10.128.144.55;MAC=3CECEF8377D0;HD=BTYF209303BJ960CGN;PI=NA;VOL=NA;PCN=localhost.localdomain;CPU=57060500FFFBEBBF@ICN=ZHISUI;V0.0.1',
    user: 'xxjy3588',
    password: 'xxjy3588',
    order_way: 'P',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '6687803588',
    market: Market.SZ,
    ip: '10.144.10.6',
    port: 32001,
    spare_ip: '10.144.10.7',
    spare_port: 32001,
    branch_id: '87',
    cust_id: '878006056',
    cust_password: '911074',
    sh_account_id: 'B885714580',
    sz_account_id: '0899383432',
    client_name: 'api_test',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=10.0.163.17;IPORT=NA;LIP=10.128.144.55;MAC=3CECEF8377D0;HD=BTYF209303BJ960CGN;PI=NA;VOL=NA;PCN=localhost.localdomain;CPU=57060500FFFBEBBF@ICN=ZHISUI;V0.0.1',
    user: 'xxjy3588',
    password: 'xxjy3588',
    order_way: 'P',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '8250001541',
    market: Market.SH,
    ip: '10.145.10.4',
    port: 32001,
    spare_ip: '10.145.10.5',
    spare_port: 32001,
    branch_id: '8250',
    cust_id: '99001066',
    cust_password: '911074',
    sh_account_id: 'B882518228',
    sz_account_id: '0899188677',
    client_name: 'api_test',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=10.0.163.17;IPORT=NA;LIP=10.128.144.55;MAC=3CECEF8377D0;HD=BTYF209303BJ960CGN;PI=NA;VOL=NA;PCN=localhost.localdomain;CPU=57060500FFFBEBBF@ICN=ZHISUI;V0.0.1',
    user: 'zstz1541',
    password: 'zstz1541',
    order_way: 'P',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '8250001541',
    market: Market.SZ,
    ip: '10.144.10.6',
    port: 32001,
    spare_ip: '10.144.10.7',
    spare_port: 32001,
    branch_id: '8250',
    cust_id: '99001066',
    cust_password: '911074',
    sh_account_id: 'B882518228',
    sz_account_id: '0899188677',
    client_name: 'api_test',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=10.0.163.17;IPORT=NA;LIP=10.128.144.55;MAC=3CECEF8377D0;HD=BTYF209303BJ960CGN;PI=NA;VOL=NA;PCN=localhost.localdomain;CPU=57060500FFFBEBBF@ICN=ZHISUI;V0.0.1',
    user: 'zstz1541',
    password: 'zstz1541',
    order_way: 'P',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '6687803026',
    market: Market.SZ,
    ip: '10.144.10.1',
    port: 32001,
    spare_ip: '10.144.10.2',
    spare_port: 32001,
    branch_id: '87',
    cust_id: '878005690',
    cust_password: '911074',
    sh_account_id: 'B885914936',
    sz_account_id: '0899395759',
    client_name: 'api_test',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=10.0.163.17;IPORT=NA;LIP=10.128.144.55;MAC=3CECEF8377D0;HD=BTYF209303BJ960CGN;PI=NA;VOL=NA;PCN=localhost.localdomain;CPU=57060500FFFBEBBF@ICN=ZHISUI;V0.0.1',
    user: 'zhjz3026',
    password: 'zhjz3026',
    order_way: 'P',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '6687803026',
    market: Market.SH,
    ip: '10.145.10.1',
    port: 32001,
    spare_ip: '10.145.10.2',
    spare_port: 32001,
    branch_id: '87',
    cust_id: '878005690',
    cust_password: '911074',
    sh_account_id: 'B885914936',
    sz_account_id: '0899395759',
    client_name: 'api_test',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=10.0.163.17;IPORT=NA;LIP=10.128.144.55;MAC=3CECEF8377D0;HD=BTYF209303BJ960CGN;PI=NA;VOL=NA;PCN=localhost.localdomain;CPU=57060500FFFBEBBF@ICN=ZHISUI;V0.0.1',
    user: 'zhjz3026',
    password: 'zhjz3026',
    order_way: 'P',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '6687803668',
    market: Market.SZ,
    ip: '10.144.10.6',
    port: 32001,
    spare_ip: '10.144.10.7',
    spare_port: 32001,
    branch_id: '87',
    cust_id: '878006136',
    cust_password: '911074',
    sh_account_id: 'B886370745',
    sz_account_id: '0899422507',
    client_name: 'api_test',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=10.0.163.17;IPORT=NA;LIP=10.128.144.55;MAC=3CECEF8377D0;HD=BTYF209303BJ960CGN;PI=NA;VOL=NA;PCN=localhost.localdomain;CPU=57060500FFFBEBBF@ICN=ZHISUI;V0.0.1',
    user: 'zstz3668',
    password: 'zstz3668',
    order_way: 'P',
    account_mode: 2,
    login_mode: 1,
  },
  {
    fund_account: '6687803668',
    market: Market.SH,
    ip: '10.145.10.4',
    port: 32001,
    spare_ip: '10.145.10.5',
    spare_port: 32001,
    branch_id: '87',
    cust_id: '878006136',
    cust_password: '911074',
    sh_account_id: 'B886370745',
    sz_account_id: '0899422507',
    client_name: 'api_test',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC;IIP=10.0.163.17;IPORT=NA;LIP=10.128.144.55;MAC=3CECEF8377D0;HD=BTYF209303BJ960CGN;PI=NA;VOL=NA;PCN=localhost.localdomain;CPU=57060500FFFBEBBF@ICN=ZHISUI;V0.0.1',
    user: 'zstz3668',
    password: 'zstz3668',
    order_way: 'P',
    account_mode: 2,
    login_mode: 1,
  },

  // 国信
  {
    fund_account: '190000613731',
    market: Market.SZ,
    ip: '10.35.184.200',
    port: 32001,
    spare_ip: '10.35.184.200',
    spare_port: 32001,
    branch_id: '1900',
    cust_id: '190000613731',
    cust_password: '15/J7wg7sMW+2sca8hR86g==',
    sh_account_id: 'B885652990',
    sz_account_id: '0899379565',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.35.81.205#IPORT~NA#LIP~10.35.81.205#MAC~000F53B8B5F0#HD~24F24684-0800-4EE4-8BE4-BBD503A9#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agw190000613731',
    password: 'agw190000613731',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '190000613731',
    market: Market.SH,
    ip: '10.49.140.210',
    port: 32001,
    spare_ip: '10.49.140.210',
    spare_port: 32001,
    branch_id: '1900',
    cust_id: '190000613731',
    cust_password: '15/J7wg7sMW+2sca8hR86g==',
    sh_account_id: 'B885652990',
    sz_account_id: '0899379565',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.49.129.64#IPORT~NA#LIP~10.49.129.64#MAC~000F53B8D510#HD~98DF6710-AF01-495E-86F7-B9F98C0A#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agwsh190000613731',
    password: 'agw190000613731',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '330200062401',
    market: Market.SZ,
    ip: '10.35.184.200',
    port: 32001,
    spare_ip: '10.35.184.200',
    spare_port: 32001,
    branch_id: '3302',
    cust_id: '330200062401',
    cust_password: 'TbNWCsuchICcuq+IdBFrjA==',
    sh_account_id: 'B885652283',
    sz_account_id: '0899379523',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.35.81.205#IPORT~NA#LIP~10.35.81.205#MAC~000F53B8B5F0#HD~24F24684-0800-4EE4-8BE4-BBD503A9#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agw330200062401',
    password: 'agw330200062401',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '330200062401',
    market: Market.SH,
    ip: '10.49.140.210',
    port: 32001,
    spare_ip: '10.49.140.210',
    spare_port: 32001,
    branch_id: '3302',
    cust_id: '330200062401',
    cust_password: 'TbNWCsuchICcuq+IdBFrjA==',
    sh_account_id: 'B885652283',
    sz_account_id: '0899379523',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.49.129.64#IPORT~NA#LIP~10.49.129.64#MAC~000F53B8D510#HD~98DF6710-AF01-495E-86F7-B9F98C0A#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agwsh330200062401',
    password: 'agw330200062401',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '330200063628',
    market: Market.SZ,
    ip: '10.35.184.200',
    port: 32001,
    spare_ip: '10.35.184.200',
    spare_port: 32001,
    branch_id: '3302',
    cust_id: '330200063628',
    cust_password: 'LKxB8Z2V0+Yy6+m7oxbr8g==',
    sh_account_id: 'B885914944',
    sz_account_id: '0899395760',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.35.81.205#IPORT~NA#LIP~10.35.81.205#MAC~000F53B8B5F0#HD~24F24684-0800-4EE4-8BE4-BBD503A9#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agw330200063628',
    password: 'agw330200063628',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '330200063628',
    market: Market.SH,
    ip: '10.49.140.210',
    port: 32001,
    spare_ip: '10.49.140.210',
    spare_port: 32001,
    branch_id: '3302',
    cust_id: '330200063628',
    cust_password: 'LKxB8Z2V0+Yy6+m7oxbr8g==',
    sh_account_id: 'B885914944',
    sz_account_id: '0899395760',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.49.129.64#IPORT~NA#LIP~10.49.129.64#MAC~000F53B8D510#HD~98DF6710-AF01-495E-86F7-B9F98C0A#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agwsh330200063628',
    password: 'agw330200063628',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '190000616455',
    market: Market.SZ,
    ip: '10.35.184.200',
    port: 32001,
    spare_ip: '10.35.184.200',
    spare_port: 32001,
    branch_id: '1900',
    cust_id: '190000616455',
    cust_password: '9xwekUoVKnAITUHJuGQJTA==',
    sh_account_id: 'B886260461',
    sz_account_id: '0899416299',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.35.81.205#IPORT~NA#LIP~10.35.81.205#MAC~000F53B8B5F0#HD~24F24684-0800-4EE4-8BE4-BBD503A9#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agw190000616455',
    password: 'agw190000616455',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '190000616455',
    market: Market.SH,
    ip: '10.49.140.210',
    port: 32001,
    spare_ip: '10.49.140.210',
    spare_port: 32001,
    branch_id: '1900',
    cust_id: '190000616455',
    cust_password: '9xwekUoVKnAITUHJuGQJTA==',
    sh_account_id: 'B886260461',
    sz_account_id: '0899416299',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.49.129.64#IPORT~NA#LIP~10.49.129.64#MAC~000F53B8D510#HD~98DF6710-AF01-495E-86F7-B9F98C0A#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agwsh190000616455',
    password: 'agw190000616455',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '330200063150',
    market: Market.SZ,
    ip: '10.35.184.200',
    port: 32001,
    spare_ip: '10.35.184.200',
    spare_port: 32001,
    branch_id: '3302',
    cust_id: '330200063150',
    cust_password: 'wlJKLp152aKsue7ufMgk6w==',
    sh_account_id: 'B885825551',
    sz_account_id: '0899390415',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.35.81.205#IPORT~NA#LIP~10.35.81.205#MAC~000F53B8B5F0#HD~24F24684-0800-4EE4-8BE4-BBD503A9#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agw330200063150',
    password: 'agw330200063150',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '330200063150',
    market: Market.SH,
    ip: '10.49.140.210',
    port: 32001,
    spare_ip: '10.49.140.210',
    spare_port: 32001,
    branch_id: '3302',
    cust_id: '330200063150',
    cust_password: 'wlJKLp152aKsue7ufMgk6w==',
    sh_account_id: 'B885825551',
    sz_account_id: '0899390415',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.49.129.64#IPORT~NA#LIP~10.49.129.64#MAC~000F53B8D510#HD~98DF6710-AF01-495E-86F7-B9F98C0A#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agwsh330200063150',
    password: 'agw330200063150',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '420000234031',
    market: Market.SZ,
    ip: '10.35.184.200',
    port: 32001,
    spare_ip: '10.35.184.200',
    spare_port: 32001,
    branch_id: '4200',
    cust_id: '420000234031',
    cust_password: 'BOdeTdOgpz4/3SKk4TDdzw==',
    sh_account_id: 'B886105857',
    sz_account_id: '0899407332',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.35.81.205#IPORT~NA#LIP~10.35.81.205#MAC~000F53B8B5F0#HD~24F24684-0800-4EE4-8BE4-BBD503A9#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agw420000234031',
    password: 'agw420000234031',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '420000234031',
    market: Market.SH,
    ip: '10.49.140.210',
    port: 32001,
    spare_ip: '10.49.140.210',
    spare_port: 32001,
    branch_id: '4200',
    cust_id: '420000234031',
    cust_password: 'BOdeTdOgpz4/3SKk4TDdzw==',
    sh_account_id: 'B886105857',
    sz_account_id: '0899407332',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.49.129.64#IPORT~NA#LIP~10.49.129.64#MAC~000F53B8D510#HD~98DF6710-AF01-495E-86F7-B9F98C0A#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agwsh420000234031',
    password: 'agw420000234031',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '330200062400',
    market: Market.SZ,
    ip: '10.35.184.200',
    port: 32001,
    spare_ip: '10.35.184.200',
    spare_port: 32001,
    branch_id: '3302',
    cust_id: '330200062400',
    cust_password: 'HA1m9Hicfm5KRqq/5RCwfw==',
    sh_account_id: 'B885652974',
    sz_account_id: '0899379566',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.35.81.205#IPORT~NA#LIP~10.35.81.205#MAC~000F53B8B5F0#HD~24F24684-0800-4EE4-8BE4-BBD503A9#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agw330200062400',
    password: 'agw330200062400',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '330200062400',
    market: Market.SH,
    ip: '10.49.140.210',
    port: 32001,
    spare_ip: '10.49.140.210',
    spare_port: 32001,
    branch_id: '3302',
    cust_id: '330200062400',
    cust_password: 'HA1m9Hicfm5KRqq/5RCwfw==',
    sh_account_id: 'B885652974',
    sz_account_id: '0899379566',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.49.129.64#IPORT~NA#LIP~10.49.129.64#MAC~000F53B8D510#HD~98DF6710-AF01-495E-86F7-B9F98C0A#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agwsh330200062400',
    password: 'agw330200062400',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '330200063539',
    market: Market.SZ,
    ip: '10.35.184.200',
    port: 32001,
    spare_ip: '10.35.184.200',
    spare_port: 32001,
    branch_id: '3302',
    cust_id: '330200063539',
    cust_password: 'oc2udjaobwZTDQ8tvRO/PA==',
    sh_account_id: 'B886105873',
    sz_account_id: '0899407334',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.35.81.205#IPORT~NA#LIP~10.35.81.205#MAC~000F53B8B5F0#HD~24F24684-0800-4EE4-8BE4-BBD503A9#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agw330200063539',
    password: 'agw330200063539',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },

  {
    fund_account: '330200063539',
    market: Market.SH,
    ip: '10.49.140.210',
    port: 32001,
    spare_ip: '10.49.140.210',
    spare_port: 32001,
    branch_id: '3302',
    cust_id: '330200063539',
    cust_password: 'oc2udjaobwZTDQ8tvRO/PA==',
    sh_account_id: 'B886105873',
    sz_account_id: '0899407334',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'PC#IIP~10.49.129.64#IPORT~NA#LIP~10.49.129.64#MAC~000F53B8D510#HD~98DF6710-AF01-495E-86F7-B9F98C0A#PCN~LOCALHOST.LOCALDOMAI#CPU~BFEBFBFF000606A6@TNV~V3.43-DKHDZ-A33',
    user: 'agwsh330200063539',
    password: 'agw330200063539',
    order_way: 'N',
    account_mode: 2,
    login_mode: 1,
  },
  // 中信
  {
    fund_account: '101800002107',
    market: Market.SH,
    ip: '172.18.196.50',
    port: 32001,
    spare_ip: '172.18.196.50',
    spare_port: 32001,
    branch_id: '1018',
    cust_id: '4120358',
    cust_password: '911074',
    sh_account_id: 'B884951757',
    sz_account_id: '0899332979',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'ZXATP0172_SHZSLHTRD--PC;IIP=NA;IPORT=NA;LIP=10.12.182.248;MAC=3CECEFADBB12;HD=WD-WCC4M6JDT97K@Zhisui;V0.0.1;ZHUANXIAN;ZJ-ZHISUI',
    user: 'ZXATP0172_SHZSLHTRD',
    password: 'ZXATP0172@',
    order_way: '3',
    account_mode: 2,
    login_mode: 2,
  },

  {
    fund_account: '101800002107',
    market: Market.SZ,
    ip: '172.27.12.50',
    port: 32001,
    spare_ip: '172.27.12.50',
    spare_port: 32001,
    branch_id: '1018',
    cust_id: '4120358',
    cust_password: '911074',
    sh_account_id: 'B884951757',
    sz_account_id: '0899332979',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'ZXATP0172_SHZSLHTRD--PC;IIP=NA;IPORT=NA;LIP=10.12.182.248;MAC=3CECEFADBB12;HD=WD-WCC4M6JDT97K@Zhisui;V0.0.1;ZHUANXIAN;ZJ-ZHISUI',
    user: 'ZXATP0172_SHZSLHTRD',
    password: 'ZXATP0172@',
    order_way: '3',
    account_mode: 2,
    login_mode: 2,
  },

  {
    fund_account: '21800009262',
    market: Market.SH,
    ip: '172.18.196.50',
    port: 32001,
    spare_ip: '172.18.196.50',
    spare_port: 32001,
    branch_id: '218',
    cust_id: '4083009',
    cust_password: '911074',
    sh_account_id: 'B882676563',
    sz_account_id: '0899193056',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'ZXATP0172_SHZSLHTRD--PC;IIP=NA;IPORT=NA;LIP=10.12.182.248;MAC=3CECEFADBB12;HD=WD-WCC4M6JDT97K@Zhisui;V0.0.1;ZHUANXIAN;ZJ-ZHISUI',
    user: 'ZXATP0172_SHZSLHTRD',
    password: 'ZXATP0172@',
    order_way: '3',
    account_mode: 2,
    login_mode: 2,
  },

  {
    fund_account: '21800009262',
    market: Market.SZ,
    ip: '172.27.12.50',
    port: 32001,
    spare_ip: '172.27.12.50',
    spare_port: 32001,
    branch_id: '218',
    cust_id: '4083009',
    cust_password: '911074',
    sh_account_id: 'B882676563',
    sz_account_id: '0899193056',
    client_name: 'ZHISUI',
    client_version: 'V1.0.0',
    client_feature_code:
      'ZXATP0172_SHZSLHTRD--PC;IIP=NA;IPORT=NA;LIP=10.12.182.248;MAC=3CECEFADBB12;HD=WD-WCC4M6JDT97K@Zhisui;V0.0.1;ZHUANXIAN;ZJ-ZHISUI',
    user: 'ZXATP0172_SHZSLHTRD',
    password: 'ZXATP0172@',
    order_way: '3',
    account_mode: 2,
    login_mode: 2,
  },
];

export async function seedXTPConfigs(prisma: PrismaClient) {
  for (const config of xtpConfigs) {
    await prisma.xTPConfig.upsert({
      where: {
        fund_account_market: {
          fund_account: config.fund_account,
          market: config.market,
        },
      },
      create: config,
      update: config,
    });
  }

  console.log('xtpConfigs seed done');
}

export async function seedATPConfigs(prisma: PrismaClient) {
  for (const config of atpConfigs) {
    await prisma.aTPConfig.upsert({
      where: {
        fund_account_market: {
          fund_account: config.fund_account,
          market: config.market,
        },
      },
      create: config,
      update: config,
    });
  }

  console.log('atpConfigs seed done');
}
