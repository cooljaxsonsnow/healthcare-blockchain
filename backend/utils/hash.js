const crypto = require('crypto');

exports.generateHash = () => {
  // Generate a random string
  const randomData = crypto.randomBytes(20).toString('hex');

  // Create a SHA-256 hash of the random string
  const hash = crypto.createHash('sha256').update(randomData).digest('hex');

  return hash;
}