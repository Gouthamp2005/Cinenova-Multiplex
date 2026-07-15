const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

function generateBookingRef() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "CN";
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

async function fetchFullBookings(whereSql, params) {
  const [bookings] = await pool.query(
    `SELECT
        b.*,
        sh.show_date, sh.show_time, sh.price_regular, sh.price_premium, sh.price_recliner,
        m.id AS movie_id, m.title AS movie_title, m.poster_url AS movie_poster_url,
        m.genre AS movie_genre, m.language AS movie_language, m.duration_minutes AS movie_duration_minutes,
        m.director AS movie_director,
        sc.id AS screen_id, sc.name AS screen_name, sc.screen_type AS screen_type
     FROM bookings b
     JOIN shows sh ON sh.id = b.show_id
     JOIN movies m ON m.id = sh.movie_id
     JOIN screens sc ON sc.id = sh.screen_id
     ${whereSql}
     ORDER BY b.created_at DESC`,
    params
  );

  if (bookings.length === 0) return [];

  const ids = bookings.map((b) => b.id);
  const [seatRows] = await pool.query(
    `SELECT bs.booking_id, bs.ticket_type, s.*
     FROM booking_seats bs JOIN seats s ON s.id = bs.seat_id
     WHERE bs.booking_id IN (?)`,
    [ids]
  );
  const [snackRows] = await pool.query(
    `SELECT bsn.booking_id, bsn.quantity, bsn.snack_id, sn.name, sn.price, sn.category, sn.image_url
     FROM booking_snacks bsn JOIN snacks sn ON sn.id = bsn.snack_id
     WHERE bsn.booking_id IN (?)`,
    [ids]
  );

  return bookings.map((b) => ({
    id: b.id,
    user_id: b.user_id,
    show_id: b.show_id,
    booking_ref: b.booking_ref,
    total_amount: Number(b.total_amount),
    payment_method: b.payment_method,
    payment_status: b.payment_status,
    male_count: b.male_count,
    female_count: b.female_count,
    created_at: b.created_at,
    show: {
      id: b.show_id,
      show_date: b.show_date,
      show_time: b.show_time,
      price_regular: b.price_regular,
      price_premium: b.price_premium,
      price_recliner: b.price_recliner,
      movie: {
        id: b.movie_id,
        title: b.movie_title,
        poster_url: b.movie_poster_url,
        genre: b.movie_genre,
        language: b.movie_language,
        duration_minutes: b.movie_duration_minutes,
        director: b.movie_director,
      },
      screen: { id: b.screen_id, name: b.screen_name, screen_type: b.screen_type },
    },
    booking_seats: seatRows
      .filter((s) => s.booking_id === b.id)
      .map((s) => ({
        ticket_type: s.ticket_type,
        seat: { id: s.id, row_label: s.row_label, seat_number: s.seat_number, seat_type: s.seat_type },
      })),
    booking_snacks: snackRows
      .filter((s) => s.booking_id === b.id)
      .map((s) => ({
        snack_id: s.snack_id,
        quantity: s.quantity,
        snack: { id: s.snack_id, name: s.name, price: Number(s.price), category: s.category, image_url: s.image_url },
      })),
  }));
}

// Create a booking (seats + snacks) atomically
router.post("/", requireAuth, async (req, res) => {
  const { show_id, seats, snacks, payment_method, total_amount } = req.body;

  if (!show_id || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: "show_id and at least one seat are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Guard against double-booking: check none of the requested seats are already booked for this show
    const seatIds = seats.map((s) => s.seat_id);
    const [already] = await conn.query(
      `SELECT bs.seat_id FROM booking_seats bs
       JOIN bookings b ON b.id = bs.booking_id
       WHERE b.show_id = ? AND bs.seat_id IN (?)`,
      [show_id, seatIds]
    );
    if (already.length > 0) {
      await conn.rollback();
      return res.status(409).json({ error: "One or more selected seats were just booked by someone else. Please reselect." });
    }

    const maleCount = seats.filter((s) => s.ticket_type === "male").length;
    const femaleCount = seats.filter((s) => s.ticket_type === "female").length;
    const bookingRef = generateBookingRef();

    const [result] = await conn.query(
      `INSERT INTO bookings (user_id, show_id, booking_ref, total_amount, payment_method, payment_status, male_count, female_count)
       VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?)`,
      [req.user.id, show_id, bookingRef, total_amount || 0, payment_method || "UPI", maleCount, femaleCount]
    );
    const bookingId = result.insertId;

    const seatValues = seats.map((s) => [bookingId, s.seat_id, s.ticket_type || "male"]);
    await conn.query("INSERT INTO booking_seats (booking_id, seat_id, ticket_type) VALUES ?", [seatValues]);

    if (Array.isArray(snacks) && snacks.length > 0) {
      const snackValues = snacks.map((s) => [bookingId, s.snack_id, s.quantity || 1]);
      await conn.query("INSERT INTO booking_snacks (booking_id, snack_id, quantity) VALUES ?", [snackValues]);
    }

    await conn.commit();

    const [full] = await fetchFullBookings("WHERE b.id = ?", [bookingId]);
    res.status(201).json(full);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  } finally {
    conn.release();
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const rows = await fetchFullBookings("WHERE b.user_id = ?", [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

// Admin: all bookings
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rows = await fetchFullBookings("", []);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const rows = await fetchFullBookings("WHERE b.id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Booking not found" });
    const booking = rows[0];
    if (booking.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: "Not authorized to view this booking" });
    }
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load booking" });
  }
});

module.exports = router;
