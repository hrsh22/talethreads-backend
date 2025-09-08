# Talethreads Backend

A production-ready microservice architecture backend built with TypeScript, Node.js, and Express.

## Features

- **TypeScript**: Fully typed with strict configuration
- **Express.js**: Fast, unopinionated web framework
- **Zod Validation**: TypeScript-first schema validation for requests and configuration
- **Production Ready**: Comprehensive error handling, logging, and monitoring
- **Security**: Helmet, CORS, rate limiting, and security headers
- **Monitoring**: Health check endpoints and structured logging
- **Scalable**: Clean architecture with separated concerns

## Quick Start

### Prerequisites

**For Local Development:**

- Node.js >= 18.0.0
- npm >= 8.0.0

**For Docker Development (Recommended):**

- Docker
- Docker Compose

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run lint         # Run type checking and format check
npm run clean        # Clean build directory

# Docker scripts
npm run docker:dev   # Start development environment with hot reload
npm run docker:prod  # Start production environment

# Database scripts (using Drizzle ORM)
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema changes directly (dev only)
npm run db:studio    # Open Drizzle Studio (database admin UI)
npm run db:seed      # Seed database with initial data
```

## Docker Setup

### Prerequisites

- Docker
- Docker Compose

### Quick Start with Docker

#### Development Mode (with Hot Reload) ⚡ [Default]

```bash
# Start development environment with hot reload (default)
docker-compose up -d

# Or use npm script for explicit control
npm run docker:dev

# Access development server:
# - Backend API: http://localhost:3000 (hot reload enabled)
# - Redis Admin: http://localhost:8081
# - Database Admin: npm run db:studio (Drizzle Studio)
```

#### Production Mode

```bash
# Start production environment
npm run docker:prod

# View logs
docker-compose logs -f

# Access services:
# - Backend API: http://localhost:3000
# - Redis Admin: http://localhost:8081
# - Database Admin: npm run db:studio (Drizzle Studio)
```

### Docker Commands

#### Service Management

```bash
# Start development services (default)
docker-compose up -d

# Start production services
npm run docker:prod

# Start with logs visible
docker-compose up

# Stop all services
docker-compose down

# Rebuild and start (after code changes)
docker-compose up --build -d

# Restart specific service
docker-compose restart comics-ai-backend
```

#### Logs & Monitoring

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f comics-ai-backend
docker-compose logs -f postgres
docker-compose logs -f redis

# View service status
docker-compose ps
```

#### Database Operations

```bash
# Access PostgreSQL directly
docker-compose exec postgres psql -U postgres -d comics_ai

# Access PostgreSQL from host (port 5433)
psql -h localhost -p 5433 -U postgres -d comics_ai

# Create database backup
docker-compose exec postgres pg_dump -U postgres comics_ai > backup.sql

# Access Redis CLI
docker-compose exec redis redis-cli
```

#### Development Workflow

```bash
# Quick restart after code changes
docker-compose restart comics-ai-backend && docker-compose logs -f comics-ai-backend

# Development with hot reload (no restart needed!)
npm run docker:dev

# Health check
curl http://localhost:3000/health

# Complete cleanup (⚠️ removes all data)
docker-compose down -v
```

### Included Services

| Service           | Port | Description                           |
| ----------------- | ---- | ------------------------------------- |
| Comics AI Backend | 3000 | API server (prod/dev via npm scripts) |
| PostgreSQL        | 5433 | Database server                       |
| Redis             | 6379 | Cache & session store                 |
| Redis Commander   | 8081 | Redis management UI                   |
| Drizzle Studio    | 4983 | Database admin UI (run locally)       |

## Project Structure

```
src/
├── config/          # Configuration management
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Express app configuration
└── server.ts        # Server startup and shutdown
```

## API Endpoints

### Health Checks

- `GET /health` - Comprehensive health check with system metrics
- `GET /health/ready` - Readiness probe for Kubernetes
- `GET /health/live` - Liveness probe for Kubernetes

### Service Info

- `GET /` - Service information and status

### API Examples (v1)

- `POST /api/v1/ping` - Echo endpoint with validation
- `GET /api/v1/search` - Search endpoint with query validation
- `GET /api/v1/items/:id` - Get item by ID with UUID validation
- `GET /api/v1/error` - Test error handling

## Environment Variables

See `.env.example` for all available configuration options:

- **Server**: PORT, HOST, NODE_ENV
- **Service**: SERVICE_NAME, SERVICE_VERSION
- **Security**: CORS_ORIGIN, rate limiting settings
- **Logging**: LOG_LEVEL, LOG_FORMAT

## Production Deployment

### Option 1: Docker (Recommended)

```bash
# Start complete production stack
docker-compose up -d

# View logs
docker-compose logs -f

# Health check
curl http://localhost:3000/health
```

### Option 2: Node.js Direct

1. Build the application:

    ```bash
    npm run build
    ```

2. Set production environment variables

3. Start the server:
    ```bash
    npm start
    ```

## Features Included

✅ **Database**: PostgreSQL 17 with Drizzle ORM & Studio  
✅ **Caching**: Redis with management UI  
✅ **Containerization**: Full Docker setup  
✅ **Development Tools**: Drizzle Studio and Redis admin interfaces

## Future Enhancements

This foundation is ready for:

- **Authentication**: JWT-based auth system
- **File Storage**: MinIO for comic images
- **Monitoring**: Prometheus + Grafana
- **Load Balancing**: Nginx reverse proxy

## License

MIT
