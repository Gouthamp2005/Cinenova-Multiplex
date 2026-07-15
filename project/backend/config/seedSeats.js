const pool = require("./db");

// mysql_schema.sql seeds screens (with total_rows / seats_per_row) and movies/snacks,
// but does NOT seed individual seats. This generates them once, the first time the
// server starts against an empty `seats` table, so seat maps and bookings work.
async function seedSeatsIfEmpty() {
  const [[{ count }]] = await pool.query("SELECT COUNT(*) AS count FROM seats");
  if (count > 0) return;

  const [screens] = await pool.query("SELECT * FROM screens");
  if (screens.length === 0) return;

  console.log("Seeding seats table (first run)...");

  for (const screen of screens) {
    const rows = [];
    const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, screen.total_rows);
    const recliner_rows = 1; // last row = recliner
    const premium_rows = 2; // next two rows up = premium

    for (let r = 0; r < rowLetters.length; r++) {
      const rowLabel = rowLetters[r];
      const fromBack = rowLetters.length - r; // 1 = last row
      let seatType = "regular";
      if (fromBack <= recliner_rows) seatType = "recliner";
      else if (fromBack <= recliner_rows + premium_rows) seatType = "premium";

      for (let n = 1; n <= screen.seats_per_row; n++) {
        rows.push([screen.id, rowLabel, n, seatType]);
      }
    }

    if (rows.length > 0) {
      await pool.query(
        "INSERT INTO seats (screen_id, row_label, seat_number, seat_type) VALUES ?",
        [rows]
      );
    }
  }

  console.log("Seats seeded successfully.");
}

module.exports = { seedSeatsIfEmpty };
