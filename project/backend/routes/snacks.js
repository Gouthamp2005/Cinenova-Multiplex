const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const availableOnly = req.query.available === "true";
    const sql = availableOnly
      ? "SELECT * FROM snacks WHERE is_available = TRUE ORDER BY category ASC, name ASC"
      : "SELECT * FROM snacks ORDER BY category ASC, name ASC";
    const [rows] = await pool.query(sql);
    res.json(rows.map((r) => ({ ...r, price: Number(r.price) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load snacks" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, price, category, description, image_url, is_available } = req.body;
    if (!name || price === undefined) return res.status(400).json({ error: "Name and price are required" });

    const [result] = await pool.query(
      "INSERT INTO snacks (name, price, category, description, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)",
      [name, price, category || "Food", description || null, image_url || null, is_available === undefined ? true : is_available]
    );
    const [rows] = await pool.query("SELECT * FROM snacks WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create snack" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM snacks WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete snack" });
  }
});

module.exports = router;
