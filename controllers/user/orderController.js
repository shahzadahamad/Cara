const mongoose = require("mongoose");
const Order = require("../../models/orderModel");
const Product = require("../../models/productsModel");
const Wallet = require("../../models/walletModel");
const Category = require("../../models/categoryModel");
const Offer = require("../../models/offerModel");
const moment = require("moment");
const Coupon = require("../../models/couponModel");
const checkout = require("../../controllers/user/checkoutController");
const easyinvoice = require("easyinvoice");
const fs = require("fs");

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

// decrement product quantity repayment
const decrementProductQuatity = async (id) => {
  try {
    const orderPro = await Order.findOne(
      { _id: id },
      { orderItems: 1 }
    ).populate("orderItems.productId");
    orderPro.orderItems.forEach(async (x) => {
      const productQuantity = await Product.findOne({ _id: x.productId });
      const store = productQuantity.quantity - x.quantity;
      await Product.updateOne(
        { _id: x.productId._id },
        { $set: { quantity: store } }
      );
    });

    let totalPrice = 0;
    const currentDate = new Date();
    for (const product of orderPro.orderItems) {
      const productDetails = await Product.findById(product.productId);
      let maxDiscount = 0;

      if (productDetails.offer) {
        const productOffer = await Offer.findById(productDetails.offer);
        if (productOffer.discountPercentage > maxDiscount) {
          const offerStartDate = new Date(productOffer.startDate);
          const offerEndDate = new Date(productOffer.endDate);

          offerStartDate.setHours(0, 0, 0, 0);
          offerEndDate.setHours(23, 59, 59, 999);

          if (currentDate >= offerStartDate && currentDate <= offerEndDate) {
            maxDiscount = productOffer.discountPercentage;
          }
        }
      }

      if (productDetails.categoryId) {
        const category = await Category.findById(productDetails.categoryId);
        if (category.offer) {
          const categoryOffer = await Offer.findById(category.offer);
          if (categoryOffer.discountPercentage > maxDiscount) {
            const offerStartDate = new Date(categoryOffer.startDate);
            const offerEndDate = new Date(categoryOffer.endDate);

            offerStartDate.setHours(0, 0, 0, 0);
            offerEndDate.setHours(23, 59, 59, 999);

            if (currentDate >= offerStartDate && currentDate <= offerEndDate) {
              maxDiscount = categoryOffer.discountPercentage;
            }
          }
        }
      }

      let productPrice = productDetails.price;

      if (maxDiscount > 0) {
        productPrice -= Math.round((productPrice * maxDiscount) / 100);
      }

      totalPrice += productPrice * product.quantity;

      let productPriceFinal = productPrice;

      const price = productPriceFinal;

      await Order.updateOne(
        { _id: id, "orderItems._id": product._id },
        { $set: { "orderItems.$.price": price } }
      );
    }

    const orderProducts = await Order.findOne(
      { _id: id },
      { orderItems: 1 }
    ).populate("orderItems.productId");
    return { orderProducts, totalPrice };
  } catch (error) {
    console.log(error.message);
  }
};

// invoice
const invoice = async (req, res) => {
  try {
    const { order } = req.query;
    const orderId = await Order.findOne({ _id: order }).populate(
      "userId orderItems.productId"
    );
    res.render("invoice", { order: orderId });
  } catch (error) {
    console.log(error.message);
  }
};

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
            reason: "Refund",
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
    if (order.deliveredDate) {
      const expiredDate = moment().subtract(7, "days").toDate();
      if (expiredDate < orderData.deliveredDate) {
        return res.render("orderFullDetials", {
          user: req.session.user,
          order: order,
          status: true,
        });
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
    const { id, type, method } = req.query;

    const message = req.flash("message");

    const _id = await Order.findOne({ _id: id }, { _id: 1 });

    res.render("orderCancel", {
      user: req.session.user,
      id: _id.id,
      message,
      type: type,
      method: method,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// verify cancel page
const verifyCancelPage = async (req, res) => {
  try {
    const { id, type, method } = req.query;
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
      if (method !== "COD") {
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

const verifyRepayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const orders = await Order.findOne({ _id: orderId });
    let totalPrice=0;
    const currentDate = new Date();
    for (const product of orders.orderItems) {
      const productDetails = await Product.findById(product.productId);
      let maxDiscount = 0;

      if (productDetails.offer) {
        const productOffer = await Offer.findById(productDetails.offer);
        if (productOffer.discountPercentage > maxDiscount) {
          const offerStartDate = new Date(productOffer.startDate);
          const offerEndDate = new Date(productOffer.endDate);

          offerStartDate.setHours(0, 0, 0, 0);
          offerEndDate.setHours(23, 59, 59, 999);

          if (currentDate >= offerStartDate && currentDate <= offerEndDate) {
            maxDiscount = productOffer.discountPercentage;
          }
        }
      }

      if (productDetails.categoryId) {
        const category = await Category.findById(productDetails.categoryId);
        if (category.offer) {
          const categoryOffer = await Offer.findById(category.offer);
          if (categoryOffer.discountPercentage > maxDiscount) {
            const offerStartDate = new Date(categoryOffer.startDate);
            const offerEndDate = new Date(categoryOffer.endDate);

            offerStartDate.setHours(0, 0, 0, 0);
            offerEndDate.setHours(23, 59, 59, 999);

            if (currentDate >= offerStartDate && currentDate <= offerEndDate) {
              maxDiscount = categoryOffer.discountPercentage;
            }
          }
        }
      }

      let productPrice = productDetails.price;

      if (maxDiscount > 0) {
        productPrice -= Math.round((productPrice * maxDiscount) / 100);
      }


      totalPrice += productPrice * product.quantity;
    }
    const totalAmount = totalPrice < 500 ? totalPrice + 40  : totalPrice;
    const totalFinal = orders.couponApplied ? totalAmount-orders.couponApplied : totalAmount;
    const razorpayInstance = await checkout.razorpay();
    const options = {
      amount: totalFinal * 100,
      currency: "INR",
    };
    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          key: razorpayInstance.key_id,
          orderId: order.id,
          amount: totalFinal * 100,
          cusName: req.session.user.fullname,
          cusEmail: req.session.user.email,
          cusContact: req.session.user.mobile,
        });
      } else {
        res.status(400).send({ msg: "Something went wrong!" });
        console.log(err);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const repeymentSuccess = async (req, res) => {
  try {
    const { transactionId, orderId } = req.body;
    const orders = await Order.findOne({ _id: orderId });
    const orderPro = await decrementProductQuatity(orderId);
    await checkout.paymentDetials(
      transactionId,
      orders.userId,
      orders._id,
      orders.orderAmount,
      orders.paymentMethod
    );
    if (orders.couponId) {
      await Coupon.updateOne(
        { _id: orders.couponId },
        { $inc: { quantity: -1 } }
      );
    }

    const amount = orderPro.totalPrice<500 ? orderPro.totalPrice+40: orderPro.totalPrice;
    const finalAmount = orders.couponApplied? amount - orders.couponApplied : amount;
     
    await Order.updateOne(
      { _id: orderId },
      {
        orderStatus: "Pending",
        orderItems: orderPro.orderProducts.orderItems,
        orderAmount: finalAmount,
      }
    );
    res.json({ status: true });
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
  invoice,
  verifyRepayment,
  repeymentSuccess,
};
