# Notes API

RESTful Notes backend built with **Node.js**, **Express**, and **MongoDB**. The project follows an MVC-inspired layered architecture with JWT authentication, role-based access control, per-user notes, and Cloudinary-backed profile image uploads.

## Features

- User registration and login with JWT authentication
- Role-based access control (`user` / `admin`)
- CRUD notes scoped to the authenticated user
- Profile image upload via Multer and Cloudinary
- Request validation with `express-validator`
- Password hashing with `bcryptjs`
- Unique username and email enforcement
- Global rate limiting and login attempt throttling
- Centralized error handling and consistent API responses
- Request logging middleware

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

# 3. Run the API
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

## Authentication

1. Register a user via `POST /users/register`
2. Log in via `POST /users/login` to receive a JWT
3. Send the token on protected routes:

```http
Authorization: Bearer <token>
```

- Tokens expire after **24 hours**
- New accounts default to the `user` role
- Profile endpoints require a valid JWT
- `GET /users` and `DELETE /users/:id` require the `admin` role

## API Reference

### Health Check

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Welcome message and API version |

### Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/users/register` | No | Register a new user |
| `POST` | `/users/login` | No | Authenticate and return a JWT |
| `GET` | `/users/profile` | JWT | Get the authenticated user profile |
| `POST` | `/users/profile/image` | JWT | Upload a profile image |
| `GET` | `/users` | Admin JWT | List all users |
| `DELETE` | `/users/:id` | Admin JWT | Delete a user by ID |

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

Validation:

- `username` — required
- `email` — required, valid email format
- `password` — required, minimum 6 characters

#### Login

```http
POST /users/login
Content-Type: application/json

{
  "username": "jane",
  "password": "secure-password"
}
```

Example success response:

```json
{
  "success": true,
  "token": "<jwt>"
}
```

#### Upload Profile Image

```http
POST /users/profile/image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

| Field | Type | Notes |
| --- | --- | --- |
| `profileImage` | file | Required |

Allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`  
Maximum size: **5 MB**

### Notes

All note endpoints require a valid JWT. Notes are always scoped to the authenticated user.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/notes` | Create a note |
| `GET` | `/notes` | List notes for the current user |
| `GET` | `/notes/:id` | Get a note by ID (owner only) |
| `PUT` | `/notes/:id` | Update a note (owner only) |
| `DELETE` | `/notes/:id` | Delete a note (owner only) |

#### Create a Note

```http
POST /notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Prepare project update",
  "description": "Review the roadmap, release tasks, and deployment checklist"
}
```

Validation rules:

- `title` — required, max 255 characters; cannot be `"admin"`
- `description` — optional, max 2000 characters

#### Update a Note

```http
PUT /notes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated project update",
  "description": "Revised tasks and timeline"
}
```

## Response Format

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Title is required"
}
```

## Rate Limiting

Defined in `middlewares/rateLimiter.js`:

| Limiter | Scope | Limit |
| --- | --- | --- |
| Global | All routes | 100 requests / 15 minutes / IP |
| Login | `POST /users/login` | 5 attempts / 15 minutes / IP |

Exceeded limits return HTTP `429` in the standard error format:

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests from this IP, please try again after 15 minutes"
}
```

## Project Structure

```text
notes-api-MVC/
├── config/           # Database and Cloudinary configuration
├── controllers/      # HTTP request handlers
├── docs/             # Setup and supporting documentation
├── middlewares/      # Auth, roles, validation, errors, logging, uploads, rate limits
├── models/           # Mongoose schemas
├── repositories/     # Data access layer
├── routes/           # Route definitions
├── services/         # Business logic
├── tests/            # Jest tests
├── utils/            # Shared utilities and constants
├── validators/       # express-validator rule sets
├── app.js            # Application entry point
├── .env.example      # Environment variable template
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

This separation keeps HTTP concerns, business rules, and persistence isolated and easier to test.

## Documentation

| Document | Description |
| --- | --- |
| [Setup Guide](docs/setup.md) | Prerequisites, environment configuration, and local run steps |

## License

This project is intended for learning and development purposes.
