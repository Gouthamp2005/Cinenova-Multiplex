# CineNova Multiplex

A React + Express + MySQL movie ticket booking app.

Supabase has been removed. This project now uses:

| Component | Technology              | Port |
|-----------|--------------------------|------|
| Frontend  | React + Vite + Tailwind  | 5173 |
| Backend   | Express (Node.js)        | 8080 |
| Database  | MySQL (via MySQL Workbench) | 3306 |

## 1. Create the database (MySQL Workbench)

1. Open MySQL Workbench and connect to your local MySQL server.
2. Open `mysql_schema.sql` (in the project root) as a new SQL script.
3. Run it (⚡ lightning bolt / Ctrl+Shift+Enter). This creates the
   `cinenova_multiplex` database with all tables and seed data (20 movies,
   7 screens, 16 snacks).

   > Note: the schema does **not** seed individual seats — the backend
   > auto-generates them (based on each screen's `total_rows` /
   > `seats_per_row`) the first time it starts up.

## 2. Configure and start the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set your real MySQL Workbench credentials:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_workbench_password
DB_NAME=cinenova_multiplex
JWT_SECRET=some_long_random_string
```

Then install and run:

```bash
npm install
npm run dev        # nodemon, auto-restarts on changes
# or: npm start
```

You should see:

```
Connected to MySQL database: cinenova_multiplex
Seeding seats table (first run)...
Seats seeded successfully.
CineNova backend running on http://localhost:8080
```

## 3. Configure and start the frontend

From the project root:

```bash
cp .env.example .env   # already points VITE_API_URL at localhost:8080/api
npm install
npm run dev
```

Open http://localhost:5173.

## 4. Create an account, then make yourself admin

1. Register a normal account from the "Sign Up" page in the app.
2. Promote it to admin from the backend:

```bash
cd backend
node config/makeAdmin.js you@example.com
```

3. Log out and back in — you'll now see the "Admin" tab in the navbar, where
   you can add movies, shows, and snacks.

## What changed from the old (Supabase) version

- `src/lib/supabase.ts` → replaced by `src/lib/api.ts`, a small fetch-based
  client that talks to the Express backend and stores the login token in
  `localStorage`.
- `AuthContext` now does real username/password auth against MySQL
  (bcrypt-hashed passwords + JWT), instead of Supabase Auth.
- Every page that queried Supabase directly (`Home`, `Movies`, `MovieDetail`,
  `SeatSelection`, `Snacks`, `Payment`, `Ticket`, `Bookings`, `Admin`) now
  calls the REST API under `backend/routes/`.
- Booking creation (seats + snacks + booking row) happens in a single
  transactional `POST /api/bookings` call on the server, with a check that
  rejects the booking (`409`) if someone else grabbed the same seat first.
- The dead, unused `src/pages/MovieDetails.tsx` (note the trailing "s" —
  it wasn't wired into any route) and the leftover `supabase/` migrations
  folder were removed since they no longer apply.

## API overview

All endpoints are under `http://localhost:8080/api`.

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /movies`, `GET /movies/:id`, `POST /movies` (admin), `DELETE /movies/:id` (admin)
- `GET /screens`
- `GET /shows?movieId=&active=`, `GET /shows/:id`, `GET /shows/:id/booked-seats`,
  `POST /shows` (admin), `DELETE /shows/:id` (admin)
- `GET /seats?screenId=`
- `GET /snacks?available=`, `POST /snacks` (admin), `DELETE /snacks/:id` (admin)
- `POST /bookings`, `GET /bookings/mine`, `GET /bookings/:id`, `GET /bookings` (admin, all)

This has been tested end-to-end locally (schema load → register → login →
add show → book seats + snacks → view ticket → double-booking rejected).
