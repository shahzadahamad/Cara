const admin = require("../models/adminModel");
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
    res.render('login');
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
        req.session.admin=adminData._id;
        res.redirect('/admin/dashboard');
      }
    }

  }catch(error){
    console.log(error.message);
  }
};

// loadDashboard
const loadDashboard = (req,res) => {
  try{
    res.render('dashboard');
  }catch(error){
    console.log(error.message);
  }
};

// loadUserDetials
const loadUserDetials = (req,res) => {
  try{
    res.render('user-detials');
  }catch(error){
    console.log(error.message);
  }
};


module.exports = {
  loadPage,
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadUserDetials,
}