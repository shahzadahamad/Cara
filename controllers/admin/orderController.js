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
    const page = 1;
    const limit = 10;
    const startIndex = (page-1)*limit;
    const order = await Order.find().populate('userId').skip(startIndex).limit(limit).sort({orderDate:-1});
    const totalOrderCount = await Order.countDocuments();
    const hasNextPage = totalOrderCount > limit * page;
    res.render('orderDetials',{admins:adminData,order:order,hasNextPage,totalOrderCount});
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
    res.render('error')
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
          returnedDate:new Date,
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

// to get the search in order list
const getSearchData = async (req,res) => {
  try{
    const {searchValue,page}=req.query;
    let pageInt = parseInt(page);
    if(pageInt<=0){
      pageInt=1;
    }
    const limit = 10;
    const startIndex = (pageInt-1)*limit;
    const regexPattern = new RegExp(searchValue,'i');
    const orders = await Order.find({$or:[{'userId.fullname':regexPattern},{paymentMethod:regexPattern},{orderStatus:regexPattern}]}).populate('userId').skip(startIndex).limit(limit).sort({orderDate:-1});
    const allOrders = await Order.find().populate('userId').skip(startIndex).limit(limit).sort({orderDate:-1});
    const totalOrdersCount = await Order.find({$or:[{'userId.fullname':regexPattern},{paymentMethod:regexPattern},{orderStatus:regexPattern}]}).countDocuments();
    const AlltotalOrdersCount = await Order.countDocuments();
    const hasNextPage = searchValue ?  totalOrdersCount > limit * pageInt : AlltotalOrdersCount > limit * pageInt;
    res.json({order:searchValue?orders:allOrders, nextPage:hasNextPage ,page:pageInt});

  }catch(error){
    console.log(error.message);
  }
};

module.exports = {
  loadOrderDetials,
  loadOrderFullDetials,
  editOrderStatus,
  getSearchData,
}