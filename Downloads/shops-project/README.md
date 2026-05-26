# ShopVerse - Full Stack App

Next.js (Frontend + Internal API Connector) + PHP (Backend API) + PostgreSQL

---

Project Structure

```
project/
├── frontend/           Next.js 
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts     # POST /api/auth/login
│   │   │   │   ├── me/route.ts        # GET  /api/auth/me
│   │   │   │   ├── profile/route.ts   # POST /api/auth/profile
│   │   │   │   └── logout/route.ts    # POST /api/auth/logout
│   │   ├── login/page.tsx
│   │   ├── profile/page.tsx
│   └── ...
└── backend/           # PHP API
    ├── .env           # Local backend config
    ├── database/
    │   ├── schema.sql
    │   └── seed.php
    ├── .htaccess      # URL routing
    ├── helpers.php    # Shared utilities
    ├── router.php     # PHP built-in server router
    ├── uploads/       # Runtime uploaded files
    └── api/
        ├── auth/
        │   ├── login.php
        │   ├── me.php
        │   ├── profile.php
        │   └── logout.php
```

---

## Setup Project

### 1. Create Environment File

```bash
cp .env.example .env
```

Set the root `.env` values:

```env
API_BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=shops_project
DB_USER=postgres
DB_PASS=
AUTH_SECRET=change-this-local-secret
AUTH_TOKEN_TTL=3600
```

The frontend reads `API_BASE_URL` from the root `.env` through `frontend/next.config.ts`.
`API_BASE_URL` is read only by Next.js server code in route handlers. Do not prefix it with `NEXT_PUBLIC_`.

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Prepare PostgreSQL Database

Create an empty PostgreSQL database named `shops_project` first.

Example with `psql`:

```bash
createdb -h 127.0.0.1 -p 5432 -U postgres shops_project
```

If the database already exists, skip this step.

### 4. Migrate Database

Run this from the `backend` folder:

```bash
cd backend
php database/migrate.php
```

This reads `backend/database/schema.sql` and creates the required tables.

Alternative using `psql`:

```bash
cd backend
psql -h 127.0.0.1 -p 5432 -U postgres -d shops_project -f database/schema.sql
```

### 5. Seed Default Data

Run this from the `backend` folder:

```bash
php database/seed.php
```

Default login:

```txt
username: Admin
password: SystemAdmin
```

### 6. Run Backend API

Requires PHP 8.1+ with `pdo_pgsql` enabled.

```bash
cd backend
php -S localhost:8080 router.php
# API at http://localhost:8080/api/...
```

### 7. Run Frontend

Open a second terminal:

```bash
cd frontend
npm run dev
# Frontend at http://localhost:3000
```

### Apache/Nginx

- Point document root to `/backend`
- Enable `mod_rewrite` for `.htaccess` routing

---

## Token Management

- **Next.js**: Token stored in `httpOnly` cookie (`auth_token`) set by the API route
- **PHP**: Token stored in `httpOnly` cookie via `setcookie()` with `httponly: true`
- Client NEVER receives the raw token
- Frontend auth calls go through same-origin `/api/...`, then the Next.js server proxies to `API_BASE_URL`

---

## API Connector Design

The browser never calls the PHP backend URL directly. Client components call only internal same-origin endpoints:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/profile`
- `POST /api/auth/logout`

Those endpoints are implemented as Next.js Route Handlers in `frontend/app/api/.../route.ts`. They read `API_BASE_URL` from the root `.env` on the server, forward requests to the PHP backend, and pass through the `httpOnly` auth cookie. Because `API_BASE_URL` is server-only, it is not bundled into client components and does not appear as a direct browser request in DevTools Network.

UI states:

- Loading: login button pending state and `frontend/app/profile/loading.tsx`
- Error: login form errors and `frontend/app/profile/error.tsx`
- Empty: profile empty state when no user data is available

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (username/email + password) |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/profile` | Update profile and profile image |
| POST | `/api/auth/logout` | Logout (clear cookie) |

---

## Default Credentials

```
username: Admin
password: SystemAdmin
```

---

## Security Notes

- Tokens stored in `httpOnly` cookies (not accessible via JS)
- `secure` flag set in production (HTTPS)
- `SameSite: Lax` to prevent CSRF
- Input validation on both frontend and backend
- All external API calls proxied server-side
