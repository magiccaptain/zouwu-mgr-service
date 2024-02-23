// 从 v1 版本迁移数据
const { NestFactory } = require('@nestjs/core');
const commander = require('commander');

const { AppModule } = require('../dist/app.module');
const { AuthService } = require('../dist/auth');

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const authService = app.get(AuthService);

  // 创建初始化用户
  const token = await authService.signAccessToken(
    { id: 1, username: 'admin' },
    { expiresIn: '70d' }
  );

  app.close();
}

const program = new commander.Command();
program
  .name('generate-jwt')
  .option('-e, --expiresIn <timeSpan>', 'expiresIn 7d')
  .action((options) => {
    main()
      .catch((err) => {
        console.error(err);
        process.exit(1);
      })
      .then(() => {
        process.exit(0);
      });
  });

program.parse(process.argv);
