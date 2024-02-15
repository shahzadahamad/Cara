const { default: mongoose } = require("mongoose");
const cart = require("../../models/cartModel");
const Address = require("../../models/addressModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productsModel");
const Razorpay = require("razorpay");
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

// decremting the product quantity
const decrementProductQuatity = async (id) => {
  try {

    const cartPro = await cart
      .findOne({ userId: id }, { products: 1 })
      .populate("products.productId");

    cartPro.products.forEach(async (x) => {
      const productQuantity = await Product.findOne({ _id: x.productId });
      const store = productQuantity.quantity - x.quantity;
      await Product.updateOne(
        { _id: x.productId._id },
        { $set: { quantity: store } }
      );
    });

    return cartPro;
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
      .populate("products.productId");
    if (products) {
      const totalCart = await totalCartPrice(req.session.user._id);
      res.render("cart", {
        login: req.session.user,
        product: products.products,
        total: totalCart[0].total,
        message,
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

// checkout
const loadCheckout = async (req, res) => {
  try {
    const address = await Address.findOne({ userId: req.session.user._id });
    const products = await cart
      .findOne({ userId: req.session.user._id })
      .populate("products.productId");
    const totalCart = await totalCartPrice(req.session.user._id);

    const message = req.flash("message");
    res.render("checkout", {
      user: req.session.user,
      address: address,
      product: products,
      total: totalCart[0].total,
      message,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// verify Razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const amount = await totalCartPrice(req.session.user._id);
    const shipping = amount[0].total < 500 ? amount[0].total+40 : amount[0].total;
    const totalAmount = Number(shipping)*100
    const { key_id, key_secret } = process.env;
    const razorpayInstance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });
    const options = {
      amount: totalAmount,
      currency: "INR",
    };
    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          key: key_id,
          orderId: order.id,
          amount: totalAmount,
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

// razrpay success req
const razorpaySuccess = async (req,res) => {   
  try{

    const {id}= req.body;


    const address = await Address.findOne(
      { userId: req.session.user._id },
      { address: { $elemMatch: { _id: id } } }
    );

    const cartPro = await decrementProductQuatity(req.session.user._id);
    const totalCart = await totalCartPrice(req.session.user._id);

    const order = new Order({
      userId: req.session.user._id,
      orderAmount:
        totalCart[0].total < 500
          ? totalCart[0].total + 40
          : totalCart[0].total,
      deliveryAddress: address.address[0],
      paymentMethod: 'Online',
      orderItems: cartPro.products,
      orderStatus: 'Pending',
      orderDate: moment().toDate(),
    });

    await order.save();

    await cart.deleteOne({ userId: req.session.user._id });
    res.send({status:true});
  
    
  }catch(error){
    console.log(error.message);
  }
};

// verifly checkout
const verifyCheckout = async (req, res) => {
  try {
    const { selectedPaymentMethod, selectedAddress } = req.body;

    if (!selectedAddress) {
      req.flash("message", "please select address");
      return res.redirect("/checkout");
    }

    if (!selectedPaymentMethod) {
      req.flash("message", "please select payment method");
      return res.redirect("/checkout");
    }

    const address = await Address.findOne(
      { userId: req.session.user._id },
      { address: { $elemMatch: { _id: selectedAddress } } }
    );


    // decrementing the product quantity
    const cartPro = await decrementProductQuatity(req.session.user._id);

    const totalCart = await totalCartPrice(req.session.user._id);

    if (selectedPaymentMethod === "COD") {
      const order = new Order({
        userId: req.session.user._id,
        orderAmount:
          totalCart[0].total < 500
            ? totalCart[0].total + 40
            : totalCart[0].total,
        deliveryAddress: address.address[0],
        paymentMethod: selectedPaymentMethod,
        orderItems: cartPro.products,
        orderStatus: selectedPaymentMethod === "COD" ? "Placed" : "Pending",
        orderDate: moment().toDate(),
      });

      await order.save();

      await cart.deleteOne({ userId: req.session.user._id });
      res.redirect("/order-confirm");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadOrder page
const loadOrder = async (req, res) => {
  try {
    res.render("order", { user: req.session.user });
  } catch (error) {
    console.log(error.message);
  }
};

// verify cart checkout
const verifyCartCheckout = async (req, res) => {
  try {
    res.redirect("/checkout");
  } catch (error) {
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
  verifyCartCheckout,
  verifyRazorpay,
  razorpaySuccess,
};
