const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  transactions: [{
    type: {
      type: String,
      enum:['Debit','Credit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type:String,
      required: true,
    },
    transactionDate:{
      type:Date,
    }
  }]
});

module.exports = mongoose.model("wallet",walletSchema);
