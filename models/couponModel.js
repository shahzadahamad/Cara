const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponCode:{
    type:String,
    required:true
  },
  discountAmount : {
    type:Number,
    required:true
  },
  description:{
    type:String,
    required:true,
  },
  quantity:{
    type:Number,
    required:true,
  },
  createDate:{
    type:Date,
    default:new Date()
  },
  expireDate:{
    type:Date,
    required:true
  }
});

module.exports = mongoose.model('coupon',couponSchema);