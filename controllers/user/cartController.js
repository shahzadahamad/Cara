const { default: mongoose } = require("mongoose");
const cart = require("../../models/cartModel");
const Address = require('../../models/addressModel');
const Order = require('../../models/orderModel');

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
    const products = await cart
      .findOne({ userId: req.session.user._id })
      .populate("products.productId");
    if (products) {
      const totalCart = await totalCartPrice(req.session.user._id);
      res.render("cart", {
        login: req.session.user,
        product: products.products,
        total: totalCart[0].total,
      });
    } else {
      res.render("cart", { login: req.session.user });
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
      const existingProduct = await cart.findOne({
        userId: req.session.user._id,
        products: { $elemMatch: { productId: id } },
      });
      if (existingProduct) {
        await cart.updateOne(
          { userId: req.session.user._id, "products.productId": id },
          { $inc: { "products.$.quantity": 1 } }
        );
        res.send({ status: "received" });
      } else {
        await cart.updateOne(
          { userId: req.session.user._id },
          { $addToSet: { products: { productId: id, quantity: 1 } } },
          { upsert: true }
        );
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
    const totalCart = await totalCartPrice(req.session.user._id);
    const removeProduct = await cart.updateOne(
      { userId: req.session.user._id },
      { $pull: { products: { _id: id } } }
    );
    const cartDelete = await cart.deleteOne({
      userId: req.session.user._id,
      products: { $eq: [] },
    });
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
    const quantityUpdate = await cart.updateOne(
      { userId: req.session.user._id, "products.productId": id },
      { $set: { "products.$.quantity": parseInt(quantity) } }
    );
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

// checkout
const loadCheckout = async (req,res) => {
  try{
    const address = await Address.findOne({userId:req.session.user._id});
    const products = await cart
    .findOne({ userId: req.session.user._id })
    .populate("products.productId");
    const totalCart = await totalCartPrice(req.session.user._id);

   const message = req.flash('message');
    res.render('checkout',{user:req.session.user,address:address,product:products,total:totalCart[0].total,message});
  }catch(error){
    console.log(error.message);
  }
};

// verifly checkout
const verifyCheckout = async (req,res) => {
  try{
    const {selectedPaymentMethod,selectedAddress}= req.body;
   const address = await Address.findOne({userId:req.session.user._id},{address:{$elemMatch:{_id:selectedAddress}}});
   const totalCart = await totalCartPrice(req.session.user._id);
   const cartPro = await cart.findOne({userId:req.session.user._id},{products:1});

   if(!selectedAddress && !selectedPaymentMethod ){
    req.flash('message','please select address and payment method');
    return res.redirect('/checkout')
   }

   if(!selectedAddress){
    req.flash('message','please select address');
    return res.redirect('/checkout');
   }

   if(!selectedPaymentMethod){
    req.flash('message','please select payment method');
    return res.redirect('/checkout');
   }
    
    const order = new Order({
      userId:req.session.user._id,
      orderAmount:totalCart[0].total <500 ? totalCart[0].total+40 : totalCart[0].total,
      deliveryAddress: address.address[0],
      paymentMethod: selectedPaymentMethod,
      orderItems:cartPro.products,
      orderStatus:selectedPaymentMethod === 'COD' ? 'Placed':'Pending',
      orderDate: new Date,
    });

    await order.save();

    await cart.deleteOne({userId:req.session.user._id});

    res.redirect('/order-confirm');

  }catch(error){
    console.log(error.message);
  }
};

// loadOrder page
const loadOrder = async (req,res)=>{
  try{
    res.render('order',{user:req.session.user});
  }catch(error){
    console.log(error.message);
  }
};

module.exports = {
  loadCart,
  verifyAddToCart,
  verifyRemoveCart,
  verifyCartDetials,
  loadCheckout,
  loadCheckout,
  loadOrder,
  verifyCheckout,
}