const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const fs = require('fs');

const { HostingServerService } = require('../dist/hosting-servers');

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const hostingServerService = app.get(HostingServerService);

  const servers = JSON.parse(fs.readFileSync('./data/hosting-servers.json'));

  for (const server of servers) {
    await hostingServerService.create({
      name: server.name,
      host_ip: server.ip,
      ssh_host: server.host,
      ssh_port: server.port,
      ssh_user: server.user,
      market: server.market,
      broker: server.broker,
      home_dir: server.home_dir,
      trade_data_dir: server.trade_data_dir,
      op_data_dir: server.op_data_dir,
    });
  }

  app.close();
}

main();
