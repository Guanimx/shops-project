# ShopVerse - Next.js Auth App

Next.js frontend with internal API adapter/proxy to DummyJSON Auth.

## Requirements Covered

- Login page with `username` and `password`
- Basic validation and login error state
- Login success redirects to `/profile`
- Profile page loads authenticated user data
- Profile reload still works through an httpOnly cookie
- Logout clears the auth cookie
- Client components call only same-origin `/api/...` routes
- Next.js Route Handlers proxy to the upstream DummyJSON API
- Route protection for `/profile`
- Loading and error states
- Responsive UI

## Upstream API

The upstream API URL is stored in the root `.env` file:

```env
API_BASE_URL=https://dummyjson.com
```

Only server-side route handlers read `API_BASE_URL`. Client components never import it and never call the upstream API directly.

| Internal Route | Upstream API |
| --- | --- |
| `POST /api/auth/login` | `POST ${API_BASE_URL}/auth/login` |
| `GET /api/auth/me` | `GET ${API_BASE_URL}/auth/me` |
| `POST /api/auth/logout` | Local cookie clear |
| `POST /api/auth/profile` | `PATCH ${API_BASE_URL}/users/:id` mock update |

Auth token handling:

- DummyJSON returns `accessToken` from `/auth/login`
- The Next.js API route stores it in an `httpOnly` cookie named `auth_token`
- `/api/auth/me` reads that cookie server-side and sends it to DummyJSON as a Bearer token
- Client-side code never reads or stores the token directly

## Setup Project

### 1. Create Environment File

```bash
cp .env.example .env
```

Make sure the root `.env` contains:

```env
API_BASE_URL=https://dummyjson.com
```

Do not prefix it with `NEXT_PUBLIC_`. It must stay server-only.

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## DummyJSON Test Credentials

```txt
username: emilys
password: emilyspass
```

You can also use any valid user credentials from DummyJSON users.

## Project Structure

```txt
frontend/
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts
│   │   ├── me/route.ts
│   │   ├── logout/route.ts
│   │   └── profile/route.ts
│   ├── login/page.tsx
│   └── profile/
│       ├── page.tsx
│       ├── loading.tsx
│       ├── error.tsx
│       └── ProfileClient.tsx
└── app/components/AlertModal.tsx
```

## Notes

- Profile edit is a DummyJSON mock update. DummyJSON does not permanently persist updates.
- Uploaded profile images are previewed in the UI, but DummyJSON does not store uploaded image files.
- The app uses `httpOnly`, `sameSite: "lax"` cookies for token storage.
- In browser DevTools Network, auth/profile requests should appear as `/api/auth/...`, not as upstream API requests.
