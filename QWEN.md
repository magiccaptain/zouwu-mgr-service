# ZouWu Manager Service

Always respond in 中文

## Project Overview

ZouWu Manager Service is a comprehensive trading and fund management system built with the NestJS framework using TypeScript. This service manages financial trading accounts, hosts, market data, and automated operations for financial trading systems. It serves as a backend service for managing trading infrastructure including fund accounts, host servers, market data, and operational warnings.

The application provides APIs for:
- Fund account management with support for both stock and futures accounts
- Host server monitoring and management
- Trading operations (orders, positions, trades)
- Market data management and snapshots
- Automated operational tasks and warnings
- Financial calculations and P&L tracking

## Architecture and Technologies

- **Framework**: NestJS (v9.x) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications
- **Database**: PostgreSQL with Prisma ORM for database operations, MongoDB for document storage
- **Caching**: Redis and Memcached for caching
- **Message Queue**: Bull (Redis-based queue) for background jobs
- **Time Series Data**: ClickHouse for storing market data
- **Authentication**: JWT with RSA key pair for token generation
- **MQTT**: For microservices communication (though currently commented out)
- **API Documentation**: Swagger/OpenAPI for API documentation generation
- **Scheduling**: Built-in NestJS scheduling for cron-like tasks

## Key Modules

- **Fund Account Module**: Manages different types of fund accounts (stock/futures) with brokers and companies
- **Host Server Module**: Monitors and manages host servers running trading applications
- **Operations (Ops) Module**: Handles automated tasks and warnings for operational monitoring
- **Market Value Module**: Tracks market values of positions
- **Quote Module**: Manages market data feeds
- **Remote Command Module**: Executes commands on remote servers
- **Valuation Calculation Module**: Calculates financial metrics and P&L
- **Warning Module**: Monitors and alerts for operational issues

## Building and Running

### Prerequisites

- Node.js (v18.x recommended based on Dockerfile)
- PNPM package manager
- PostgreSQL database
- MongoDB database
- Redis server
- Memcached server
- ClickHouse server
- Docker (for containerized deployment)

### Installation

```bash
# Install dependencies using pnpm
pnpm install
```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```shell
PORT=9527
MQTT_URL=mqtt://localhost:1883
DATABASE_URL=postgresql://user:password@localhost:5432/zouwu
MONGO_URL=mongodb://localhost:27017/zouwu-core-dev
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=zhisui
MEMCACHED_URL=localhost:11211
CLICKHOUSE_URL=http://localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_USERNAME=zouwu
CLICKHOUSE_PASSWORD=zouwu@stocker2024!
```

### Running the Application

```bash
# Development mode with auto-reload
pnpm start

# Debug mode
pnpm start:debug

# Production mode
pnpm start:prod

# Build the application
pnpm build
```

### Database Management

The application uses Prisma for database migrations and management:

```bash
# Sync database with schema (with force reset - use carefully!)
pnpm syncdb

# Deploy database migrations
pnpm deploydb

# Generate Prisma client
pnpm generate

# Run database migrations
pnpm migrate

# Seed database with initial data
pnpm seed
```

### Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run end-to-end tests
pnpm test:e2e

# Generate test coverage
pnpm test:cov
```

### Generating SDK

The application can generate an OpenAPI specification and client SDK:

```bash
# Generate openapi.json file
NODE_ENV=development pnpm start

# Generate SDK
pnpm gen:sdk
```

## Deployment

### Docker Deployment

The application can be built and deployed using Docker:

```bash
# Build and push Docker image
pnpm build:docker
```

### Production Deployment

The release script handles deployment to production:

```bash
# Run the release script (this stops PM2 process, builds, copies files, installs dependencies, runs migrations, and restarts PM2)
./release.sh
```

The release process:
1. Builds the project
2. Copies necessary files to the deployment directory
3. Installs production dependencies
4. Runs Prisma migrations and generates client
5. Deploys database schema
6. Seeds initial data
7. Restarts the PM2 process

## Database Schema

The application uses PostgreSQL with Prisma to manage the following key entities:

- **User**: System users with permissions
- **Session**: User session management
- **Broker**: Financial brokers
- **Company**: Financial companies
- **HostServer**: Host servers for trading applications
- **Product**: Financial products
- **FundAccount**: Trading accounts
- **XTPConfig** and **ATPConfig**: Trading API configurations
- **InnerFundSnapshot**: Fund snapshots at different times
- **TransferRecord**: Fund transfer records
- **Position**: Trading positions
- **Order**: Trading orders
- **Trade**: Executed trades
- **QuoteBrief**: Market quotes
- **MarketValue**: Market values
- **IndexWeight**: Index weights
- **DailyPnl**: Daily profit and loss calculations
- **OpsTask**: Operational tasks
- **OpsWarning**: Operational warnings
- **RemoteCommand**: Commands executed on remote servers

## Configuration

The application configuration is located in `src/config/settings.ts` and supports environment variable overrides:

- **Port**: API server port (default: 9527)
- **MongoDB**: Connection settings
- **Redis**: Connection settings for caching and queues
- **Memcached**: Connection settings for additional caching
- **ClickHouse**: Time series database for market data
- **SSH**: Settings for remote server access
- **Trading hours**: Start and end times for trading
- **Warning thresholds**: Disk usage, time differences, etc.

## Development Conventions

- Follow NestJS conventions for module structure and dependency injection
- Use TypeScript with strict null checks disabled (as configured in tsconfig.json)
- API endpoints follow REST conventions
- Authentication uses JWT with RSA key pairs
- Use Prisma for database operations
- Write unit tests with Jest
- Use ESLint and Prettier for code formatting

## Time Handling

The system uses millisecond timestamps consistently unless otherwise specified.

## JWT Token Generation

The application uses RSA key pairs for JWT token generation:

```bash
# Generate private key
ssh-keygen -t rsa -b 2048 -m PEM -f private.key

# Generate public key
ssh-keygen -f private.key -e -m PKCS8 > public.key
```
