const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

module.exports = generateHash;