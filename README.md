# ArchiveNET API

> Backend API for ArchiveNET: A Memory Sharing Protocol for LLMs and Agents

## Quick Start

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Itz-Agasta/archivenet-api.git
cd archivenet-api
```

2. Install dependencies:

```bash
pnpm install
```

3. Create environment file:

```bash
cp .env.example .env
```

### Development

Start the development server with hot reload:

```bash
pnpm dev
```

The server will start at `http://localhost:3000`

### Production

1. Build the project:

```bash
pnpm build
```

2. Start the production server:

```bash
pnpm start
```

## Available Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `pnpm dev`      | Start development server with hot reload |
| `pnpm build`    | Build TypeScript to JavaScript           |
| `pnpm start`    | Start production server                  |
| `pnpm clean`    | Remove build directory                   |
| `pnpm check`    | Run Biome linter and formatter           |
| `pnpm check:ci` | Run Biome checks for CI                  |

## Project Structure

```
archivenet-api/
├── package.json                     # Express.js API server
├── tsconfig.json
├── docker-compose.yml               # PostgreSQL + Redis setup
├── .env.example
├── src/
│   ├── server.ts                    # Express app entry point
│   ├── config/
│   │   ├── database.ts              # PostgreSQL connection (Prisma/TypeORM)
│   │   ├── redis.ts                 # Redis cache configuration
│   │   └── arweave.ts               # Warp + Arweave setup
│   ├── models/
│   │   ├── User.ts                  # User account model
│   │   ├── ApiToken.ts              # API token model
│   │   ├── VectorContract.ts        # User's contract mapping
│   │   ├── MemoryEntry.ts           # Memory storage logs
│   │   └── Usage.ts                 # Usage tracking
│   ├── services/
│   │   ├── AuthService.ts           # JWT + session management
│   │   ├── UserService.ts           # User CRUD operations
│   │   ├── ContractService.ts       # Deploy/manage Arweave contracts
│   │   ├── VectorService.ts         # Vector operations wrapper
│   │   ├── EmbeddingService.ts      # OpenAI/Cohere embedding generation
│   │   ├── UsageService.ts          # Cost tracking and quotas
│   │   └── BillingService.ts        # Stripe integration
│   ├── controllers/
│   │   ├── authController.ts        # POST /auth/register, /auth/login
│   │   ├── userController.ts        # GET /users/profile, PATCH /users/profile
│   │   ├── vectorController.ts      # POST /vectors, GET /vectors/search
│   │   ├── tokensController.ts      # POST /tokens, DELETE /tokens/:id
│   │   └── usageController.ts       # GET /usage/stats
│   ├── middleware/
│   │   ├── auth.ts                  # JWT token validation
│   │   ├── apiToken.ts              # API token middleware
│   │   ├── rateLimit.ts             # Rate limiting per user
│   │   ├── usage.ts                 # Track API usage
│   │   └── cors.ts                  # CORS configuration
│   ├── routes/
│   │   ├── auth.ts                  # Authentication routes
│   │   ├── users.ts                 # User management routes
│   │   ├── vectors.ts               # Vector operations routes
│   │   ├── tokens.ts                # API token routes
│   │   └── usage.ts                 # Usage statistics routes
│   ├── jobs/
│   │   ├── deployContract.ts        # Background contract deployment
│   │   ├── processUsage.ts          # Usage aggregation
│   │   └── billingCycle.ts          # Monthly billing
│   ├── utils/
│   │   ├── logger.ts                # Winston logging
│   │   ├── validation.ts            # Joi/Zod schemas
│   │   ├── encryption.ts            # Data encryption
│   │   └── errors.ts                # Custom error classes
│   └── types/
│       ├── api.ts                   # API request/response types
│       ├── user.ts                  # User-related types
│       └── vector.ts                # Vector operation types
├── prisma/                          # Database schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── tests/
└── scripts/
    └── deploy.ts                    # Deployment scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

This project uses Biome for consistent code formatting and linting:

```bash
# Check and fix code style
pnpm check

# Check only (for CI)
pnpm check:ci
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues & Support

If you encounter any issues or need support, please [open an issue](../../issues) on GitHub.
