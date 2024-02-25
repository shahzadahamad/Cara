const user = require("../../models/userModel");
const userOTPVerification = require("../../models/userOTPVerificationModel");
const product = require("../../models/productsModel");
const category = require("../../models/categoryModel");
const Referral = require('../../models/refferalModel')
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
const { render, name } = require("ejs");
const { default: mongoose } = require("mongoose");
const { CategoryScale } = require("chart.js");

// loadHome
const loadPage = (req, res) => {
  try {
    res.redirect("/home");
  } catch (error) {
    console.log(error.message);
  }
};

// loadHome
const loadHome = async (req, res) => {
  try {
    const productData = await product.find().limit(8).populate('offer')
    const latestProducts = await product.find().sort({ _id: -1 }).limit(8).populate('offer');
    res.render("home", {
      login: req.session.user,
      product: productData,
      latestProducts: latestProducts,
      data: new Date(),
    });
  } catch (error) {
    console.log(error.message);
  }
};

// searchFillting
const searchFillter = async (name, brand) => {
  try {
    if (name) {
      const fillteredProducts = await product.find({ name: name }).populate('offer');
      return fillteredProducts;
    } else if (brand) {
      const fillteredProducts = await product.find({ brand: brand }).populate('offer');
      return fillteredProducts;
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadShop
const loadShop = async (req, res) => {
  try {
    const categorys = await category.find();
    const { id, nameSearch, brandSearch , results ,value } = req.query;

    if(results){
      const decodedProducts = JSON.parse(decodeURIComponent(Buffer.from(results, 'base64').toString('utf-8')));
      return res.render('shop',{
        login: req.session.user,
        product: decodedProducts,
        category: categorys,
        selectedSearch: value,
        date:new Date()
      })
    }

    if (nameSearch || brandSearch) {
      const filltered = await searchFillter(nameSearch, brandSearch);
      return res.render("shop",{
        login: req.session.user,
        product: filltered,
        category: categorys,
        selectedSearch: nameSearch ? nameSearch : brandSearch,
        date:new Date(),
      });
    }

    if (id && id !== "allCategory") {
      const selectedCategory = await product
        .find({ categoryId: id })
        .populate("categoryId offer");
      return res.render("shop", {
        login: req.session.user,
        product: selectedCategory,
        category: categorys,
        date:new Date(),
      });
    } else {
      const productData = await product.find().populate('offer');
      return res.render("shop", {
        login: req.session.user,
        product: productData,
        category: categorys,
        id: id,
        date:new Date(),
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// shop search verify
const verifyShopSearch = async (req, res) => {
  try {
    const {value}=req.body;

    const regex = new RegExp(value, 'i');
    const products = await product.find({ $or: [{ name: regex }, { brand: regex }] },{description:0}).populate('offer')
    const encodedProducts = Buffer.from(JSON.stringify(products)).toString('base64');

    res.redirect(`/shop?value=${value}&results=${encodeURIComponent(encodedProducts)}`);
   
  } catch (error) {
    console.log(error.message);
  }
};

// search
const loadSearch = async (req, res) => {
  try {
    const { data } = req.query;

    const products = await product.find({
      $or: [
        { name: { $regex: data, $options: "i" } },
        { brand: { $regex: data, $options: "i" } },
      ],
    });



    res.send({ products });
  } catch (error) {
    console.log(error.message);
  }
};

// loadAbout
const loadAbout = (req, res) => {
  try {
    res.render("about", { login: req.session.user });
  } catch (error) {
    console.log(error.message);
  }
};

// loadSingleProduct
const loadSingleProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const sproduct = await product.findById({ _id: id });
    const relatedProduct = await product.find({
      categoryId: sproduct.categoryId,
      brand: sproduct.brand,
    });
    res.render("sproduct", {
      login: req.session.user,
      sproduct: sproduct,
      related: relatedProduct,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// loadProfile
const loadProfile = async (req, res) => {
  try {
    const userData = await user.findOne({ _id: req.session.user._id });
    const message = req.flash("message");
    res.render("profile", { user: userData, message });
  } catch (error) {
    console.log(error.message);
  }
};

// Edit user
const loadEditUser = async (req, res) => {
  try {
    const userData = await user.findOne({ _id: req.session.user._id });
    res.render("edit-user", { user: userData });
  } catch (error) {
    console.log(error.message);
  }
};

// verify edituser page
const verifyEditUser = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    const update = {
      fullname: name,
      email: email,
      mobile: mobile,
    };
    const updateUser = await user.updateOne(
      { _id: req.session.user._id },
      { $set: update }
    );

    req.flash("message", "Profile edited");
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};

const loadRefer = async (req,res) => {
  try{
    const refferal = await Referral.findOne({userId:req.session.user._id});
    const userData = await user.findOne({ _id: req.session.user._id });
    res.render('refer',{user:userData,refferal:refferal})
  }catch(error){
    console.log(error.message);
  }
};

const verifyRefferal = async (req,res) => {
  try{
    const {ref}=req.query;
    if(ref){
      res.redirect(`/signup?ref=${ref}`)
    }else{
      res.redirect('/home');
    }
  }catch(error){
    console.log(error.message);
  }
}

module.exports = {
  loadPage,
  loadHome,
  loadShop,
  loadAbout,
  loadSingleProduct,
  loadProfile,
  loadEditUser,
  verifyEditUser,
  loadSearch,
  verifyShopSearch,
  loadRefer,
  verifyRefferal,
};
