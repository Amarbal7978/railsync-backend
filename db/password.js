const bcrypt = require("bcryptjs");

async function verifyPassword(password, storedPassword) {
  return bcrypt.compare(password, storedPassword);
}

module.exports = {
  verifyPassword,
};