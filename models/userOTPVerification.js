const mongoose = require("mongoose");

const userOTPVerificationSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  otp: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  }
});



module.exports = mongoose.model(
  "userOTPVerification",
  userOTPVerificationSchema
);
