# Notes API

A RESTful Notes API built with Node.js, Express, MongoDB, and Mongoose. The project follows an MVC-inspired layered architecture, separating routing, controllers, services, repositories, and data models.

## Features

- JWT-based user authentication
- Role-based authorization for administrator-only user management
- Create, read, update, and delete notes
- Request validation with `express-validator`
- Centralized error handling and request logging
- Password hashing with bcrypt

## Technology Stack

- Node.js and Express
- MongoDB and Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- bcryptjs
- express-validator

## Prerequisites

- Node.js 16 or later
- npm
- A running local MongoDB instance

## Installation

1. Clone the repository and open the project directory.

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
   JWT_SECRET=replace-with-a-long-random-secret
   ```

   The application currently connects to MongoDB at `mongodb://localhost:27017/notesDB`.

4. Start the API.

   ```bash
   npm start
   ```

   For development with automatic restarts:

   ```bash
   npm run dev
   ```

The server is available at `http://localhost:3000` by default.

## Authentication

Register a user, then sign in to receive a JWT. Include the token on every `/notes` request and on protected `/users` requests:

```http
Authorization: Bearer <token>
```

Tokens expire after one hour. New registrations receive the `user` role by default. The `GET /users` and `DELETE /users/:id` endpoints require an `admin` token.

## API Reference

### Health Check

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Returns the API welcome message and version. |

### Users

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/users/register` | No | Register a new user. |
| `POST` | `/users/login` | No | Authenticate a user and return a JWT. |
| `GET` | `/users/profile` | JWT | Get the current user's profile. |
| `GET` | `/users` | Admin JWT | List all users. |
| `DELETE` | `/users/:id` | Admin JWT | Delete a user by ID. |

#### Register

```http
POST /users/register
Content-Type: application/json

{
  "username": "jane",
  "password": "secure-password"
}
```

`username` is required and `password` must contain at least six characters.

#### Login

```http
POST /users/login
Content-Type: application/json

{
  "username": "jane",
  "password": "secure-password"
}
```

Successful responses include a token:

```json
{
  "success": true,
  "token": "<jwt>"
}
```

### Notes

All note endpoints require a valid JWT.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/notes` | Create a note. |
| `GET` | `/notes` | Retrieve all notes. |
| `GET` | `/notes/:id` | Retrieve a note by MongoDB ID. |
| `PUT` | `/notes/:id` | Update a note title. |
| `DELETE` | `/notes/:id` | Delete a note by MongoDB ID. |

#### Create or Update a Note

```http
POST /notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Prepare project update"
}
```

The `title` field is required. The value `admin` is reserved and cannot be used as a title. To update a note, send the same body to `PUT /notes/:id`.

## Response Format

Successful single-resource requests generally return:

```json
{
  "success": true,
  "data": {}
}
```

Errors are returned in a consistent shape:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Title is required"
}
```

## Project Structure

```text
notes-api-MVC/
├── config/          # Database connection
├── controllers/     # HTTP request handlers
├── middlewares/     # Authentication, authorization, validation, errors, logging
├── models/          # Mongoose schemas
├── repositories/    # Database access layer
├── routes/          # API route definitions
├── services/        # Business logic
├── utils/           # Shared utilities and constants
├── validators/      # Request validation rules
└── app.js           # Application entry point
```

## Additional Documentation

See the [setup guide](docs/setup.md) for a concise setup reference.

## License

This project is intended for learning and development purposes.
