const user = require("../models/userModel");
const bcrypt = require("bcrypt");
const express = require("express");
const nodeMailer = require("nodemailer");

// hashPassword
const securePassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.log(error.message);
  }
};

// nodeMailer
const sendOtpVerifyMail = async (name, email, otp) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOption = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP verification for Cara Online Shopping site",
      html: `<h2>Hello ${name}.This is your OTP verification code ${otp}.This verification is for signing up in Cara Online Shopping site.</h2>`,
    };
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("email has been sent:-" + info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

// generateVerificationCode
const generateVerificationCode = () => {
  const verificationCode = Math.floor(1000 + Math.random() * 9999);
  return verificationCode;
};

// loadHome
const loadPage = (req, res) => {
  try {
    res.redirect('/home');
  } catch (error) {
    console.log(error.message);
  }
};

// loadLogin
const loadLogin = (req, res) => {
  try {
    if (req.session.passError) {
      req.session.passError = false;
      res.render("login", { message: "Invalied Password" });
    } else if (req.session.block) {
      req.session.block = false;
      res.render("login", { message: "Your accout as been blocked" });
    } else if (req.session.notFound) {
      req.session.notFound = false;
      res.render("login", {
        message: "You are not registered with us. Please sign up.",
      });
    } else if (req.session.PassReset) {
      req.session.PassReset=false;
      res.render('login',{message1:'Password Reset Successfully'});
    }else{
      res.render("login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifyLogin
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await user.findOne({ email: email });

    if (userData) {
      const isPasswordMatch = await bcrypt.compare(password, userData.password);
      if (isPasswordMatch) {
        if (userData.isBlocked) {
          req.session.block = true;
          res.redirect("/login");
        } else {
          req.session.user = userData._id;
          res.redirect("/");
        }
      } else {
        req.session.passError = true;
        res.redirect("/login");
      }
    } else {
      req.session.notFound = true;
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.messages);
  }
};

// loadSignUp
const loadSignup = (req, res) => {
  try {
    if (req.session.existingUser) {
      req.session.existingUser = false;
      res.render("signup", {
        message: "You are already registered. Please log in.",
      });
    } else if (req.session.cPassError) {
      req.session.cPassError = false;
      res.render("signup", { message: "Passwords are not same" });
    } else {
      res.render("signup");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifySignUp
const verifySignUp = async (req, res) => {
  try {
    const addUser = {
      fullname: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
      createdDate: new Date(),
      isBlocked: false,
    };

    const existingUser = await user.findOne({ email: addUser.email });

    if (existingUser) {
      req.session.existingUser = true;
      res.redirect("/signup");
    } else {
      const cpassword = req.body.cpassword;
      if (addUser.password === cpassword) {
        const spassword = await securePassword(req.body.password);
        addUser.password = spassword;
        req.session.addUser = addUser;

        const otp = generateVerificationCode();
        req.session.otp = otp;

        if (addUser) {
          sendOtpVerifyMail(addUser.fullname, addUser.email, otp);
        }

        res.redirect("/otp");
      } else {
        req.session.cPassError = true;
        res.redirect("/signup");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadOtp
const loadOtp = (req, res) => {
  try {
    if (req.session.otpError) {
      req.session.otpError = false;
      res.render("otp", { message: "Invalied otp" });
    } else {
      res.render("otp");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifyOtp
const verifyOtp = async (req, res) => {
  try {
    if (req.session.resetPassword) {
      req.session.resetPassword = false;
      res.redirect("/resetPassword");
    } else {
      const addUser = req.session.addUser;
      const generatedOtp = req.session.otp;
      const otp = Number(req.body.otp.join(""));

      if (generatedOtp === otp) {
        // const userData = await user.insertMany(addUser);
        res.redirect("/");
      } else {
        req.session.otpError = true;
        res.redirect("/otp");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadForgetPassword
const loadForgetPassword = (req, res) => {
  try {
    if (req.session.existingUser) {
      req.session.existingUser = false;
      res.render("forget", {
        message: "You are not registered with us. Please sign up.",
      });
    } else {
      res.render("forget");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifyForgetPassword
const verifyForgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await user.findOne({ email: email });
    if (userData) {
      req.session.resetEmail = userData.email;
      req.session.resetPassword = true;
      res.redirect("/otp");
    } else {
      req.session.existingUser = true;
      res.redirect("/forget");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadResetPassword
const loadResetPassword = async (req, res) => {
  try {
    if (req.session.cpassError) {
      req.session.cpassError = false;
      res.render("/resetPassword", { message: "Passwords are not same" });
    } else {
      res.render("resetPassword");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifyResetPassword
const verifyResetPassword = async (req, res) => {
  try {
    const email = req.session.resetEmail;
    const userData = await user.findOne({ email: email });
    if (userData) {
      const password = req.body.password;
      const cpassword = req.body.password;
      if (password === cpassword) {
        const spassword = await securePassword(password);
        await user.updateOne({ email : userData.email},{$set:{password:spassword}});
        req.session.PassReset = true;
        res.redirect("/login");
      } else {
        req.session.cpassError = true;
        res.redirect("/resetPassword");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadHome
const loadHome = (req,res) => {
  try{
    res.render('home');
  }catch(error){
    console.log(error.message);
  }
};

// loadShop
const loadShop = (req,res) => {
  try{
    res.render('shop');
  }catch(error){
    console.log(error.message);
  }
};

// loadAbout
const loadAbout = (req,res) => {
  try{
    res.render('about');
  }catch(error){
    console.log(error.message);
  }
};

// loadContact 
const loadContact = (req,res) => {
  try{
    res.render('contact');
  }catch(error){
    console.log(error.message);
  }
};

// loadCart
const loadCart = (req,res) => {
  try{
    res.render('cart');
  }catch(error){
    console.log(error.message);
  }
};

// loadSingleProduct
const loadSingleProduct = (req,res) => {
  try{
    res.render('sproduct');
  }catch(error){
    console.log(error.message);
  }
};

module.exports = {
  loadPage,
  loadLogin,
  verifyLogin,
  loadSignup,
  verifySignUp,
  loadOtp,
  verifyOtp,
  loadForgetPassword,
  verifyForgetPassword,
  loadResetPassword,
  verifyResetPassword,
  loadHome,
  loadShop,
  loadAbout,
  loadContact,
  loadCart,
  loadSingleProduct,
};
