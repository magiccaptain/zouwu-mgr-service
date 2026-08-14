#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

interface ResetPasswordOptions {
  username: string;
  password: string;
}

async function resetPassword(options: ResetPasswordOptions) {
  const { username, password } = options;

  try {
    if (password.length < 8) {
      throw new Error('新密码至少需要 8 位');
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.error(`❌ 用户 "${username}" 不存在`);
      process.exit(1);
    }

    // 生成新密码哈希
    const hashedPassword = bcryptjs.hashSync(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      await tx.user.update({
        where: { username },
        data: {
          password: hashedPassword,
          needResetPwd: true,
          updatedAt: new Date(),
        },
      });
    });

    console.log(`✅ 用户 "${username}" 的密码已成功重置`);
    console.log('🔒 该用户的所有现有会话已失效');
    console.log(`👤 用户ID: ${user.id}`);
    console.log(`📧 用户邮箱: ${user.email || '未设置'}`);
    console.log(`📱 用户手机: ${user.phone || '未设置'}`);
  } catch (error) {
    console.error('❌ 重置密码时发生错误:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 解析命令行参数
function parseArgs(): ResetPasswordOptions {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      '使用方法: ts-node bin/reset-password.ts <用户名> <新密码>'
    );
    console.log('');
    console.log('参数说明:');
    console.log('  <用户名>    要重置密码的用户名');
    console.log('  <新密码>    至少 8 位的新密码（使用 bcryptjs 加密）');
    console.log('');
    console.log('示例:');
    console.log('  ts-node bin/reset-password.ts admin newpassword123');
    process.exit(1);
  }

  const username = args[0];
  const password = args[1];

  if (!username || !password) {
    console.error('❌ 用户名和密码不能为空');
    process.exit(1);
  }

  return { username, password };
}

// 主函数
async function main() {
  console.log('🔐 用户密码重置工具');
  console.log('==================');

  const options = parseArgs();

  console.log(`🎯 目标用户: ${options.username}`);
  console.log('');

  await resetPassword(options);
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  process.exit(1);
});

// 运行主函数
main().catch((error) => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
