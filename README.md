# ArchiveNET API

> **Decentralized AI Memory Platform** - Store, retrieve, and share AI conversation memories using vector embeddings on the Arweave blockchain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Arweave](https://img.shields.io/badge/Arweave-000000?logo=arweave&logoColor=white)](https://www.arweave.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

## What is ArchiveNET?

ArchiveNET is a **subscription-based AI memory platform** that allows AI agents and MCP (Model Context Protocol) servers to store and retrieve conversation memories using advanced vector search technology. Built on the Arweave blockchain for permanent storage and powered by our custom HNSW vector database engine (Eizen).

## Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **PostgreSQL** database (we recommend [Neon](https://neon.tech/) for serverless)
- **Redis** for caching and job queues
- **Arweave** wallet for blockchain operations

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Itz-Agasta/archivenet-api.git
cd archivenet-api
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Environment setup:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup:**

```bash
# Generate and run database migrations
pnpm db:generate
pnpm db:migrate

# Seed development data
pnpm db:seed
```

### Development

Start the development server with hot reload:

```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

### Production

1. **Build the project:**

```bash
pnpm build
```

2. **Start the production server:**

```bash
pnpm start
```

## Available Scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `pnpm dev`         | Start development server with hot reload |
| `pnpm build`       | Build TypeScript to JavaScript           |
| `pnpm start`       | Start production server                  |
| `pnpm clean`       | Remove build directory                   |
| `pnpm check`       | Run Biome linter and formatter           |
| `pnpm check:ci`    | Run Biome checks for CI                  |
| `pnpm db:generate` | Generate Drizzle migrations              |
| `pnpm db:migrate`  | Run database migrations                  |
| `pnpm db:seed`     | Seed database with development data      |
| `pnpm test`        | Run test suite                           |
| `pnpm test:watch`  | Run tests in watch mode                  |

> NOTE: some scripts are still in development

## Core Concepts

### Memory Storage Flow

1. **User registers** → Arweave contract deployed
2. **AI agent stores memory** → Text → Vector embedding → Eizen → Arweave
3. **Search request** → Query embedding → Vector similarity search (Eizen) → Results

### Subscription Model

- **Basic ($5/month)**: 1,000 memories, 5 AI agents, email support
- **Pro ($15/month)**: 10,000 memories, unlimited agents, priority support
- **Enterprise ($50/month)**: Unlimited memories, team features, dedicated support

## Project Structure

```
archivenet-api/
├── 📄 package.json
├── 📄 drizzle.config.ts
├── 📄 docker-compose.yml
├── 📄 .env.example
├── 📁 docs/
│   ├── 📄 ArchiveNET.md
│   ├── 📁 api/
│   │   └── 📄 schemas.md
│   └── 📁 eizen/
├── 📁 src/
│   ├── 📄 server.ts                 # Express app entry point
│   ├── 📁 config/
│   │   ├── 📄 database.ts           # Neon + Drizzle connection
│   │   ├── 📄 redis.ts              # Redis cache configuration
│   │   └── 📄 arweave.ts            # Arweave blockchain setup
│   ├── 📁 database/
│   │   ├── 📁 schema/               # Drizzle table definitions
│   │   │   ├── 📄 users.ts          # User accounts & subscriptions
│   │   │   ├── 📄 contracts.ts      # Arweave contract mappings
│   │   │   ├── 📄 apiKeys.ts        # API keys with scopes
│   │   │   ├── 📄 usage.ts          # Usage tracking & billing
│   │   │   └── 📄 index.ts          # Schema exports
│   │   ├── 📁 migrations/           # Auto-generated migrations
│   │   └── 📁 seeds/                # Database seeding
│   ├── 📁 models/                   # Database query operations
│   │   ├── 📄 User.ts               # User CRUD with Drizzle
│   │   ├── 📄 Contract.ts           # Contract management
│   │   ├── 📄 ApiKey.ts             # API key operations
│   │   └── 📄 Usage.ts              # Usage tracking queries
│   ├── 📁 services/                 # Business logic layer
│   │   ├── 📄 EizenService.ts       # Vector database operations
│   │   ├── 📄 EmbeddingService.ts   # Text-to-vector conversion
│   │   ├── 📄 ArweaveService.ts     # Blockchain operations
│   │   ├── 📄 AuthService.ts        # Authentication logic
│   │   └── 📄 BillingService.ts     # Usage tracking & billing
│   ├── 📁 middlewares/              # Express middleware
│   │   ├── 📄 errorHandler.ts       # Global error handling   ✅
│   │   ├── 📄 auth.ts               # JWT & API key validation
│   │   ├── 📄 validation.ts         # Zod schema validation
│   │   └── 📄 rateLimiting.ts       # Rate limiting per tier
│   ├── 📁 routes/                   # API endpoint definitions
│   │   ├── 📄 auth.ts               # Authentication endpoints
│   │   ├── 📄 users.ts              # User management
│   │   ├── 📄 vectors.ts            # Vector operations
│   │   ├── 📄 memories.ts           # Memory management
│   │   ├── 📄 search.ts             # Search endpoints
│   │   └── 📄 health.ts             # Health checks
│   ├── 📁 schemas/                  # Zod validation schemas
│   │   ├── 📄 common.ts             # Foundation schemas      ✅
│   │   ├── 📄 vector.ts             # Vector operations       ✅
│   │   ├── 📄 memory.ts             # Memory management       ✅
│   │   ├── 📄 auth.ts               # Authentication schemas
│   │   └── 📄 user.ts               # User management schemas
│   ├── 📁 utils/                    # Helper functions
│   │   ├── 📄 responses.ts          # Standardized responses  ✅
│   │   ├── 📄 logger.ts             # Structured logging
│   │   └── 📄 crypto.ts             # Encryption utilities
│   ├── 📁 jobs/                     # Background processing
│   │   ├── 📄 embeddingProcessor.ts # Process embeddings
│   │   ├── 📄 usageAggregator.ts    # Usage data aggregation
│   │   └── 📄 contractMonitor.ts    # Contract health monitoring
│   └── 📁 types/                    # TypeScript definitions
│       ├── 📄 express.d.ts          # Express extensions
│       └── 📄 database.d.ts         # Database types
├── 📁 tests/                        # Test suite
│   ├── 📁 unit/                     # Unit tests
│   ├── 📁 integration/              # Integration tests
│   └── 📁 e2e/                      # End-to-end tests
└── 📁 scripts/                      # Development scripts
    ├── 📄 migrate.ts                # Database migrations
    └── 📄 seed.ts                   # Database seeding
```

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/archivenet"
REDIS_URL="redis://localhost:6379"

# Arweave
ARWEAVE_WALLET_PATH="./wallet.json"
ARWEAVE_GATEWAY="https://arweave.net"

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Embedding Service
OPENAI_API_KEY="your-openai-key"
EMBEDDING_MODEL="text-embedding-3-small"

# Server
PORT=3000
NODE_ENV="development"
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

## Documentation

- **[API Documentation](./docs/api/)** - Complete API reference
- **[Eizen Vector Database](./docs/eizen/)** - Vector database guides
- **[Architecture Overview](./docs/ArchiveNET.md)** - System design
- **[Deployment Guide](./docs/deployment/)** - Production setup

## Roadmap

### Phase 1: Foundation

- [x] setup the project env
- [x] Core schemas and validation
- [x] Error handling and responses
- [x] Project structure

### Phase 2: Core Services

- [ ] Database setup with Drizzle + Neon
- [ ] Authentication and authorization
- [ ] Eizen vector database integration

### Phase 3: API Endpoints

- [ ] User management routes
- [ ] Memory operations
- [ ] Vector operations
- [ ] Search functionality

### Phase 4: Advanced Features

- [ ] Analytics and reporting
- [ ] Data export/import
- [ ] Background job processing
- [ ] Comprehensive testing

### Phase 5: Production Ready

- [ ] Performance optimization
- [ ] Security hardening
- [ ] Monitoring and alerting
- [ ] Documentation completion

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
