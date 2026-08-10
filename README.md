# Notes API

RESTful Notes backend built with **Node.js**, **Express**, and **MongoDB**. The project follows an MVC-inspired layered architecture with JWT authentication, role-based access control, soft-delete lifecycles, paginated search, and Cloudinary-backed profile image uploads.

## Features

- User registration and login with JWT authentication
- Role-based access control (`user` / `admin`)
- Soft-delete for users (`active` / `deleted`) with admin restore
- Deleted users cannot log in or use JWT-protected routes
- Notes CRUD scoped to the authenticated user
- Note status lifecycle: `active` → `archived` → `deleted` (soft delete)
- Trash notes auto hard-delete after **30 days** (MongoDB TTL on `deletedAt`)
- Paginated note list with search (`q`) and status filter
- Archive / restore note endpoints
- Admin platform stats (`GET /users/stats`) for users and notes
- Paginated admin user list with search
- Profile image upload via Multer and Cloudinary
- Request validation with `express-validator`
- Password hashing with `bcryptjs`
- Global rate limiting and login attempt throttling
- Centralized error handling and request logging

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Security | `bcryptjs`, `express-rate-limit` |
| Validation | `express-validator` |
| Uploads | Multer + Cloudinary |

## Quick Start

For a full walkthrough (MongoDB, Cloudinary, environment variables, verification), see the **[Setup Guide](docs/setup.md)**.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Cloudinary credentials

# 3. Bootstrap the first admin (once)
npm run seed:admin

# 4. Run the API
npm run dev    # development (nodemon)
# or
npm start      # production
```

The API listens on `http://localhost:3000` by default.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the server with Node |
| `npm run dev` | Start with Nodemon (auto-restart) |
| `npm test` | Run Jest tests |
| `npm run seed:admin` | Create the first admin from seed env vars |

Seed vars (see `.env.example`): `SEED_ADMIN_USERNAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`.

## Authentication

1. Register a user via `POST /users/register`
2. Log in via `POST /users/login` to receive a JWT
3. Send the token on protected routes:

```http
Authorization: Bearer <token>
```

- Tokens expire after **24 hours**
- New accounts from `POST /users/register` always receive the `user` role
- Soft-deleted accounts cannot log in; existing JWTs are rejected by auth middleware
- Bootstrap the first admin with `npm run seed:admin` (no public admin registration)

## Status model

### Notes

| Status | Meaning |
| --- | --- |
| `active` | Default; shown in the main notes list |
| `archived` | Hidden from active list; editable; restorable |
| `deleted` | Soft-deleted (trash); restorable; purged after 30 days via TTL |

### Users

| Status | Meaning |
| --- | --- |
| `active` | Default; can log in |
| `deleted` | Soft-deleted by admin; can be restored; no login |

## API Reference

### Health Check

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Welcome message and API version |

### Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/users/register` | No | Register a new **user** (role always `user`) |
| `POST` | `/users/login` | No | Authenticate and return a JWT |
| `GET` | `/users/profile` | JWT | Get the authenticated user profile |
| `POST` | `/users/profile/image` | JWT | Upload a profile image |
| `POST` | `/users/admins` | Admin JWT | Create a new admin user |
| `GET` | `/users/stats` | Admin JWT | Platform user + notes counts |
| `GET` | `/users` | Admin JWT | Paginated user list |
| `PATCH` | `/users/:id/restore` | Admin JWT | Restore a soft-deleted user |
| `DELETE` | `/users/:id` | Admin JWT | Soft-delete a user |

#### Register

```http
POST /users/register
Content-Type: application/json

{
  "username": "jane",
  "email": "jane@example.com",
  "password": "secure-password"
}
```

- `username` — required
- `email` — required, valid email
- `password` — required, min 6 characters
- `role` in the body is ignored (always `user`)

#### Login

```http
POST /users/login
Content-Type: application/json

{
  "username": "jane",
  "password": "secure-password"
}
```

```json
{
  "success": true,
  "token": "<jwt>"
}
```

#### Admin stats

```http
GET /users/stats
Authorization: Bearer <admin-token>
```

```json
{
  "success": true,
  "data": {
    "users": { "total": 10, "admins": 2, "normal": 8, "deleted": 1 },
    "notes": { "total": 40, "active": 30, "archived": 5, "deleted": 5 }
  }
}
```

#### List users (paginated)

```http
GET /users?page=1&limit=20&status=active&q=jane
Authorization: Bearer <admin-token>
```

| Query | Default | Notes |
| --- | --- | --- |
| `page` | `1` | Positive integer |
| `limit` | `20` | 1–100 |
| `status` | `active` | `active` or `deleted` |
| `q` | — | Search username or email |

```json
{
  "success": true,
  "data": [/* users without passwords */],
  "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

#### Soft-delete / restore user

```http
DELETE /users/:id
Authorization: Bearer <admin-token>

PATCH /users/:id/restore
Authorization: Bearer <admin-token>
```

Admins cannot soft-delete their own account.

#### Upload profile image

```http
POST /users/profile/image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

| Field | Type | Notes |
| --- | --- | --- |
| `profileImage` | file | Required |

Allowed: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif` — max **5 MB**.

### Notes

All note endpoints require a valid JWT. Notes are scoped to the authenticated user.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/notes` | Create a note (`status: active`) |
| `GET` | `/notes` | List notes (paginated / searchable / filterable) |
| `GET` | `/notes/:id` | Get a note (not deleted) |
| `PUT` | `/notes/:id` | Update title/description (active or archived) |
| `PATCH` | `/notes/:id/archive` | Archive an active note |
| `PATCH` | `/notes/:id/restore` | Restore archived or deleted → active |
| `DELETE` | `/notes/:id` | Soft-delete → trash |

#### List notes

```http
GET /notes?page=1&limit=20&status=active&q=roadmap
Authorization: Bearer <token>
```

| Query | Default | Notes |
| --- | --- | --- |
| `page` | `1` | Positive integer |
| `limit` | `20` | 1–100 |
| `status` | `active` | `active`, `archived`, or `deleted` |
| `q` | — | Search title or description |

```json
{
  "success": true,
  "data": [/* notes */],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

#### Create a note

```http
POST /notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Prepare project update",
  "description": "Review the roadmap and deployment checklist"
}
```

- `title` — required, max 255; cannot be `"admin"`
- `description` — optional, max 2000

## Response Format

Success:

```json
{
  "success": true,
  "data": {}
}
```

Paginated lists also include `meta`.

Error:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Title is required"
}
```

## Rate Limiting

| Limiter | Scope | Limit |
| --- | --- | --- |
| Global | All routes | 100 requests / 15 minutes / IP |
| Login | `POST /users/login` | 5 attempts / 15 minutes / IP |

Exceeded limits return HTTP `429`.

## Project Structure

```text
notes-api-MVC/
├── config/           # Database and Cloudinary configuration
├── controllers/      # HTTP request handlers
├── docs/             # Setup and supporting documentation
├── middlewares/      # Auth, roles, validation, errors, logging, uploads, rate limits
├── models/           # Mongoose schemas (status, deletedAt, TTL)
├── repositories/     # Data access layer
├── routes/           # Route definitions
├── scripts/          # seedAdmin.js
├── services/         # Business logic
├── tests/            # Jest tests
├── utils/            # Shared utilities and constants
├── validators/       # express-validator rule sets
├── app.js            # Application entry point
├── .env.example
└── package.json
```

## Architecture

```text
Request → Routes → Middleware (auth / validation / rate limit)
                 → Controllers
                 → Services
                 → Repositories
                 → Models / MongoDB
```

## Documentation

| Document | Description |
| --- | --- |
| [Setup Guide](docs/setup.md) | Prerequisites, environment configuration, and local run steps |

## License

This project is intended for learning and development purposes.
