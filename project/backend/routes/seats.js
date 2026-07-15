const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// GET /api/seats?screenId=1
router.get("/", async (req, res) => {
  try {
    const { screenId } = req.query;
    if (!screenId) return res.status(400).json({ error: "screenId query param is required" });
    const [rows] = await pool.query(
      "SELECT * FROM seats WHERE screen_id = ? ORDER BY row_label ASC, seat_number ASC",
      [screenId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load seats" });
  }
});

module.exports = router;
