const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  fullname: String,
  email: String,
  mobile: String,
  password: String,
  createdDate: Date,
  isBlocked: Boolean,
});

module.exports = mongoose.model("user", userSchema);