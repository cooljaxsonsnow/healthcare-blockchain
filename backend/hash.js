const bcrypt = require('bcryptjs');

(async() => {
  const hash = await bcrypt.hash("QWE@#$asd234", 10);
  console.log(hash);
})();