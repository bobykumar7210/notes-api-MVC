# Setup Guide

Step-by-step instructions to run the Notes API locally.

## Prerequisites

Install and verify the following before continuing:

| Requirement | Notes |
| --- | --- |
| **Node.js** | Version 16 or later recommended |
| **npm** | Bundled with Node.js |
| **MongoDB** | Local instance or a remote URI (for example MongoDB Atlas) |
| **Cloudinary account** | Required for profile image uploads |

Verify your tooling:

```bash
node -v
npm -v
```

## 1. Clone the Repository

```bash
git clone <repository-url>
cd notes-api-MVC
```

## 2. Install Dependencies

```bash
npm install
```

This installs production and development packages defined in `package.json`.

## 3. Configure Environment Variables

Copy the example file and edit the values for your environment:

```bash
cp .env.example .env
```

### Variable Reference

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `PORT` | No | HTTP port (defaults to `3000`) | `3000` |
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb://localhost:27017/notes-api` |
| `JWT_SECRET` | Yes | Secret used to sign JWTs — use a long, random value | `replace-with-a-long-random-secret` |
| `CORS_ORIGIN` | No | Allowed browser origin (defaults to Vite FE) | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Yes* | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Yes* | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Yes* | Cloudinary API secret | `your_api_secret` |
| `SEED_ADMIN_USERNAME` | For seed | First admin username | `admin` |
| `SEED_ADMIN_EMAIL` | For seed | First admin email | `admin@example.com` |
| `SEED_ADMIN_PASSWORD` | For seed | First admin password (min 6 chars) | `admin123456` |

\*Required for profile image upload. Other endpoints can run without Cloudinary if you skip upload features.

Example `.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/notes-api
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=admin123456
```

Never commit `.env`. It is ignored via `.gitignore`. Keep `.env.example` as the shared template.

## 4. Database Setup

### Local MongoDB

1. Start the MongoDB service on your machine.
2. Set `MONGO_URI` to a local database, for example:

   ```env
   MONGO_URI=mongodb://localhost:27017/notes-api
   ```

### MongoDB Atlas

1. Create a cluster and database user in [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Allow network access for your IP (or `0.0.0.0/0` for temporary local development).
3. Copy the connection string into `MONGO_URI`, substituting your username, password, and database name.

## 5. Cloudinary Setup

1. Sign in to [Cloudinary](https://cloudinary.com/).
2. Open the dashboard and copy **Cloud name**, **API Key**, and **API Secret**.
3. Paste them into `.env` as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

Profile images are uploaded under the `notes-api/profiles/<userId>` folder path.

## 6. Start the Server

Seed the first admin once (required because public registration cannot create admins):

```bash
npm run seed:admin
```

Development (auto-restart on file changes):

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

On success you should see logs similar to:

```text
MongoDB Connected
🚀 Notes API is running on http://localhost:3000
```

Open or request:

```bash
curl http://localhost:3000/api
```

Expected response:

```json
{
  "message": "Welcome to Notes API",
  "version": "1.0.0"
}
```

## 7. Smoke Test the Auth Flow

Register:

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","email":"jane@example.com","password":"secure-password"}'
```

Login:

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","password":"secure-password"}'
```

Use the returned token for protected routes:

```bash
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <token>"
```

## 8. Testing in VS Code or Postman

### VS Code (REST Client)
1. Install the **REST Client** extension (`humao.rest-client`) or **Thunder Client** in VS Code.
2. Open [`docs/api.http`](api.http).
3. Update `@token` and `@adminToken` with your JWTs.
4. Click **Send Request** above any endpoint to execute it directly inside VS Code.

### Postman
1. In Postman, click **Import**.
2. Select [`docs/postman/notes-api.postman_collection.json`](postman/notes-api.postman_collection.json).
3. Import the environment [`docs/postman/notes-api.postman_environment.json`](postman/notes-api.postman_environment.json).
4. Set your active environment to `Notes API Local` (configured with `baseUrl: http://localhost:3000/api`).

## 9. Run Tests

```bash
npm test
```

## Troubleshooting

| Issue | Likely cause | What to check |
| --- | --- | --- |
| Server exits on startup | MongoDB unreachable | Confirm MongoDB is running and `MONGO_URI` is correct |
| `JWT_SECRET environment variable is required` | Missing secret | Set `JWT_SECRET` in `.env` |
| Profile upload fails | Cloudinary misconfigured | Verify all three Cloudinary variables |
| `401 Unauthorized` | Missing or invalid token | Send `Authorization: Bearer <token>` with a non-expired JWT |
| `404 Not Found` | Missing `/api` prefix | Ensure requests target `http://localhost:3000/api/...` |
| `429 Too many requests` | Rate limit hit | Wait for the 15-minute window or reduce request frequency |
| `EADDRINUSE` | Port already in use | Change `PORT` in `.env` or free the occupied port |

## Next Steps

- Review the full [API reference](../README.md#api-reference) in the project README
- Explore routes under `routes/` and business logic under `services/`

