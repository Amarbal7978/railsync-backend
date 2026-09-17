const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

async function testDatabaseConnection() {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT NOW() AS current_time");

    console.log(
      "PostgreSQL connected:",
      result.rows[0].current_time
    );
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  testDatabaseConnection,
};