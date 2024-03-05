const mongoose = require("mongoose");
const Order = require("../../models/orderModel");
const Product = require("../../models/productsModel");
const Wallet = require("../../models/walletModel");
const moment = require('moment');
const easyinvoice = require('easyinvoice');
const fs = require('fs');

// increment the cancelled order data in products
const incrementProductQuatity = async (id) => {
  try {
    const orderPro = await Order.findOne(
      { _id: id },
      { orderItems: 1 }
    ).populate("orderItems.productId");

    orderPro.orderItems.forEach(async (x) => {
      const productQuantity = await Product.findOne({ _id: x.productId });
      const store = productQuantity.quantity + x.quantity;
      await Product.updateOne(
        { _id: x.productId._id },
        { $set: { quantity: store } }
      );
    });
  } catch (error) {
    console.log(error.message);
  }
};

const invoice = async (req,res) => {
  try{
    const {order}=req.query;
    const orderId = await Order.findOne({_id:order}).populate('userId orderItems.productId')
    console.log(orderId)
    res.render('invoice',{order:orderId});
  }catch(error){
    console.log(error.message)
  }
}

// refunding to the wallet
const refundToWallet = async (id, userId) => {
  try {
    const order = await Order.findOne({ _id: id });
    const wallet = await Wallet.findOneAndUpdate(
      { userId: userId },
      {
        $inc: { totalAmount: order.orderAmount },
        $push: {
          transactions: {
            type: "Credit",
            amount: order.orderAmount,
            reason: 'Refund',
            transactionDate: new Date(),
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

// Order detials
const loadOrder = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.user._id })
      .populate("userId orderItems.productId")
      .sort({ orderDate: -1 });

    res.render("orderDetials", { user: req.session.user, order: orders });
  } catch (error) {
    console.log(error.message);
  }
};

// Order full Detials
const loadOrderDetials = async (req, res) => {
  try {
    const id = req.query.id;
    const order = await Order.find({ _id: id }).populate(
      "userId orderItems.productId"
    );
    if(order.deliveredDate){
      const expiredDate = moment().subtract(7,'days').toDate();
      if(expiredDate<orderData.deliveredDate){
       return res.render("orderFullDetials",{user:req.session.user, order:order,status:true});
      }
    }
    res.render("orderFullDetials", { user: req.session.user, order: order });
  } catch (error) {
    console.log(error.message);
  }
};

// cancel page
const loadCancelPage = async (req, res) => {
  try {
    const { id, type,method } = req.query;

    const message = req.flash("message");

    const _id = await Order.findOne({ _id: id }, { _id: 1});

    res.render("orderCancel", {
      user: req.session.user,
      id: _id.id,
      message,
      type: type,
      method:method,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// verify cancel page
const verifyCancelPage = async (req, res) => {
  try {
    const { id, type ,method} = req.query;
    const { reason } = req.body;

    if (!reason) {
      req.flash("message", "Please give a reason");
      return res.redirect(`/cancel-order?id=${id}`);
    }


    if (type === "cancel") {
      const update = {
        orderStatus: "Cancelled",
        cancelReason: reason,
        cancelDate: new Date(),
        isCancelled: true,
      };
      await Order.updateOne({ _id: id }, { $set: update });
      await incrementProductQuatity(id);
      if(method!=='COD'){
        await refundToWallet(id, req.session.user._id);
      }
    } else if (type === "return") {
      const update = {
        orderStatus: "Return Requasted",
        returnedReason: reason,
        returnedRequestDate: new Date(),
      };
      await Order.updateOne({ _id: id }, { $set: update });
    }

    res.redirect("/order");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadOrderDetials,
  loadOrder,
  loadCancelPage,
  verifyCancelPage,
  incrementProductQuatity,
  refundToWallet,
  invoice
};
