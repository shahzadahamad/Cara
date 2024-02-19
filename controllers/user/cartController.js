const { default: mongoose } = require("mongoose");
const cart = require("../../models/cartModel");
const Address = require("../../models/addressModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productsModel");
const Coupon = require("../../models/couponModel");
const moment = require("moment");

// totalCart price
const totalCartPrice = async (id, req, res) => {
  try {
    const totalCart = await cart.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "total",
        },
      },
      {
        $unwind: "$total",
      },
      {
        $project: {
          "products.quantity": 1,
          "total.price": 1,
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ["$products.quantity", "$total.price"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    return totalCart;
  } catch (error) {
    console.log(error.message);
  }
};

// loadCart
const loadCart = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    const message = req.flash("message");
    const products = await cart
      .findOne({ userId: req.session.user._id })
      .populate("products.productId");
    if (products) {
      const totalCart = await totalCartPrice(req.session.user._id);
      res.render("cart", {
        login: req.session.user,
        product: products.products,
        total: totalCart[0].total,
        message,
        coupons,
      });
    } else {
      res.render("cart", { login: req.session.user, message });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifyCart
const verifyAddToCart = async (req, res) => {
  try {
    if (req.session.user) {
      const id = req.query.id;
      const productQ = await Product.findOne(
        { _id: id },
        { quantity: 1, _id: 0 }
      );

      const existingProduct = await cart.findOne({
        userId: req.session.user._id,
        products: { $elemMatch: { productId: id } },
      });

      if (existingProduct) {
        if (productQ.quantity === 0) {
          await cart.updateOne(
            { userId: req.session.user._id, "products.productId": id },
            { $set: { "products.$.quantity": productQ.quantity } }
          );
        } else {
          await cart.updateOne(
            { userId: req.session.user._id, "products.productId": id },
            { $inc: { "products.$.quantity": 1 } }
          );
        }
        res.send({ status: "received" });
      } else {
        if (productQ.quantity === 0) {
          await cart.updateOne(
            { userId: req.session.user._id },
            {
              $addToSet: {
                products: { productId: id, quantity: productQ.quantity },
              },
            },
            { upsert: true }
          );
        } else {
          await cart.updateOne(
            { userId: req.session.user._id },
            { $addToSet: { products: { productId: id, quantity: 1 } } },
            { upsert: true }
          );
        }
        res.send({ status: "received" });
      }
    } else {
      res.send({ status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Remove cart products
const verifyRemoveCart = async (req, res) => {
  try {
    const id = req.query.id;
    const removeProduct = await cart.updateOne(
      { userId: req.session.user._id },
      { $pull: { products: { _id: id } } }
    );
    const cartDelete = await cart.deleteOne({
      userId: req.session.user._id,
      products: { $eq: [] },
    });
    const totalCart = await totalCartPrice(req.session.user._id);
    if (removeProduct) {
      res.send({ totalCart, cartDelete });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// cart products detials
const verifyCartDetials = async (req, res) => {
  try {
    const id = req.query.id;
    const quantity = req.query.quantity;

    const productQ = await Product.findOne(
      { _id: id },
      { quantity: 1, _id: 0 }
    );

    if (quantity > productQ.quantity) {
      await cart.updateOne(
        { userId: req.session.user._id, "products.productId": id },
        { $set: { "products.$.quantity": productQ.quantity } }
      );
    } else {
      const quantityUpdate = await cart.updateOne(
        { userId: req.session.user._id, "products.productId": id },
        { $set: { "products.$.quantity": parseInt(quantity) } }
      );
    }

    const totalCart = await totalCartPrice(req.session.user._id);
    if (totalCart) {
      res.send({ totalCart });
    } else {
      res.send({ status: "feild" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    if(req.session.coupon){
      return res.json({msg1:'Coupon Already Applied'})
    }
    const coupon = await Coupon.findOne({ couponCode: couponCode });
    if (coupon) {
      req.session.coupon = coupon;
    }
    if(coupon.quantity<=0){
      return res.json({msg:'Coupon limited'})
    }
    const appliedCoupon = await Coupon.findOne({ couponCode: couponCode });
    if (!couponCode) {
      return res.json({ msg: "Add Coupon Code" });
    }
    if (!appliedCoupon) {
      return res.json({ msg: "Invalied Coupon Code" });
    } else {
      const total = await totalCartPrice(req.session.user._id);
      return res.json({ status: appliedCoupon.discountAmount, total: total});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const clearCoupon = async (req, res) => {
  try {
    delete req.session.coupon;
    res.json({ status: "success" });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCart,
  verifyAddToCart,
  verifyRemoveCart,
  verifyCartDetials,
  totalCartPrice,
  verifyCoupon,
  clearCoupon,
};
