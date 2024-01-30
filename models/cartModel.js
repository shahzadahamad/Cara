const mongoose = require('mongoose');

const cart = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  products: [{
    productId:{
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "product",
    },
    quantity: {
      type: Number,
      required: true,
    }
  }]
});

module.exports = mongoose.model('cart',cart);