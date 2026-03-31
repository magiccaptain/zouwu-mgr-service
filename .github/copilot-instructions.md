# Project Guidelines

## Code Style
- Use NestJS conventions: PascalCase for classes, camelCase for methods/variables, kebab-case for files.
- Absolute imports with 'src/' prefix (e.g., `import { settings } from 'src/config'`).
- ESLint + Prettier enforced. Run `pnpm lint` and `pnpm format`.
- TypeScript with strictNullChecks disabled - be cautious with null/undefined.

## Architecture
- NestJS monolith with feature-based modules (fund_account, host_server, ops-task, etc.).
- Prisma ORM with PostgreSQL, multi-schema (public/operational).
- Services use dependency injection, async/await patterns.
- Remote operations via SSH, caching with Memcached, events with @nestjs/event-emitter.
- See README.md for high-level architecture.

## Build and Test
- Install: `pnpm install`
- Build: `pnpm build` (NestJS CLI)
- Start dev: `pnpm start` (watch mode)
- Test: `pnpm test` (Jest), `pnpm run test:e2e` for integration
- DB: `pnpm run syncdb` to push schema, `pnpm run seed` to populate
- Docker: `pnpm run build:docker`

## Conventions
- DTOs with class-transformer/class-validator for validation.
- Logging via @nestjs/common Logger.
- Custom error codes in common/err-code.ts.
- Date handling with dayjs.
- SSH commands with 10s timeout default.
- Scripts in bin/ for operational tasks (e.g., data sync, calculations).
- See docs/ops-task-workflow.md for cron schedules and data flows.</content>
<parameter name="filePath">/home/shaochen/projects/zouwu/zouwu-mgr-service/.github/copilot-instructions.md