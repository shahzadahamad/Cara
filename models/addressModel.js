const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
  },
  address:[{
    name:{
      type: String,
    },
    email: {
      type: String,
    },
    mobile: {
      type: String
    },
    address: {
      type: String,
    },
    pincode:{
      type: Number,
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
  }]

});

module.exports = mongoose.model("address",addressSchema);
