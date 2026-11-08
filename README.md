# MySolar

A full-stack starter with **Next.js** on the frontend, **FastAPI** on the backend and **PostgreSQL** as the database. It ships with email/password auth, **Google sign-in only** (no GitHub), a forgot/reset password flow, a sign-up page, a shadcn `sidebar-07` shell for every user, and an admin-only organization menu.

No seed users, organizations or other rows are created. The first account you register becomes the administrator.

## Stack

| Layer    | Technology |
| -------- | ---------- |
| Frontend | Next.js 16 (App Router, React 19), Tailwind CSS v4, shadcn/ui |
| Backend  | FastAPI, SQLAlchemy 2, Pydantic v2, PyJWT, bcrypt |
| Database | PostgreSQL |
| Auth     | JWT stored in an httpOnly cookie + Google OAuth 2.0 |

### shadcn blocks used

- `login-02` → two-column login page at `/login`, adapted to Google + email/password
- `login-05` → email-only **forgot password** page at `/forgot-password`
- `sidebar-07` → the dashboard shell used by **all** signed-in users
- `signup` + `reset-password` follow the same visual language (custom forms)

The GitHub button from `login-02` and the social buttons from `login-05` were removed, so the only social provider is Google.

## Project structure

```
mysolar/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, table creation
│   │   ├── config.py               # env settings
│   │   ├── database.py             # SQLAlchemy engine/session
│   │   ├── models.py               # User, Organization, Membership, PasswordResetToken
│   │   ├── schemas.py              # request/response models
│   │   ├── security.py             # bcrypt, JWT, reset tokens
│   │   ├── deps.py                 # current user / admin guards
│   │   └── routers/
│   │       ├── auth.py             # register, login, google, me, forgot/reset
│   │       └── organizations.py    # admin organization + member management
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/app/
│   │   ├── login/                  # login-02
│   │   ├── signup/
│   │   ├── forgot-password/        # login-05 adapted
│   │   ├── reset-password/
│   │   ├── api/auth/google/        # OAuth start, signup start, callback
│   │   └── (app)/                  # sidebar-07 shell (session protected)
│   │       ├── dashboard/          # overview + read-only org pages + account
│   │       └── admin/              # org menu (admins only)
│   ├── src/components/             # sidebar, forms, org/member components
│   ├── src/lib/actions/            # server actions (auth + organizations)
│   └── .env.example
├── docker-compose.yml              # optional PostgreSQL service
└── README.md
```

## Quick start

### 1. PostgreSQL

Either use the included compose file:

```bash
docker compose up -d postgres
```

or create the role and database on an existing PostgreSQL server:

```sql
CREATE ROLE mysolar LOGIN PASSWORD 'mysolar';
CREATE DATABASE mysolar OWNER mysolar;
```

Default connection string:

```
postgresql+psycopg://mysolar:mysolar@127.0.0.1:5432/mysolar
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # adjust values
uvicorn app.main:app --reload --port 8000
```

- API: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs

Tables are created automatically on startup (no data is inserted). For production, replace `Base.metadata.create_all` with Alembic migrations.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # adjust values
npm run dev
```

Open http://localhost:3000. You will be redirected to `/login`. Use **Sign up** to create the first account — it automatically receives the `admin` role.

> The project is fully session-driven, so `cacheComponents` is disabled in `next.config.ts` and every authenticated route is rendered dynamically.

## Google sign-in setup

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth client ID** of type **Web application**.
3. Add this **Authorized redirect URI** (exactly):
   ```
   http://localhost:3000/api/auth/google/callback
   ```
4. Put the credentials in **both** env files:

   `frontend/.env.local`
   ```env
   GOOGLE_CLIENT_ID=...apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=...
   APP_URL=http://localhost:3000
   ```

   `backend/.env`
   ```env
   GOOGLE_CLIENT_ID=...apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=...
   ```

   The backend uses the client ID to verify the Google ID token audience.

Without credentials the Google buttons still redirect to `/api/auth/google`, which returns to the login page with a “not configured” message. Email/password auth works without Google.

OAuth flow: `/api/auth/google` → Google consent → `/api/auth/google/callback` → exchanges the code, sends the ID token to `POST /api/auth/google`, verifies/creates the user, sets the session cookie and redirects to `/dashboard`.

## Password reset

`POST /api/auth/forgot-password` always returns the same message so accounts cannot be enumerated. In development no SMTP server is configured, so the reset link is logged by the API and (when `EXPOSE_RESET_LINK=true` and `DEBUG=true`) returned to the UI. It is displayed as a “Development mode” link on `/forgot-password`.

For production, send the link by email and set `EXPOSE_RESET_LINK=false`. Reset tokens are stored as SHA-256 hashes, expire after 30 minutes and are single use.

## Roles and the organization menu

- **Admin** (`role = admin`): sees the `Administration → Organizations` sidebar item, the organization switcher with “Manage organizations”, a create-organization card, and full organization/member management.
- **Member** (`role = user`): sees the same `sidebar-07` shell, but only the organizations they belong to, with read-only detail pages.
- The first registered account becomes admin. Additional emails can be forced to admin with `ADMIN_EMAILS=a@b.com,c@d.com`.

Organization management lives at:

- `/admin/organizations` — list + create
- `/admin/organizations/[id]` — rename, delete, add/remove members
- `/dashboard/organizations/[id]` — read-only view for regular members

## API summary

| Method | Path | Access | Purpose |
| ------ | ---- | ------ | ------- |
| POST | `/api/auth/register` | public | Create account (first = admin) |
| POST | `/api/auth/login` | public | Email/password login |
| POST | `/api/auth/google` | public | Verify Google ID token, upsert user |
| GET | `/api/auth/me` | bearer | Current profile |
| POST | `/api/auth/forgot-password` | public | Create reset token |
| POST | `/api/auth/reset-password` | public | Consume reset token |
| GET | `/api/organizations` | signed in | All orgs (admin) or own orgs |
| POST | `/api/organizations` | admin | Create organization |
| GET | `/api/organizations/{id}` | member/admin | Organization details |
| PATCH | `/api/organizations/{id}` | admin | Rename organization |
| DELETE | `/api/organizations/{id}` | admin | Delete organization |
| GET | `/api/organizations/{id}/members` | member/admin | List members |
| POST | `/api/organizations/{id}/members` | admin | Add existing user by email |
| DELETE | `/api/organizations/{id}/members/{userId}` | admin | Remove member |
| GET | `/api/health` | public | Health check |

## Security notes

- Passwords are hashed with bcrypt; reset tokens are hashed with SHA-256.
- Sessions are signed JWTs (7 days) stored in an `httpOnly`, `SameSite=Lax` cookie. The `Secure` flag is enabled whenever `APP_URL` starts with `https://`.
- Route protection is enforced on the server (`(app)/layout.tsx` and `admin/layout.tsx`) and re-checked by the API on every request.
- Google OAuth uses a state cookie to prevent CSRF on the callback.
- Before deploying, change `JWT_SECRET`, disable `DEBUG`/`EXPOSE_RESET_LINK`, and serve both apps over HTTPS.

## Useful commands

```bash
# backend
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload

# frontend
cd frontend && npm run dev

# production build
cd frontend && npm run build && npm run start
```
