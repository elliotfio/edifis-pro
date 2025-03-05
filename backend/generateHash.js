const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = '1234';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Hachage généré :', hashedPassword);
}

generateHash();