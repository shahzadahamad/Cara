const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.ObjectId,
    ref:'user',
  },
  orderAmount:{
    type: Number,
  },
  couponApplied:{
    type: Number,
    ref:'coupon'
  },
  deliveryAddress:{
    type: Object,
    ref:'address',
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  orderItems:[{
    productId:{
      type:mongoose.Schema.ObjectId,
      ref:'product',
    },
    price:{
      type:Number,
    },
    quantity:{
      type:Number,
    }
  }],
  orderStatus:{
    type:String,
    enum:['Pending','Placed','Shipping','On The Way','Delivered','Cancelled','Returned','Return Requasted'],
  },
  cancelReason:{
    tyep:String,
  },
  orderDate:{
    type:Date,
  },
  cancelDate:{
    type:Date,
  },
  shippingDate:{
    type:Date,
  },
  deliveredDate:{
    type:Date,
  },
  isCancelled:{
    type:Boolean,
    default:false,
  },
  isReturned: {
    type: Boolean,
    default:false,
  },
  returnedRequestDate:{
    type:Date,
  },
  returnedDate:{
    type:Date,
  },
  returnedReason:{
    type:String,
  }
});

module.exports = mongoose.model("order",orderSchema);