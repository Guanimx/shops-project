# ShopVerse - Next.js Auth App

Next.js authentication app with an internal API adapter/proxy for DummyJSON Auth.

## Features

- Login page with `username` and `password`
- Basic login validation
- Login error message for invalid credentials
- Successful login redirects to `/profile`
- Profile page displays name, email, phone, avatar, role, and account data
- Logout clears the session cookie
- Profile reload works because the auth token is stored in an `httpOnly` cookie
- Route protection for `/profile`
- Loading, error, and empty states
- Responsive UI with a mobile sidebar drawer

## API Proxy And Security

Client-side code calls only same-origin `/api/...` routes. It does not call DummyJSON directly and does not read the upstream API URL.

The upstream API URL is stored in the root `.env` file:

```env
API_BASE_URL=https://dummyjson.com
```

Do not prefix it with `NEXT_PUBLIC_`. It must stay server-only.

| Internal Route | Upstream API |
| --- | --- |
| `POST /api/auth/login` | `POST ${API_BASE_URL}/auth/login` |
| `GET /api/auth/me` | `GET ${API_BASE_URL}/auth/me` |
| `POST /api/auth/logout` | Local cookie clear |
| `POST /api/auth/profile` | `PATCH ${API_BASE_URL}/users/:id` mock update |

Token handling:

- DummyJSON returns `accessToken` from `/auth/login`
- `POST /api/auth/login` stores the token in an `httpOnly`, `sameSite: "lax"` cookie named `auth_token`
- The login response is sanitized and does not return `accessToken` or `refreshToken` to the browser
- `GET /api/auth/me` reads `auth_token` server-side and sends it to DummyJSON as a Bearer token
- Client components never read or store the token directly

## Setup

### 1. Create Environment File

```bash
cp .env.example .env
```

Required value:

```env
API_BASE_URL=https://dummyjson.com
```

### 2. Install Dependencies

This project currently uses `npm` and includes `package-lock.json`.

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

## Test Credentials

```txt
username: emilys
password: emilyspass
```

You can also use any valid DummyJSON user credentials.

## How To Verify

Open browser DevTools, go to Network, and filter by `Fetch/XHR`.

After login:

- The request should be `POST /api/auth/login`
- The response body should contain `success` and `user`
- The response body should not contain `accessToken`, `refreshToken`, or `token`
- The response headers should include `Set-Cookie: auth_token=...`

On the profile page:

- The request should be `GET /api/auth/me`
- The response should contain profile fields only, such as `id`, `firstName`, `lastName`, `username`, `email`, `phone`, `image`, and `role`
- Reloading `/profile` should keep working while the cookie is valid
- Opening `/profile` while logged out should redirect to `/login`

## Project Structure

```txt
frontend/
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts
│   │   ├── me/route.ts
│   │   ├── logout/route.ts
│   │   └── profile/route.ts
│   ├── components/
│   │   └── AlertModal.tsx
│   ├── login/
│   │   └── page.tsx
│   └── profile/
│       ├── components/
│       │   ├── Avatar.tsx
│       │   ├── ProfileFields.tsx
│       │   ├── ProfileHero.tsx
│       │   └── ProfileSidebar.tsx
│       ├── page.tsx
│       ├── loading.tsx
│       ├── error.tsx
│       ├── ProfileClient.tsx
│       └── types.ts
├── lib/
│   └── serverApi.ts
├── package.json
└── package-lock.json
```

## Limitations

- Profile edit uses DummyJSON's mock update endpoint. DummyJSON does not permanently persist updates.
- Uploaded profile images are previewed locally in the UI, but DummyJSON does not store uploaded image files.
- There are no automated tests included yet.
- The PHP backend folder is not required for the Next.js DummyJSON proxy flow. The submitted auth flow uses Next.js route handlers under `frontend/app/api/auth`.
