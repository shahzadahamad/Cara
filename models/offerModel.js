const mongoose = require('mongoose');

const offerSchema  = new mongoose.Schema({
  offerTitle:{
    type:String,
    required:true,
  },
  offerType:{
    type:String,
    required:true,
  },
  discountPercentage:{
    type:String,
    required:true,
  },
  description:{
    type:String,
    required:true,
  },
  startDate:{
    type:Date,
    required:true,
  },
  endDate:{
    type:Date,
    required:true,
  },
  createAt:{
    type:Date,
    required:true,
  },
});

module.exports = mongoose.model('offer',offerSchema);