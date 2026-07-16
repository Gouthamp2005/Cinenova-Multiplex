require("dotenv").config();
const express = require("express");
const cors = require("cors");

const pool = require("./config/db");
const { seedSeatsIfEmpty } = require("./config/seedSeats");

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const screenRoutes = require("./routes/screens");
const showRoutes = require("./routes/shows");
const seatRoutes = require("./routes/seats");
const snackRoutes = require("./routes/snacks");
const bookingRoutes = require("./routes/bookings");

const app = express();
const PORT = process.env.PORT || 8080;
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Handle preflight requests
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/screens", screenRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/snacks", snackRoutes);
app.use("/api/bookings", bookingRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to MySQL database:", process.env.DB_NAME);
    await seedSeatsIfEmpty();
  } catch (err) {
    console.error("Could not connect to MySQL. Check backend/.env credentials.");
    console.error(err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`CineNova backend running on http://localhost:${PORT}`);
  });
}

start();
