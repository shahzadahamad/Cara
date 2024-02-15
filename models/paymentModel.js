const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  orderId:{
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod:{
    type: String,
    required: true,
  },
  transactionId:{
    type: String,
    required: true,
  },
  status: {
    type:String,
    enum:['Pending','Success'],
    required: true,
  },
  createdDate:{
    type:Date,
    required: true,
  }
});

module.exports = mongoose.model("payment",paymentSchema);
