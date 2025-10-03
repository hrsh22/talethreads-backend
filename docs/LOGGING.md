# Logging Guide

This document describes the industry-standard logging implementation in the Comics AI Backend.

## Overview

The application uses **Winston** for structured logging with environment-specific formatting and comprehensive log levels. The logging system follows industry best practices for observability, debugging, and monitoring.

## Log Formats

### Development Mode (Pretty Format)

In development, logs are formatted for human readability with:

- **Colored log levels** for quick visual scanning
- **Timestamps** with milliseconds precision
- **Service context** in brackets
- **Structured metadata** separated by pipes
- **Stack traces** for errors

Example:

```
2025-09-30 17:26:55.869 INFO  [comics-ai-backend] Starting server initialization...
2025-09-30 17:26:55.897 INFO  [comics-ai-backend] Database connected successfully | url=postgresql:***:password@postgres:5432/comics_ai
2025-09-30 17:26:55.912 INFO  [comics-ai-backend] ✓ GET /health/live 200 | type=http_request method=GET url=/health/live statusCode=200 duration=4 requestId=da28f2be-e74e-42dc-8b52-b7022a494a67 ip=127.0.0.1
```

### Production Mode (JSON Format)

In production, logs are JSON-formatted for machine parsing and aggregation:

```json
{
    "level": "info",
    "message": "✓ GET /health/live 200",
    "timestamp": "2025-09-30T17:26:55.912Z",
    "service": "comics-ai-backend",
    "version": "1.0.0",
    "environment": "production",
    "type": "http_request",
    "method": "GET",
    "url": "/health/live",
    "statusCode": 200,
    "duration": 4,
    "requestId": "da28f2be-e74e-42dc-8b52-b7022a494a67",
    "ip": "127.0.0.1"
}
```

## Log Levels

The application uses standard Winston log levels:

| Level   | Usage                                    | Color   |
| ------- | ---------------------------------------- | ------- |
| `error` | System errors, exceptions, failures      | Red     |
| `warn`  | Warning conditions, 4xx responses        | Yellow  |
| `info`  | General information, successful requests | Cyan    |
| `http`  | HTTP request/response logs (future)      | Green   |
| `debug` | Detailed debugging information           | Magenta |

## HTTP Request Logging

All HTTP requests are automatically logged with:

- **Status emojis** for quick visual identification:

    - ✓ Success (2xx)
    - → Redirect (3xx)
    - ⚠ Client error (4xx)
    - ✗ Server error (5xx)

- **Contextual information**:
    - Request method and URL
    - Status code
    - Response time in milliseconds
    - Request ID for correlation
    - Client IP address
    - Query parameters (if present)
    - User agent (for non-health endpoints)
    - Response size

Example:

```typescript
// Logs automatically generated for each request:
✓ GET /api/v1/search?q=batman 200 | duration=45 requestId=abc-123 query={"q":"batman"}
⚠ POST /api/v1/users 400 | duration=12 requestId=def-456 ip=192.168.1.1
✗ GET /api/v1/data 500 | duration=1523 requestId=ghi-789 error="Database timeout"
```

## Basic Usage

### Importing the Logger

```typescript
import logger from "@/utils/logger";
```

### Standard Logging

```typescript
// Info level (general information)
logger.info("User logged in", { userId: "123", email: "user@example.com" });

// Warning level (potential issues)
logger.warn("Rate limit approaching", { userId: "123", remaining: 10 });

// Error level (errors and exceptions)
logger.error("Database connection failed", { error: error.message, retries: 3 });

// Debug level (detailed debugging)
logger.debug("Cache lookup", { key: "user:123", hit: true, ttl: 3600 });
```

## Structured Logging Helpers

The logger exports specialized helper functions for common logging patterns:

### HTTP Request Logging

```typescript
import { loggers } from "@/utils/logger";

loggers.http("GET", "/api/v1/users", 200, 45, {
    requestId: "abc-123",
    userId: "123"
});
```

### Database Operations

```typescript
loggers.database("SELECT", "users", 15, {
    query: "SELECT * FROM users WHERE id = ?",
    rows: 1
});
```

### External API Calls

```typescript
loggers.externalApi("OpenAI", "/v1/completions", 200, 523, {
    model: "gpt-4",
    tokens: 150
});
```

### Performance Metrics

```typescript
loggers.performance("response_time", 245, "ms", {
    endpoint: "/api/v1/search",
    percentile: "p95"
});
```

### Security Events

```typescript
loggers.security("Failed login attempt", "medium", {
    username: "admin",
    ip: "192.168.1.100",
    attempts: 3
});
```

### Business Logic

```typescript
loggers.business("Comic created", "comic", {
    comicId: "456",
    userId: "123",
    title: "Amazing Comic"
});
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ✅ Good
logger.info("User registration completed", { userId: "123" });
logger.warn("Low disk space", { available: "5GB" });
logger.error("Payment processing failed", { orderId: "789", error: err.message });

// ❌ Bad
logger.error("User logged in"); // Not an error
logger.info("Database crashed"); // Should be error
```

### 2. Include Contextual Information

```typescript
// ✅ Good - includes context
logger.info("Order processed", {
    orderId: "123",
    userId: "456",
    total: 99.99,
    items: 3
});

// ❌ Bad - lacks context
logger.info("Order processed");
```

### 3. Use Structured Data

```typescript
// ✅ Good - structured
logger.info("Cache operation", {
    operation: "get",
    key: "user:123",
    hit: true,
    ttl: 3600
});

// ❌ Bad - unstructured string
logger.info("Cache get user:123 hit ttl 3600");
```

### 4. Never Log Sensitive Information

```typescript
// ❌ Never log these
logger.info("User login", { password: "secret123" });
logger.info("Payment", { cardNumber: "4111-1111-1111-1111" });
logger.info("Token", { jwt: "eyJhbGciOiJ..." });

// ✅ Log safe alternatives
logger.info("User login", { userId: "123", email: "u***@example.com" });
logger.info("Payment", { last4: "1111", amount: 99.99 });
logger.info("Token generated", { userId: "123", expiresIn: "1h" });
```

### 5. Include Request IDs

```typescript
// Request IDs are automatically added by middleware
// Access them in your code:
const requestId = req.headers["x-request-id"];

logger.info("Processing request", {
    requestId,
    operation: "update_user",
    userId: "123"
});
```

### 6. Log Errors with Stack Traces

```typescript
try {
    await processPayment(orderId);
} catch (error) {
    logger.error("Payment processing failed", {
        orderId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
    });
}
```

## Configuration

Logging behavior is controlled via environment variables:

```env
# Log level (error, warn, info, debug)
LOG_LEVEL=info

# Log format (json, simple)
# Note: Development mode uses pretty format by default
LOG_FORMAT=json

# Environment (affects format selection)
NODE_ENV=development
```

### Format Selection Logic

1. **Production** (`NODE_ENV=production`): Always uses JSON format
2. **Development** (`NODE_ENV=development`): Uses pretty format with colors
3. **Test/Staging**: Uses simple format (compact, no colors)
4. **Override**: Set `LOG_FORMAT=json` to force JSON in any environment

## Log Output

### Console Logs

All logs are written to stdout/stderr for Docker compatibility and log aggregation tools.

### File Logs (Production Only)

In production, logs are also written to files:

- `logs/error.log` - Error level logs only
- `logs/combined.log` - All logs

## Monitoring & Aggregation

The JSON format is compatible with popular log aggregation tools:

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **Datadog**
- **CloudWatch Logs**
- **Google Cloud Logging**
- **Grafana Loki**

## Examples

### Full Request Flow

```typescript
// Incoming request (automatic)
// 2025-09-30 17:26:55.869 INFO [comics-ai-backend] Processing request | requestId=abc-123

// Business logic
logger.info("Fetching user data", { userId: "123", requestId });

// Database query
loggers.database("SELECT", "users", 15, { userId: "123" });

// Response (automatic)
// ✓ GET /api/v1/users/123 200 | duration=45 requestId=abc-123
```

### Error Handling

```typescript
try {
    const result = await riskyOperation();
    logger.info("Operation completed", { result: result.id });
} catch (error) {
    logger.error("Operation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        operation: "riskyOperation"
    });
    throw error; // Re-throw after logging
}
```

## Log Analysis Tips

### Finding Errors

```bash
# In development logs
grep "ERROR" logs/dev.log

# In production (JSON logs)
jq 'select(.level == "error")' logs/combined.log
```

### Tracing Requests

```bash
# Find all logs for a specific request ID
jq 'select(.requestId == "abc-123")' logs/combined.log
```

### Performance Analysis

```bash
# Find slow requests (>1000ms)
jq 'select(.type == "http_request" and .duration > 1000)' logs/combined.log
```

## Summary

The logging system provides:

- ✅ **Industry-standard** structured logging
- ✅ **Environment-aware** formatting (pretty for dev, JSON for prod)
- ✅ **Request correlation** with unique IDs
- ✅ **Rich context** with metadata
- ✅ **Visual indicators** (emojis, colors)
- ✅ **Security-conscious** (no sensitive data)
- ✅ **Tool-compatible** (works with all major log aggregators)

For questions or improvements, please refer to the Winston documentation: https://github.com/winstonjs/winston
