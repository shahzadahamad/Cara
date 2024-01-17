const mongoose = require("mongoose");

const userOTPVerificationSchema = new mongoose.Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

module.exports = mongoose.model(
  "userOTPVerification",
  userOTPVerificationSchema
);
