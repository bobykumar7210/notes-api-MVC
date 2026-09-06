# Notes API

RESTful Notes backend built with **Node.js**, **Express**, and **MongoDB**. The project follows an MVC-inspired layered architecture with JWT authentication, role-based access control (`user` / `admin`), soft-delete lifecycles, paginated search, and Cloudinary-backed profile image uploads.

## Features

- **JWT Authentication & Authorization**: Secure signup, login, and bearer token verification (24-hour expiry).
- **Role-Based Access Control (RBAC)**: Public registration defaults to `user` role; admin privileges are strictly guarded.
- **User Lifecycle & Soft-Delete**: Admin can soft-delete and restore user accounts; deleted users are barred from login and protected endpoints.
- **Scoped Note Management**: Notes CRUD is securely scoped to the authenticated user.
- **Note Status Lifecycle**: `active` ➔ `archived` ➔ `deleted` (trash).
- **Automated TTL Purge**: Soft-deleted notes in trash auto hard-delete after **30 days** using MongoDB TTL index on `deletedAt`.
- **Search, Filter & Pagination**: Fast regex search (`q`) across note title/description or user username/email with page/limit metadata.
- **Profile Image Uploads**: Image upload via Multer memory storage and streaming direct to Cloudinary.
- **Input Validation & Sanitization**: Strict input validation using `express-validator`.
- **Security & Rate Limiting**: Passwords hashed with `bcryptjs` (passwords automatically stripped from JSON outputs); global and login-specific IP rate limiting.
- **Structured Logging & Error Handling**: Request logging to console and `logs/app.log`, centralized error formatting, and 404 JSON fallback.
- **Developer Experience**: Includes VS Code REST Client (`docs/api.http`), VS Code debug configurations (`.vscode/launch.json`), and Postman collection & environment.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express 4 |
| Database | MongoDB + Mongoose |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password Hashing | `bcryptjs` |
| Rate Limiting | `express-rate-limit` |
| Validation | `express-validator` |
| File Uploads | Multer + Cloudinary |
| Testing | Jest |
| Logging | Custom structured file & console logger |

---

## Base URL

All API routes are served under the `/api` prefix:

```text
http://localhost:3000/api
```

---

## Quick Start

For full installation and environment instructions, see the **[Setup Guide](docs/setup.md)**.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Cloudinary credentials

# 3. Bootstrap the first admin user (run once)
npm run seed:admin

# 4. Start the server
npm run dev    # Development mode (nodemon auto-restart)
# or
npm start      # Production mode
```

The server listens on `http://localhost:3000` by default.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the server with Node |
| `npm run dev` | Start the server with Nodemon (auto-reload on file change) |
| `npm test` | Run all Jest test suites (`jest --runInBand`) |
| `npm run seed:admin` | Bootstrap the initial admin user using `.env` seed variables |

---

## Authentication & Authorization

1. Register a user via `POST /api/users/register` (defaults to `user` role).
2. Authenticate via `POST /api/users/login` to receive a JWT.
3. Attach the token in the `Authorization` header for protected endpoints:

```http
Authorization: Bearer <token>
```

- Tokens expire after **24 hours**.
- Public registration creates only standard `user` accounts. Admin accounts are created via `npm run seed:admin` or by an existing admin via `POST /api/users/admins`.
- Soft-deleted accounts cannot log in, and existing JWT tokens belonging to soft-deleted accounts are rejected by authentication middleware.

---

## Status Models & Lifecycle

### Notes Lifecycle

```text
[ active ] ──(archive)──> [ archived ] ──(restore)──> [ active ]
    │                           │
 (delete)                    (delete)
    │                           │
    ▼                           ▼
[ deleted ] ───(restore)───> [ active ]
    │
 (30 Days TTL)
    │
    ▼
[ Hard Deleted / Purged from DB ]
```

| Status | Behavior |
| --- | --- |
| `active` | Default status; visible in primary notes list. |
| `archived` | Hidden from active list; editable; restorable to `active`. |
| `deleted` | Moved to trash; restorable to `active`; auto hard-deleted by MongoDB TTL after **30 days**. |

### Users Lifecycle

| Status | Behavior |
| --- | --- |
| `active` | Default status; can log in and access protected routes. |
| `deleted` | Soft-deleted by admin; barred from login; restorable by admin. |

---

## API Reference

### 1. Health Check

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api` | None | Welcome message and API version |

#### Example Request & Response
```http
GET /api
```
```json
{
  "message": "Welcome to Notes API",
  "version": "1.0.0"
}
```

---

### 2. User & Authentication Endpoints

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | None | Public | Register a new user |
| `POST` | `/api/users/login` | None | Public | Login with username/password to receive JWT |
| `GET` | `/api/users/profile` | JWT | `user` / `admin` | Get authenticated user profile |
| `POST` | `/api/users/profile/image` | JWT | `user` / `admin` | Upload profile avatar to Cloudinary |
| `POST` | `/api/users/admins` | JWT | `admin` | Create a new admin account |
| `GET` | `/api/users/stats` | JWT | `admin` | Platform statistics (users and notes breakdown) |
| `GET` | `/api/users` | JWT | `admin` | List users (paginated, filterable, searchable) |
| `PATCH` | `/api/users/:id/restore` | JWT | `admin` | Restore a soft-deleted user |
| `DELETE` | `/api/users/:id` | JWT | `admin` | Soft-delete a user account |

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "janedoe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
*Validation:* `username` (required), `email` (valid email, unique), `password` (min 6 chars). Role is automatically set to `user`.

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "janedoe",
  "password": "securepassword123"
}
```
*Response:*
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*Rate limit:* Max 5 attempts per 15 minutes per IP.

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```
*Response:*
```json
{
  "success": true,
  "data": {
    "_id": "64e0a7f1234567890abcdef1",
    "username": "janedoe",
    "email": "jane@example.com",
    "profileImage": "https://res.cloudinary.com/...",
    "role": "user",
    "status": "active",
    "deletedAt": null,
    "createdAt": "2026-08-26T10:00:00.000Z",
    "updatedAt": "2026-08-26T10:00:00.000Z"
  }
}
```

#### Upload Profile Image
```http
POST /api/users/profile/image
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=boundary

--boundary
Content-Disposition: form-data; name="profileImage"; filename="avatar.png"
Content-Type: image/png

<binary data>
--boundary--
```
*Allowed MIME types:* `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif` (max 5 MB).

#### Create Admin User (Admin only)
```http
POST /api/users/admins
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "username": "admin2",
  "email": "admin2@example.com",
  "password": "adminpassword123"
}
```

#### Admin Stats (Admin only)
```http
GET /api/users/stats
Authorization: Bearer <admin-token>
```
*Response:*
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 10,
      "admins": 2,
      "normal": 8,
      "deleted": 1
    },
    "notes": {
      "total": 35,
      "active": 30,
      "archived": 5,
      "deleted": 5
    }
  }
}
```
- `users.total`: Total active users (`admins` + `normal`). `users.deleted` tracked separately.
- `notes.total`: Total non-deleted notes (`active` + `archived`). `notes.deleted` tracked separately.

#### List Users (Admin only)
```http
GET /api/users?page=1&limit=20&status=active&q=jane
Authorization: Bearer <admin-token>
```
| Query Param | Default | Allowed Values / Validation |
| :--- | :--- | :--- |
| `page` | `1` | Positive integer |
| `limit` | `20` | `1` – `100` |
| `status` | `active` | `active`, `deleted` |
| `q` | `""` | Search string matching username or email |

*Response:*
```json
{
  "success": true,
  "data": [
    {
      "_id": "64e0a7f1234567890abcdef1",
      "username": "janedoe",
      "email": "jane@example.com",
      "role": "user",
      "status": "active"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Soft-Delete / Restore User (Admin only)
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>

PATCH /api/users/:id/restore
Authorization: Bearer <admin-token>
```
*Note:* Admins cannot delete their own account.

---

### 3. Notes Endpoints

All note routes require a valid JWT (`Authorization: Bearer <token>`) and are automatically scoped to the authenticated user.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/notes` | Create a new note (`status: active`) |
| `GET` | `/api/notes` | List notes (paginated / searchable / filterable) |
| `GET` | `/api/notes/:id` | Get note details by ID (non-deleted) |
| `PUT` | `/api/notes/:id` | Update note title and description (active or archived) |
| `PATCH` | `/api/notes/:id/archive` | Archive an active note |
| `PATCH` | `/api/notes/:id/restore` | Restore archived or deleted note to `active` |
| `DELETE` | `/api/notes/:id` | Soft-delete note to trash (`status: deleted`) |

#### Create Note
```http
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Quarterly Planning",
  "description": "Prepare architecture review and sprint backlog"
}
```
*Validation:* `title` (required, max 255 chars, cannot be `"admin"`), `description` (optional string, max 2000 chars).

#### List Notes
```http
GET /api/notes?page=1&limit=20&status=active&q=Planning
Authorization: Bearer <token>
```
| Query Param | Default | Allowed Values / Validation |
| :--- | :--- | :--- |
| `page` | `1` | Positive integer |
| `limit` | `20` | `1` – `100` |
| `status` | `active` | `active`, `archived`, `deleted` |
| `q` | `""` | Search query across title and description |

*Response:*
```json
{
  "success": true,
  "data": [
    {
      "_id": "64e0b9a1234567890abcdef2",
      "userId": "64e0a7f1234567890abcdef1",
      "title": "Quarterly Planning",
      "description": "Prepare architecture review and sprint backlog",
      "status": "active",
      "deletedAt": null,
      "createdAt": "2026-08-26T11:00:00.000Z",
      "updatedAt": "2026-08-26T11:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Get Note by ID
```http
GET /api/notes/:id
Authorization: Bearer <token>
```

#### Update Note
```http
PUT /api/notes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Quarterly Planning",
  "description": "Updated sprint items and timelines"
}
```

#### Archive Note
```http
PATCH /api/notes/:id/archive
Authorization: Bearer <token>
```

#### Restore Note
```http
PATCH /api/notes/:id/restore
Authorization: Bearer <token>
```
Restores a note with status `archived` or `deleted` back to `active` and resets `deletedAt` to `null`.

#### Soft-Delete Note (Trash)
```http
DELETE /api/notes/:id
Authorization: Bearer <token>
```
Sets note status to `deleted` and timestamps `deletedAt`. The note will be permanently purged after 30 days.

---

## Response & Error Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Success Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Title is required"
}
```

---

## Rate Limiting

| Limiter | Target | Limit | Window | Exceeded Response |
| :--- | :--- | :--- | :--- | :--- |
| **Global** | All `/api` routes | 100 requests | 15 minutes / IP | `HTTP 429 Too many requests` |
| **Login** | `POST /api/users/login` | 5 attempts | 15 minutes / IP | `HTTP 429 Too many login attempts` |

---

## VS Code & Postman Integration

### 1. VS Code REST Client (`docs/api.http`)
You can execute and test all API requests directly inside VS Code without switching tools:
1. Install the **REST Client** extension (`humao.rest-client`) in VS Code.
2. Open [`docs/api.http`](docs/api.http).
3. Set your token variables at the top of the file (`@token`, `@adminToken`).
4. Click **Send Request** directly above any request block.

### 2. VS Code Launch & Debug (`.vscode/launch.json`)
Pre-configured launch profiles for VS Code:
- **🚀 Launch Notes API (Nodemon Dev)**: Start server with nodemon auto-restart and debugging attached.
- **▶️ Launch Notes API (Node)**: Standard node execution.
- **🧪 Run Jest Tests**: Execute test suite inside the debugger.
- **🌱 Seed Admin User**: Run admin bootstrap script.

### 3. Postman Collection
Import the pre-configured Postman assets in `docs/postman/`:
- Collection: [`docs/postman/notes-api.postman_collection.json`](docs/postman/notes-api.postman_collection.json)
- Environment: [`docs/postman/notes-api.postman_environment.json`](docs/postman/notes-api.postman_environment.json) (pre-set to `baseUrl: http://localhost:3000/api`)

---

## Project Structure

```text
notes-api-MVC/
├── .vscode/                 # VS Code launch configurations, recommended extensions & settings
│   ├── extensions.json
│   ├── launch.json
│   └── settings.json
├── config/                  # Database (MongoDB) and Cloudinary configuration
│   ├── cloudinary.js
│   └── db.js
├── controllers/             # Request handling and HTTP response formatting
│   ├── noteController.js
│   └── userController.js
├── docs/                    # Documentation and API testing tools
│   ├── postman/             # Postman collection & environment
│   │   ├── notes-api.postman_collection.json
│   │   └── notes-api.postman_environment.json
│   ├── api.http             # VS Code REST Client collection
│   └── setup.md             # Local environment & setup guide
├── middlewares/             # Auth, role check, uploads, rate limit, logging, errors
│   ├── validation/
│   │   └── validationMiddleware.js
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   ├── logger.js
│   ├── rateLimiter.js
│   ├── roleMiddleware.js
│   └── uploadMiddleware.js
├── models/                  # Mongoose models with TTL indexes & schema transforms
│   ├── Note.js
│   └── User.js
├── repositories/            # Data access layer for database queries
│   ├── noteRepository.js
│   └── userRepository.js
├── routes/                  # Express route definitions
│   ├── indexRoute.js        # Main router mounted on /api
│   ├── noteRoutes.js
│   └── userRoute.js
├── scripts/                 # Utility scripts
│   └── seedAdmin.js         # Initial admin creation script
├── services/                # Business logic layer
│   ├── cloudinaryService.js
│   ├── noteService.js
│   └── userService.js
├── tests/                   # Jest test suites
│   ├── jest.test.js
│   ├── lifecycle.test.js
│   ├── logger.test.js
│   ├── uploadMiddleware.test.js
│   └── userModel.test.js
├── utils/                   # Custom error classes and global constants
│   ├── AppError.js
│   └── constants.js
├── validators/              # express-validator validation rules
│   ├── note.validator.js
│   └── user.validator.js
├── app.js                   # Application entry point & middleware pipeline
├── .env.example             # Template for required environment variables
├── .gitignore
└── package.json
```

---

## Architecture Flow

```text
HTTP Request
     │
     ▼
[ Express Router (/api) ]
     │
     ▼
[ Middlewares ] ────► Rate Limiter, Request Logger, Multer Upload, JWT Auth, Role Guard, Input Validator
     │
     ▼
[ Controllers ] ────► Extracts request payload & params, invokes service layer, sends HTTP response
     │
     ▼
[ Services ] ───────► Business logic, password hashing, Cloudinary streaming, access checks
     │
     ▼
[ Repositories ] ───► MongoDB queries, pagination math, regex search filters
     │
     ▼
[ Models / MongoDB ]► Mongoose schemas, TTL expiration index (30 days), toJSON transformations
```

---

## Documentation

- **[Setup Guide](docs/setup.md)**: Detailed instructions for MongoDB, Cloudinary, environment setup, and verification.
- **[VS Code REST Client](docs/api.http)**: Interactive in-editor HTTP request file.
- **[Postman Collection](docs/postman/notes-api.postman_collection.json)**: Ready-to-import Postman workspace.

---

## License

This project is open-source and intended for study, learning, and development purposes.
