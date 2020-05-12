const crypto = require("crypto");

module.exports = (topic) =>
  crypto
    .createHash("sha256")
    .update(topic || "none")
    .digest();
