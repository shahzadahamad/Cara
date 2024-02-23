const mongoose = require('mongoose');

const refferalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  history: [{
    name:{
      type:String,
      required:true,
    },
    amount:{
      type:Number,
      required:true,
    },
    referDate:{
      type:Date,
      required:true,
    }
  }]
});

module.exports = mongoose.model("refferal",refferalSchema);
