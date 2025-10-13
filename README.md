# EduHub Authentication Service

EduHub Academy's authentication microservice provides user registration, login, role-based access, password reset workflows, refresh token rotation, and a placeholder for future single sign-on (SSO) integrations. The service is designed for deployment to Kubernetes and integrates with PostgreSQL and Redis.

## Features

- JWT-based authentication with short-lived access tokens and refresh token rotation
- Role-based access control (`student`, `teacher`, `admin`)
- User registration and login endpoints
- Password reset workflow with email notifications
- Redis-backed session cache for refresh token tracking
- Placeholder endpoints ready for future OAuth2/OIDC SSO integration
- Health check endpoint for Kubernetes probes

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Web Framework:** Express
- **Database:** PostgreSQL (SQL migration included)
- **Cache/Session Store:** Redis
- **Email:** Nodemailer (configure with your SMTP provider)
- **Authentication:** JSON Web Tokens (JWT)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and adjust values for your environment:

```bash
cp .env.example .env
```

Key variables:

- `POSTGRES_*`: PostgreSQL connection details
- `REDIS_URL`: Redis connection string
- `JWT_ACCESS_TOKEN_SECRET` / `JWT_REFRESH_TOKEN_SECRET`: strong secrets for tokens
- `SMTP_*`: SMTP server configuration for password reset emails
- `APP_URL`: URL used to generate password reset links

### 3. Prepare the Database

Run the SQL migration found in `db/migrations/001_init.sql` against your PostgreSQL instance. The migration creates the `users` and `refresh_tokens` tables and enables the required extensions (`uuid-ossp`, `citext`).

Example using `psql`:

```bash
psql "$POSTGRES_URL" -f db/migrations/001_init.sql
```

### 4. Start the Service

#### Development

```bash
npm run dev
```

#### Production Build

```bash
npm run build
npm start
```

The service listens on the port configured via `PORT` (defaults to `4000`).

#### Docker

```bash
# build the image
docker build -t eduhub-auth-service .

# run the container
docker run --rm -p 4000:4000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgres://... \
  -e REDIS_URL=redis://... \
  eduhub-auth-service
```

The container exposes port `4000` and expects environment variables for PostgreSQL, Redis, JWT secrets, and SMTP credentials. Provide these via `-e` flags or Kubernetes secrets when deploying.


### 5. API Overview

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET`  | `/healthz` | Kubernetes health probe |
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and receive tokens |
| `POST` | `/api/v1/auth/refresh` | Exchange refresh token for new tokens |
| `POST` | `/api/v1/auth/logout` | Revoke refresh token and session |
| `GET`  | `/api/v1/auth/me` | Retrieve current user (requires `Authorization` header) |
| `POST` | `/api/v1/auth/password/reset-request` | Start password reset flow |
| `POST` | `/api/v1/auth/password/reset` | Complete password reset |
| `GET`  | `/api/v1/auth/sso/:provider` | Placeholder SSO start endpoint |
| `GET`  | `/api/v1/auth/sso/:provider/callback` | Placeholder SSO callback |

All authenticated endpoints require a bearer token (`Authorization: Bearer <accessToken>`).

### Redis Sessions

Refresh tokens are mirrored to Redis for quick revocation and session tracking. The refresh token ID is stored in Redis with a TTL that matches the token expiry. Deleting the Redis entry or the database record invalidates the session.

### Testing the Password Reset Flow

For local development you can use [Ethereal Email](https://ethereal.email/) credentials in the `.env` file to inspect password reset messages without sending real emails.

### SSO Placeholder

The `/api/v1/auth/sso/:provider` endpoints return `501 Not Implemented` and include guidance for future OAuth2/OIDC integration. Configure `SSO_ALLOWED_PROVIDERS` in the environment to list providers that should be exposed once implemented.

## Development Notes

- The codebase uses ESLint and Prettier. Run `npm run lint` and `npm run format` to enforce code style.
- All TypeScript source files live in the `src/` directory and compile to `dist/`.
- Avoid committing `.env` files—use Kubernetes secrets or a secure secret manager in production.

## Kubernetes Considerations

- Configure liveness/readiness probes against `/healthz`.
- Mount environment variables for database, Redis, SMTP, and JWT secrets via ConfigMaps/Secrets.
- Provision Redis with persistence for session caching.
- Use a Kubernetes CronJob or migration job to execute `db/migrations/001_init.sql` during deployment.

## License

MIT
