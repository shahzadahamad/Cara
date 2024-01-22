const mongoose = require("mongoose");

const userOTPVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
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
