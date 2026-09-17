const { pool } = require("./database");

async function findUserByLogin(login) {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE LOWER(email) = LOWER($1)
       OR LOWER(employee_id) = LOWER($1)
    LIMIT 1
    `,
    [login.trim()]
  );

  return result.rows[0] || null;
}

module.exports = {
  findUserByLogin,
};