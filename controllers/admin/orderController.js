const admin = require("../../models/adminModel");
const multer = require("../../middleware/multer");
const Order = require('../../models/orderModel');
const Payment = require('../../models/paymentModel');
const refund = require('../../controllers/user/orderController');
const mongoose = require('mongoose');

// Order detials 
const loadOrderDetials = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const order = await Order.find({}).populate('userId orderItems.productId deliveryAddress');
    res.render('orderDetials',{admins:adminData,order:order});
  } catch (error) {
    console.log(error.message);
  }
};

// order full detials
const loadOrderFullDetials= async (req, res) => {
  try {
    const id = req.query.id;
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const order = await Order.findOne({_id:id}).populate('userId orderItems.productId');
    res.render('orderFullDetials',{admins:adminData,order:order});
  } catch (error) {
    console.log(error.message);
  }
};

// order status change
const editOrderStatus = async (req,res) => {
  try{
    const {id,select}=req.body;
    const isUserCancelled = await Order.findOne({_id:id},{isCancelled:1});

    if(!isUserCancelled.isCancelled){
      if(select==='Delivered'){
        const update = {
          orderStatus:select,
          deliveredDate:new Date,
        }
         await Payment.updateOne({orderId:id},{$set:{status:'Success'}});
        await Order.updateOne({_id:id},{$set:update});
        res.send({status:true});
      }else if(select==='Shipping'){
        const update = {
          orderStatus:select,
          shippingDate:new Date,
        }
        await Order.updateOne({_id:id},{$set:update});
        res.send({status:true});
      }else if(select==='Returned'){
        const update = {
          orderStatus:select,
          isReturned:true,
          returedDate:new Date,
        }
        await Order.updateOne({ _id: id }, { $set: update });
        await refund.incrementProductQuatity(id);
        await refund.refundToWallet(id, req.session.user._id);
        res.send({status:true});
      }else if(select==='On The Way'){
        const update = {
          orderStatus:select,
        }
        await Order.updateOne({_id:id},{$set:update});
        res.send({status:true});
      }
    }else{
      res.send({status:false})
    }
  
  }catch(error){
    console.log(error.message);
  }
};


module.exports = {
  loadOrderDetials,
  loadOrderFullDetials,
  editOrderStatus,
}