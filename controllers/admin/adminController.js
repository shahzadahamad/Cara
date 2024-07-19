const admin = require("../../models/adminModel");
const multer = require("../../middleware/multer");
const user = require("../../models/userModel");
const product = require("../../models/productsModel");
const category = require("../../models/categoryModel");
const Order = require('../../models/orderModel');
const Payment = require('../../models/paymentModel');
const refund = require('../../controllers/user/orderController');
const bcrypt = require("bcryptjs");
const fs = require('fs')
const path = require('path')
const imagePath = path.join(__dirname,'../../public/images/productImages/');
const mongoose = require('mongoose');

// hashPassword
const securePassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.log(error.message);
  }
};

// loadLogin
const loadLogin = (req, res) => {
  try {
    if (req.session.passErr) {
      req.session.passErr = false;
      res.render("login", { message: "Invalied Password" });
    } else if (req.session.err) {
      req.session.err = false;
      res.render("login", { message: "Invalied Username" });
    } else {
      res.render("login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loading admin profile
const loadProfile = async (req,res) => {
  try{
    const adminData = await admin.findById({ _id: req.session.admin_id });
    res.render('profile',{admins:adminData})
  }catch(error){
    console.log(error.message);
  }
};

// editing admin profile
const editprofile = async (req,res) => {
  try{
    const {username,password,filename}=req.query;
    const file = req.file;
    if(!username){
      return res.json({msg:'username required'});
    }
    if(password){
      if(password.length<8){
        return res.json({msg:'password length should be 8 or more'});
      }
    }
    if(file){
      fs.unlink(imagePath+filename,(err)=>{
        if(err){
          console.log(err.message);
        }
      })
    };
    const data = await admin.findOne({_id: req.session.admin_id});
    if(password){
      const spassword = await securePassword(password);
      await admin.updateOne({_id: req.session.admin_id},{$set:{username:username,password:spassword,profile: file ? file.filename : filename}});
      res.json({status:true})
    }else{
      await admin.updateOne({_id: req.session.admin_id},{$set:{username:username,profile: file ? file.filename : filename}});
      res.json({status:true})
    }
  }catch(error){
    console.log(error.message);
  }
}

// verifyLogin
const verifyLogin = async (req, res) => {
  try {
    const username = req.body.username.trim();
    const password = req.body.password;

    const adminData = await admin.findOne({ username: username });

    if (adminData) {
      const isPasswordMatch = await bcrypt.compare(
        password,
        adminData.password
      );
      if (isPasswordMatch) {
        req.session.admin_id = adminData._id;
        res.redirect("/admin/dashboard");
      } else {
        req.session.passErr = true;
        res.redirect("/admin");
      }
    } else {
      req.session.err = true;
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// adminLogout
const adminLogout = async (req, res) => {
  try {
    delete req.session.admin_id;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  adminLogout,
  loadProfile,
  editprofile,
};
