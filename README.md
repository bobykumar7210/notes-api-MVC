# Notes API

A RESTful Notes API built with Node.js, Express, MongoDB, and Mongoose. The project follows an MVC-inspired layered architecture and supports authenticated users, per-user notes, and profile image uploads with Cloudinary.

## Features

- JWT-based user authentication
- Role-based authorization for administrator-only user management
- Create, read, update, and delete notes
- Notes are user-scoped, so a user only sees their own notes
- Note fields include `title` and `description`
- Profile image upload with Cloudinary
- Image-only upload validation with size limit of 5 MB
- Request validation with `express-validator`
- Centralized error handling and request logging
- Password hashing with bcrypt

## Technology Stack

- Node.js and Express
- MongoDB and Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- bcryptjs
- express-validator
- multer
- cloudinary

## Prerequisites

- Node.js 16 or later
- npm
- A running local MongoDB instance
- A Cloudinary account with API credentials

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
   MONGO_URI=mongodb://localhost:27017/notesDB
   JWT_SECRET=replace-with-a-long-random-secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

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

Register a user, then sign in to receive a JWT. Include the token on every protected request:

```http
Authorization: Bearer <token>
```

Tokens expire after one hour. New registrations receive the `user` role by default. The `GET /users` and `DELETE /users/:id` endpoints require an admin token.

## API Reference

### Health Check

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Returns API status information. |

### Users

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/users/register` | No | Register a new user. |
| `POST` | `/users/login` | No | Authenticate a user and return a JWT. |
| `GET` | `/users/profile` | JWT | Get the current user's profile. |
| `POST` | `/users/profile/image` | JWT | Upload and store a profile image. |
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

Allowed image MIME types:
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

Maximum file size: `5 MB`

### Notes

All note endpoints require a valid JWT.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/notes` | Create a note for the current user. |
| `GET` | `/notes` | Retrieve all notes for the current user. |
| `GET` | `/notes/:id` | Retrieve a note by MongoDB ID if it belongs to the current user. |
| `PUT` | `/notes/:id` | Update a note if it belongs to the current user. |
| `DELETE` | `/notes/:id` | Delete a note if it belongs to the current user. |

#### Create a Note

```http
POST /notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Prepare project update",
  "description": "Final review of the project roadmap and release tasks"
}
```

Validation rules:
- `title` is required and max 255 characters
- `description` is optional and max 2000 characters
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
├── config/          # Database and Cloudinary configuration
├── controllers/     # HTTP request handlers
├── docs/            # Setup docs and Postman exports
├── middlewares/     # Authentication, authorization, validation, errors, logging, upload
├── models/          # Mongoose schemas
├── repositories/    # Database access layer
├── routes/          # API route definitions
├── services/        # Business logic and upload service
├── utils/           # Shared utilities and constants
├── validators/      # Request validation rules
├── app.js           # Application entry point
├── .env.example     # Example environment configuration
├── package.json     # Dependencies and scripts
└── README.md        # Project documentation
```

## Additional Documentation

See the [setup guide](docs/setup.md) for a concise setup reference.

## License

This project is intended for learning and development purposes.
