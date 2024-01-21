const admin = require("../models/adminModel");
const user = require('../models/userModel');
const product = require('../models/productsModel');
const bcrypt = require("bcrypt");

// hashPassword
const securePassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.log(error.message);
  }
};

// loadPage
const loadPage = (req, res) => {
  try{
    res.redirect('/admin/dashboard');
  }catch(error){
    console.log(error.message);
  }
};

// loadLogin
const loadLogin = (req, res) => {
  try{
      if(req.session.passErr){
        req.session.passErr=false;
        res.render('login',{message:"Invalied Password"});
      }else if(req.session.err){
        req.session.err=false;
        res.render('login',{message:"Invalied Username"});
      }else{
        res.render('login');
      }
  }catch(error){
    console.log(error.message);
  }
};

// verifyLogin
const verifyLogin = async (req,res) => {
  try{
    const username = req.body.username;
    const password = req.body.password;
    
    const adminData = await admin.findOne({ username:username });
  
    if(adminData){  
      const isPasswordMatch = await bcrypt.compare(password, adminData.password);
      if(isPasswordMatch){
        req.session.admin_id=adminData._id;
        res.redirect('/admin/dashboard');
      }else{
        req.session.passErr=true;
        res.redirect('/admin/login');
      }
    }else{
      req.session.err=true;
      res.redirect('/admin/login');
    }
  }catch(error){
    console.log(error.message);
  }
};

// loadDashboard
const loadDashboard = async (req,res) => {
  try{
      const adminData = await admin.findById({_id:req.session.admin_id});
      res.render('dashboard',{admins:adminData});
  }catch(error){
    console.log(error.message);
  }
};

// loadUserDetials
const loadUserDetials = async (req,res) => {
  try{
    const adminData = await admin.findById({_id:req.session.admin_id});
    const userData = await user.find({});
    res.render('userDetials',{users:userData,admins:adminData});
  }catch(error){
    console.log(error.message);
  }
};

// loadEditUser
const loadEditUser = async (req,res) => {
  try{
    const adminData = await admin.findById({_id:req.session.admin_id});
    const id = req.query.id;
    const userData = await user.findById({_id:id});
    res.render('editUser',{admins:adminData,user:userData});
  }catch(error){
    console.log(error.message);
  }
};

// loadProducts
const loadProducts = async (req,res) => {
  try{
    const adminData = await admin.findById({_id:req.session.admin_id});
    const products = await product.find();
    res.render('products',{admins:adminData,product:products});
  }catch(error){
    console.log(error.message);
  }
};

// loadAddProducts
const loadAddProducts = async (req,res) => {
  try{
    const adminData = await admin.findById({_id:req.session.admin_id});
    if(req.session.addProduct){
      req.session.addProduct=false;
      res.render('addProducts',{admins:adminData,message:"Product Added"});
    }else{
      res.render('addProducts',{admins:adminData});
    }
  }catch(error){
    console.log(error.message);
  }
};

// verifyAddProducts
const verifyAddProducts = async (req,res) => {
  try{
    const addProduct = new product({
      name: req.body.name,
      brand: req.body.brand,
      category: req.body.category,
      rating: req.body.rating,
      price: req.body.price,
      quantity: req.body.quantity,
      image: req.file.filename,
    });

    await product.insertMany(addProduct);

    req.session.addProduct=true;
    res.redirect('/admin/add-products');
  }catch(error){
    console.log(error.message);
  }
}


module.exports = {
  loadPage,
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadUserDetials,
  loadEditUser,
  loadProducts,
  loadAddProducts,
  verifyAddProducts,
}