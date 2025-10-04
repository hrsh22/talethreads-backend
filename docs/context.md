# Talethreads Backend - Architecture & Context Reference

## Project Overview

**Project Name**: Talethreads Backend
**Description**: Production-ready microservice architecture backend for Talethreads platform  
**Author**: hrsh22  
**Version**: 1.0.0  
**License**: MIT

## Current Status

**Project Phase**: Foundation Setup Complete  
**Last Updated**: Fresh codebase with core infrastructure  
**Branch**: main (no commits yet - all files untracked)

### What's Implemented ✅

1. **Core Infrastructure**

    - Express.js server setup with TypeScript
    - Production-ready middleware stack
    - Docker containerization (dev + prod)
    - Health monitoring endpoints
    - Structured logging with Winston
    - Request/response validation with Zod

2. **Security Features**

    - Helmet security headers
    - CORS configuration
    - Rate limiting
    - Request ID tracking
    - Error handling with custom error classes

3. **Development Tooling**

    - TypeScript strict configuration
    - Prettier formatting
    - Development hot reload with tsx
    - Path alias resolution (@/\* imports)

4. **Infrastructure & Database**
    - PostgreSQL 17 database
    - Drizzle ORM with TypeScript integration
    - Database migrations and schema management
    - Drizzle Studio (database admin UI)
    - Redis caching
    - Redis admin UI (Redis Commander) - Development only

### What's Not Implemented ❌

1. **Advanced Database Features**

    - Database seeding/fixtures
    - Advanced indexing strategies
    - Database performance monitoring

2. **Authentication & Authorization**

    - JWT implementation
    - User management
    - Role-based access control

3. **Business Logic**

    - Content management APIs
    - AI processing endpoints
    - File upload/storage

## Technology Stack

### Core Runtime

- **Node.js**: ≥22.0.0 (Alpine Linux in containers)
- **TypeScript**: 5.3.2 (strict configuration)
- **Express.js**: 4.18.2 (web framework)

### Validation & Types

- **Zod**: 3.22.4 (preferred validation - user memory confirmed)
- **UUID**: 9.0.1 (request tracking)

### Security & Middleware

- **Helmet**: 7.1.0 (security headers)
- **CORS**: 2.8.5 (cross-origin requests)
- **express-rate-limit**: 7.1.5 (rate limiting)
- **compression**: 1.7.4 (response compression)

### Logging & Monitoring

- **Winston**: 3.11.0 (structured logging)
- **Health checks**: Custom implementation with system metrics

### Database & Infrastructure

- **PostgreSQL**: 17-alpine (primary database on port 5433)
- **Drizzle ORM**: 0.44.4 (TypeScript-first ORM)
- **Drizzle Kit**: 0.31.4 (migrations and Studio)
- **Redis**: alpine (caching/sessions)
- **Docker**: Multi-stage builds with security best practices

### Development Tools

- **tsx**: 4.6.2 (TypeScript execution)
- **Prettier**: 3.1.0 (code formatting)
- **TypeScript**: Strict mode with path aliases

## Architecture Patterns

### Directory Structure

```
src/
├── app.ts           # Express app configuration & middleware setup
├── server.ts        # Server startup & graceful shutdown
├── config/          # Environment configuration with Zod validation
├── middleware/      # Custom middleware (logging, security, errors)
├── routes/          # API route handlers (health, API v1)
├── types/           # TypeScript type definitions
└── utils/           # Utility functions (logging, validation)
```

### Middleware Stack (Order Matters)

1. **Trust Proxy**: For accurate IPs behind load balancers
2. **Security**: Helmet + custom security headers
3. **CORS**: Configurable origins
4. **Rate Limiting**: 100 requests/15min window (configurable)
5. **Body Parsing**: JSON/URL-encoded (10MB limit)
6. **Compression**: Gzip/deflate
7. **Request Logging**: Winston with request IDs
8. **Routes**: API handlers
9. **404 Handler**: Custom not found
10. **Error Handler**: Global error processing

### Configuration Management

- **Environment Variables**: Validated with Zod schemas
- **Type-Safe Config**: AppConfig interface
- **Defaults**: Sensible fallbacks for all settings
- **Validation**: Startup fails on invalid config

### Error Handling Strategy

- **Custom Error Classes**: `CustomError` with status codes
- **Operational vs Programming Errors**: Distinction maintained
- **Request Tracking**: UUID-based correlation
- **Structured Logging**: Winston with metadata
- **Stack Traces**: Development only

### API Design Patterns

- **RESTful**: Standard HTTP methods
- **Versioning**: `/api/v1/` prefix
- **Response Format**: Consistent `ApiResponse<T>` structure
- **Validation**: Zod schemas for all inputs
- **Request IDs**: X-Request-ID header tracking

## Current API Endpoints

### Health & Monitoring

- `GET /health` - Comprehensive health check with memory metrics
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

### Service Info

- `GET /` - Service metadata and available endpoints

### Example APIs (Demo/Template)

- `POST /api/v1/ping` - Echo endpoint with body validation
- `GET /api/v1/search` - Search with query string validation
- `GET /api/v1/items/:id` - Item by UUID with param validation
- `GET /api/v1/error` - Error handling demonstration

## Docker & Deployment

### Development Environment

```bash
docker-compose up -d  # Default: dev mode with hot reload
npm run docker:dev    # Explicit dev mode
```

### Production Environment

```bash
npm run docker:prod   # Production build & deployment
```

### Container Strategy

- **Multi-stage builds**: Separate dev/prod Dockerfiles
- **Security**: Non-root user, minimal attack surface
- **Health checks**: Built-in container health monitoring
- **Log management**: Proper log volume mounting

### Service Ports

| Service         | Port | Purpose                    |
| --------------- | ---- | -------------------------- |
| Backend API     | 3000 | Main application           |
| PostgreSQL      | 5433 | Database (Docker mapped)   |
| Redis           | 6379 | Cache/sessions             |
| Redis Commander | 8081 | Redis admin (dev only)     |
| Drizzle Studio  | 4983 | Database admin (run local) |

## Configuration Reference

### Environment Variables

```env
# Server Configuration
NODE_ENV=development|production|test|staging
PORT=3000
HOST=localhost

# Service Identity
SERVICE_NAME=talethreads-backend
SERVICE_VERSION=1.0.0

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=error|warn|info|debug
LOG_FORMAT=json|simple
```

### TypeScript Configuration

- **Target**: ES2022
- **Module**: CommonJS
- **Strict Mode**: Enabled with all strict checks
- **Path Aliases**: @/_ for src/_ imports
- **Build Output**: dist/ directory

## Code Quality Standards

### TypeScript Settings

- `strict: true` - All strict type checks
- `noImplicitAny: true` - Explicit typing required
- `noUnusedLocals: true` - No unused variables
- `exactOptionalPropertyTypes: true` - Strict optional types

### Validation Patterns

- **Zod First**: All input validation uses Zod schemas
- **Common Schemas**: Reusable validation patterns (UUID, pagination)
- **Middleware Integration**: `validateRequest()` factory function
- **Type Inference**: Zod schemas generate TypeScript types

### Logging Standards

- **Structured Logging**: JSON format with metadata
- **Request Correlation**: UUID tracking across requests
- **Log Levels**: error/warn/info/debug with appropriate usage
- **Production Logs**: File-based with rotation (planned)

## Future Architecture Plans

### Immediate Next Steps

1. **Database Schema Development**

    - Expand database schema for content entities
    - Create comprehensive migrations
    - Set up database seeding

2. **Authentication System**

    - JWT implementation
    - User registration/login
    - Role-based permissions

3. **Content Business Logic**
    - Content CRUD operations
    - Image upload/processing
    - Search & filtering

### Scalability Considerations

- **Database**: Connection pooling, read replicas
- **Caching**: Redis integration for API responses
- **File Storage**: MinIO or S3 for content images
- **Monitoring**: Prometheus/Grafana integration
- **Load Balancing**: Nginx reverse proxy

### Planned Integrations

- **File Storage**: MinIO for content images
- **Monitoring**: Prometheus + Grafana
- **Testing**: Jest + Supertest
- **CI/CD**: GitHub Actions
- **Documentation**: OpenAPI/Swagger

## Development Guidelines

### Code Organization

- **Single Responsibility**: Each module has one purpose
- **Dependency Injection**: Configuration passed to modules
- **Error Boundaries**: Errors handled at appropriate levels
- **Type Safety**: Prefer TypeScript strict mode

### Adding New Features

1. **Define Types**: Create TypeScript interfaces first
2. **Create Schemas**: Zod validation schemas
3. **Write Middleware**: If cross-cutting concerns
4. **Implement Routes**: RESTful endpoint design
5. **Add Tests**: Unit and integration tests
6. **Update Docs**: API documentation

### Database Patterns (Implemented with Drizzle)

- **Migrations**: Version-controlled schema changes via Drizzle Kit
- **Type Safety**: Full TypeScript integration with schema inference
- **Transactions**: ACID compliance for related operations
- **Indexes**: Performance optimization via schema definitions
- **Constraints**: Data integrity enforcement in schema
- **Studio**: Visual database management and querying

## Troubleshooting & Debugging

### Common Issues

- **Port conflicts**: PostgreSQL on 5433, Drizzle Studio on 4983
- **Docker issues**: Ensure Docker daemon is running
- **Database**: Run migrations after schema changes
- **Environment**: Check .env file configuration
- **Type errors**: TypeScript strict mode catches more issues

### Database Operations

- **Start Studio**: `npm run db:studio` (opens on port 4983)
- **Generate Migrations**: `npm run db:generate` after schema changes
- **Run Migrations**: `npm run db:migrate` to apply pending migrations
- **Push Changes**: `npm run db:push` for development schema changes
- **Seed Data**: `npm run db:seed` to populate with test data

### Debugging Tools

- **Health endpoints**: Monitor application status
- **Winston logs**: Structured logging output
- **Request IDs**: Trace requests across services
- **Drizzle Studio**: Visual database inspection and querying
- **Redis Commander**: Redis data inspection (development only)

### Performance Monitoring

- **Health checks**: Memory usage tracking
- **Request timing**: Logged with each request
- **Error tracking**: Structured error logging
- **System metrics**: Available via health endpoints

## Security Considerations

### Current Security Features

- **Helmet**: Security headers protection
- **CORS**: Origin validation
- **Rate Limiting**: DDoS protection
- **Input Validation**: Zod schema validation
- **Error Sanitization**: No stack traces in production

### Security Todos

- **Authentication**: JWT implementation needed
- **Authorization**: Role-based access control
- **Input Sanitization**: XSS prevention
- **SQL Injection**: Parameterized queries (with ORM)
- **Secrets Management**: Environment variable security

---

**Note for Future Work**: This document should be updated whenever architectural decisions are made, new patterns are established, or significant features are added. Keep it as the single source of truth for project context.
