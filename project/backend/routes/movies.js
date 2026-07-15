const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const activeOnly = req.query.active === "true";
    const sql = activeOnly
      ? "SELECT * FROM movies WHERE is_active = TRUE ORDER BY created_at DESC"
      : "SELECT * FROM movies ORDER BY created_at DESC";
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load movies" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM movies WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Movie not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load movie" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      title, genre, language, duration_minutes, rating,
      description, cast_info, director, poster_url, banner_url,
      release_date, is_active,
    } = req.body;

    if (!title || !genre) return res.status(400).json({ error: "Title and genre are required" });

    const [result] = await pool.query(
      `INSERT INTO movies
        (title, genre, language, duration_minutes, rating, description, cast_info, director, poster_url, banner_url, release_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, genre, language || "English", duration_minutes || 120, rating || "UA",
        description || null, cast_info || null, director || null,
        poster_url || null, banner_url || null, release_date || null,
        is_active === undefined ? true : is_active,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM movies WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create movie" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM movies WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete movie" });
  }
});

module.exports = router;
