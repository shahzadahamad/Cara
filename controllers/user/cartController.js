const { default: mongoose } = require("mongoose");
const cart = require("../../models/cartModel");
const Address = require("../../models/addressModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productsModel");
const Category = require("../../models/categoryModel");
const Coupon = require("../../models/couponModel");
const Offer = require("../../models/offerModel");
const moment = require("moment");

// totalCart price
const totalCartPrice = async (id, req, res) => {
  try {

    const cartPro = await cart.findOne({ userId: id });
    const currentDate = new Date();
    
    let total = 0;
    
    if(cartPro){
      for (const product of cartPro.products) {
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

       let productPriceFinal = productPrice * product.quantity;

    
        total += productPriceFinal;
    }
    }
   
    return [{ total: total }];
  } catch (error) {
    console.log(error.message);
  }
};

// loadCart
const loadCart = async (req, res) => {
  try {
    const message = req.flash("message");
    const products = await cart
      .findOne({ userId: req.session.user._id })
      .populate({
        path: "products.productId",
        populate: {
          path: "offer",
        },
      })
      .populate({
        path: "products.productId",
        populate: {
          path: "categoryId",
          populate: {
            path: "offer",
          },
        },
      });
    if (products) {
      const totalCart = await totalCartPrice(req.session.user._id);
      res.render("cart", {
        login: req.session.user,
        product: products.products,
        total: totalCart[0].total,
        message,
        data: new Date(),
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

module.exports = {
  loadCart,
  verifyAddToCart,
  verifyRemoveCart,
  verifyCartDetials,
  totalCartPrice,
};
