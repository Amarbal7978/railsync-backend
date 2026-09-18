const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, storedPassword) {
  return bcrypt.compare(password, storedPassword);
}

module.exports = {
  hashPassword,
  verifyPassword,
};