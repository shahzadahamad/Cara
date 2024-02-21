const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  products: [{
    productId:{
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "product",
    }
  }]
});

module.exports = mongoose.model('wishlist',wishlistSchema);