const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  password: {
    type: String,
  },
  createdDate: {
    type: Date,
  },
  isBlocked: {
    type: Boolean,
  },
});

module.exports = mongoose.model("user", userSchema);
