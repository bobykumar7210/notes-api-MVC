# Notes API

Notes API is a RESTful backend built with Node.js, Express, MongoDB, and Mongoose. It follows an MVC-inspired structure and supports JWT authentication, role-based access control, per-user notes, and profile image uploads with Cloudinary.

## Features

- User registration and login with JWT authentication
- Token-based authorization for protected routes
- Admin-only user management endpoints
- Create, read, update, and delete notes
- Notes are scoped to the authenticated user
- Profile image upload and storage with Cloudinary
- Request validation with `express-validator`
- Password hashing with `bcryptjs`
- Email-based user registration with unique email enforcement
- Global request rate limiting and login attempt throttling
- Centralized error handling and structured API responses

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token (`jsonwebtoken`)
- bcryptjs
- express-validator
- express-rate-limit
- multer
- Cloudinary

## Prerequisites

- Node.js 16 or later
- npm
- MongoDB running locally or a reachable MongoDB URI
- A Cloudinary account and API credentials

## Setup

1. Clone the repository and move into the project folder.

   ```bash
   cd notes-api-MVC
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root.

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/notesDB
   JWT_SECRET=replace-with-a-long-random-secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Start the server.

   ```bash
   npm start
   ```

   For development with automatic restarts:

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:3000` by default.

## Authentication

Register a user, log in, and include the JWT on protected requests:

```http
Authorization: Bearer <token>
```

Tokens expire after 24 hours. New users are created with the `user` role by default. The profile image upload and profile lookup endpoints require authentication, while `GET /users` and `DELETE /users/:id` require the `admin` role.

## API Reference

### Health Check

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Returns a welcome message and API version. |

### Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/users/register` | No | Register a new user. |
| `POST` | `/users/login` | No | Authenticate a user and return a JWT. |
| `GET` | `/users/profile` | JWT | Get the authenticated user profile. |
| `POST` | `/users/profile/image` | JWT | Upload a profile image. |
| `GET` | `/users` | Admin JWT | List all users. |
| `DELETE` | `/users/:id` | Admin JWT | Delete a user by ID. |

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

#### Login

```http
POST /users/login
Content-Type: application/json

{
  "username": "jane",
  "password": "secure-password"
}
```

Successful login responses return a token:

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

Form field:

```text
profileImage: <image file>
```

Allowed file types:

- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`
- `image/gif`

Maximum file size: `5 MB`

### Notes

All note endpoints require a valid JWT.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/notes` | Create a note for the authenticated user. |
| `GET` | `/notes` | Retrieve all notes for the authenticated user. |
| `GET` | `/notes/:id` | Retrieve a note by ID if it belongs to the authenticated user. |
| `PUT` | `/notes/:id` | Update a note if it belongs to the authenticated user. |
| `DELETE` | `/notes/:id` | Delete a note if it belongs to the authenticated user. |

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

- `title` is required and must be at most 255 characters
- `description` is optional and must be at most 2000 characters
- `admin` is reserved and cannot be used as a note title

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

Successful responses typically follow this shape:

```json
{
  "success": true,
  "data": {}
}
```

Error responses use a consistent structure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Title is required"
}
```

## Rate Limiting

The API uses `express-rate-limit` to protect the application from abusive traffic and brute-force login attempts.

- Global API limiter: 100 requests per 15 minutes per IP
- Login limiter: 5 login attempts per 15 minutes per IP
- Rate-limit violations return the app's standard error format via the custom `AppError` handler

The app applies the global limiter in `app.js`, and the login-specific limiter should be attached to the login route in `routes/userRoute.js` for targeted protection.

Example response on limit exceed:

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests from this IP, please try again after 15 minutes"
}
```

These middlewares are defined in `middlewares/rateLimiter.js` and are applied in `app.js`.

## Project Structure

```text
notes-api-MVC/
├── config/          # Database and Cloudinary configuration
├── controllers/     # HTTP request handlers
├── docs/            # Setup docs
├── middlewares/     # Authentication, authorization, validation, error handling, logging, upload
├── models/          # Mongoose schemas
├── repositories/    # Database access layer
├── routes/          # API route definitions
├── services/        # Business logic and upload service
├── utils/           # Shared utilities and constants
├── validators/      # Request validation rules
├── app.js           # Application entry point
├── package.json     # Scripts and dependencies
└── README.md        # Project documentation
```

## Additional Documentation

See the [setup guide](docs/setup.md) for a shorter installation reference.

## License

This project is intended for learning and development purposes.
