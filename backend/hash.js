const bcrypt = require('bcryptjs');

(async () => {
  const hash = await bcrypt.hash("QWE@#$asd234", 10);
  const boolVal = await bcrypt.compare("QWE@#$asd234", hash);
  console.log(hash, boolVal);
})();