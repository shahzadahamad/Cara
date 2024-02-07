const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.ObjectId,
    ref:'user',
  },
  orderAmount:{
    type: Number,
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
    quantity:{
      type:Number,
    }
  }],
  orderStatus:{
    type:String,
    enum:['Pending','Placed','Shipping','Delivered','Cancelled'],
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
    type:Number,
  },
  deliveredDate:{
    type:Number,
  },
  isCancelled:{
    type:Boolean,
    default:false,
  }
});

module.exports = mongoose.model("order",orderSchema);