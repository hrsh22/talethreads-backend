# Talethreads Backend

A clean, production-ready backend service built with TypeScript, Node.js, and Express.

## Features

- TypeScript with strict mode
- Structured logging (Winston)
- Validated config (Zod)
- Health endpoints and error handling
- Drizzle ORM (PostgreSQL), Redis cache

## Quick Start (local)

```bash
# 1) Install
npm install

# 2) Configure env
cp .env.example .env

# 3) Run dev server (hot reload)
npm run dev
```

## Scripts (most used)

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript to dist (tsc)
npm run start        # Start compiled server (dist/server.js)

# Database (Drizzle)
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio
```

## Docker (development)

```bash
npm run docker:dev       # Start dev stack (backend + postgres + redis)
npm run docker:dev:build # Rebuild and start
npm run docker:dev:down  # Stop stack
```

## Production (EC2 quick steps)

```bash
# 1) On EC2: clone and install
git clone https://github.com/yourusername/talethreads-backend.git
cd talethreads-backend
npm ci --only=production

# 2) Load environment variables
# Option A: use defaults from .env (converted) — then:
source scripts/set_env.sh
# Option B: export your own env vars

# 3) Build and migrate
npm run build
npm run db:migrate

# 4) Start (example with PM2)
pm2 start npm --name "talethreads-backend" -- run start
pm2 save
```

## Environment Variables

- See `.env.example` for all available options
- For production, you can source `scripts/set_env.sh` (exports based on your .env)

## Minimal Project Structure

```
src/
├── config/      # Zod-validated config
├── middleware/  # Logging, security, errors
├── routes/      # API routes (health, v1)
├── db/          # Drizzle schema & migrations
├── utils/       # Logger, validation
├── app.ts       # Express app
└── server.ts    # Server start
```

## License

MIT
