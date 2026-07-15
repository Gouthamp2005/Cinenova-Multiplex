const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

function shapeShowRow(row) {
  return {
    id: row.id,
    movie_id: row.movie_id,
    screen_id: row.screen_id,
    show_date: row.show_date,
    show_time: row.show_time,
    price_regular: Number(row.price_regular),
    price_premium: Number(row.price_premium),
    price_recliner: Number(row.price_recliner),
    is_active: !!row.is_active,
    created_at: row.created_at,
    movie: {
      id: row.movie_id,
      title: row.m_title,
      genre: row.m_genre,
      language: row.m_language,
      duration_minutes: row.m_duration_minutes,
      rating: row.m_rating,
      description: row.m_description,
      cast_info: row.m_cast_info,
      director: row.m_director,
      poster_url: row.m_poster_url,
      banner_url: row.m_banner_url,
      release_date: row.m_release_date,
      is_active: !!row.m_is_active,
    },
    screen: {
      id: row.screen_id,
      screen_number: row.s_screen_number,
      name: row.s_name,
      total_rows: row.s_total_rows,
      seats_per_row: row.s_seats_per_row,
      screen_type: row.s_screen_type,
    },
  };
}

const BASE_SELECT = `
  SELECT
    sh.*,
    m.title AS m_title, m.genre AS m_genre, m.language AS m_language,
    m.duration_minutes AS m_duration_minutes, m.rating AS m_rating,
    m.description AS m_description, m.cast_info AS m_cast_info, m.director AS m_director,
    m.poster_url AS m_poster_url, m.banner_url AS m_banner_url,
    m.release_date AS m_release_date, m.is_active AS m_is_active,
    sc.screen_number AS s_screen_number, sc.name AS s_name,
    sc.total_rows AS s_total_rows, sc.seats_per_row AS s_seats_per_row,
    sc.screen_type AS s_screen_type
  FROM shows sh
  JOIN movies m ON m.id = sh.movie_id
  JOIN screens sc ON sc.id = sh.screen_id
`;

// GET /api/shows?movieId=1&active=true
router.get("/", async (req, res) => {
  try {
    const { movieId, active } = req.query;
    const clauses = [];
    const params = [];
    if (movieId) { clauses.push("sh.movie_id = ?"); params.push(movieId); }
    if (active === "true") clauses.push("sh.is_active = TRUE");
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `${BASE_SELECT} ${where} ORDER BY sh.show_date ASC, sh.show_time ASC`,
      params
    );
    res.json(rows.map(shapeShowRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load shows" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(`${BASE_SELECT} WHERE sh.id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Show not found" });
    res.json(shapeShowRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load show" });
  }
});

// Seats already booked for a show (across all confirmed bookings)
router.get("/:id/booked-seats", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT bs.seat_id
       FROM booking_seats bs
       JOIN bookings b ON b.id = bs.booking_id
       WHERE b.show_id = ?`,
      [req.params.id]
    );
    res.json(rows.map((r) => r.seat_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load booked seats" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      movie_id, screen_id, show_date, show_time,
      price_regular, price_premium, price_recliner, is_active,
    } = req.body;

    if (!movie_id || !screen_id || !show_date || !show_time) {
      return res.status(400).json({ error: "movie_id, screen_id, show_date and show_time are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO shows (movie_id, screen_id, show_date, show_time, price_regular, price_premium, price_recliner, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        movie_id, screen_id, show_date, show_time,
        price_regular || 180, price_premium || 280, price_recliner || 450,
        is_active === undefined ? true : is_active,
      ]
    );
    const [rows] = await pool.query(`${BASE_SELECT} WHERE sh.id = ?`, [result.insertId]);
    res.status(201).json(shapeShowRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create show" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM shows WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete show" });
  }
});

module.exports = router;
