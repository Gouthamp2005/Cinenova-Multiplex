// Usage: node config/makeAdmin.js someone@example.com
// Register the account normally on the site first, then run this to grant admin access.
require("dotenv").config();
const pool = require("./db");

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: node config/makeAdmin.js someone@example.com");
    process.exit(1);
  }
  const [result] = await pool.query("UPDATE users SET is_admin = TRUE WHERE email = ?", [email]);
  if (result.affectedRows === 0) {
    console.log(`No user found with email ${email}. Register that account first.`);
  } else {
    console.log(`${email} is now an admin.`);
  }
  process.exit(0);
}

run();
