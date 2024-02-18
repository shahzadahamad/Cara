const admin = require("../../models/adminModel");
const multer = require("../../middleware/multer");
const user = require("../../models/userModel");
const product = require("../../models/productsModel");
const category = require("../../models/categoryModel");
const Order = require('../../models/orderModel');
const Payment = require('../../models/paymentModel');
const refund = require('../../controllers/user/orderController');
const bcrypt = require("bcrypt");
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

// verifyLogin
const verifyLogin = async (req, res) => {
  try {
    const username = req.body.username;
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
};
