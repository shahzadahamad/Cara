const user = require("../models/userModel");
const userOTPVerification = require("../models/userOTPVerificationModel");
const product = require("../models/productsModel");
const category = require("../models/categoryModel");
const bcrypt = require("bcrypt");
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
const generateVerificationCode = async (userData) => {
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const expirationTime = new Date(Date.now() + 120000);
  const sOtp = await securePassword(verificationCode);

  const addOTP = new userOTPVerification({
    userId: userData._id,
    otp: sOtp,
    createdAt: new Date(),
    expiresAt: expirationTime,
  });

  await userOTPVerification.insertMany(addOTP);
  scheduleDocumentDeletion(userData._id, expirationTime, addOTP._id);
  sendOtpVerifyMail(userData.fullname, userData.email, verificationCode);
};

// scheduleDocumentDeletion
const scheduleDocumentDeletion = async (userId, expirationTime, otpId) => {
  const currentTime = new Date();
  const timeUntilExpiration = expirationTime - currentTime;
  setTimeout(async () => {
    try {
      await userOTPVerification.deleteOne({ _id: otpId, userId: userId });
    } catch (error) {
      console.log(error.message);
    }
  }, timeUntilExpiration);
};

// loadHome
const loadPage = (req, res) => {
  try {
    res.redirect("/home");
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
      req.session.PassReset = false;
      res.render("login", { message1: "Password Reset Successfully" });
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
    const addUser = new user({
      fullname: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
      createdDate: new Date(),
      isBlocked: false,
    });

    const existingUser = await user.findOne({ email: addUser.email });

    if (existingUser) {
      req.session.existingUser = true;
      res.redirect("/signup");
    } else {
      const cpassword = req.body.cpassword;
      if (addUser.password === cpassword) {
        const spassword = await securePassword(req.body.password);
        addUser.password = spassword;

        req.session.userData = addUser;

        req.session.otp = true;
        generateVerificationCode(addUser);

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
      req.session.resetEmail = userData;

      req.session.otp = true;
      generateVerificationCode(userData);

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
    if (req.session.reset) {
      if (req.session.cpassError) {
        req.session.cpassError = false;
        res.render("resetPassword", { message: "Passwords are not same" });
      } else {
        res.render("resetPassword");
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifyResetPassword
const verifyResetPassword = async (req, res) => {
  try {
    const email = req.session.resetEmail.email;
    const userData = await user.findOne({ email: email });

    if (userData) {
      const password = req.body.password;
      const cpassword = req.body.password;
      if (password === cpassword) {
        const spassword = await securePassword(password);
        await user.updateOne(
          { email: userData.email },
          { $set: { password: spassword } }
        );
        req.session.PassReset = true;
        req.session.reset = false;
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

// loadOtp
const loadOtp = async (req, res) => {
  try {
    if (req.session.otp) {
      if (req.session.otpError) {
        req.session.otpError = false;
        res.render("otp", { message: "Invalied otp" });
      } else if (req.session.otpExpries) {
        req.session.otpExpries = false;
        res.render("otp", { message: "otp expired please resend" });
      } else {
        res.render("otp");
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifyOtp
const verifyOtp = async (req, res) => {
  try {
    if (req.session.userData) {
      const otpDataAdd = await userOTPVerification.findOne({
        userId: req.session.userData._id,
      });
      if (!otpDataAdd) {
        req.session.otpExpries = true;
        res.redirect("/otp");
        return;
      }
      const otp = req.body.otp.join("");
      const isOtpMatch = await bcrypt.compare(otp, otpDataAdd.otp);
      if (isOtpMatch) {
        await userOTPVerification.deleteOne({
          userId: req.session.userData._id,
        });
        await user.insertMany(req.session.userData);
        req.session.user = req.session.userData._id;
        res.redirect("/");
      } else {
        req.session.otpError = true;
        res.redirect("/otp");
      }
    } else if (req.session.resetEmail) {
      const otpDataChangePass = await userOTPVerification.findOne({
        userId: req.session.resetEmail._id,
      });

      if (!otpDataChangePass) {
        req.session.otpExpries = true;
        res.redirect("/otp");
        return;
      }
      const otp = req.body.otp.join("");
      const isOtpMatch = await bcrypt.compare(otp, otpDataChangePass.otp);

      if (isOtpMatch) {
        await userOTPVerification.deleteOne({
          userId: req.session.resetEmail._id,
        });
        req.session.reset = true;
        res.redirect("/resetPassword");
      } else {
        req.session.otpError = true;
        res.redirect("/otp");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// resumit
const verifyResubmit = async (req, res) => {
  try {
    if (req.session.userData) {
      await userOTPVerification.deleteOne({ userId: req.session.userData._id });
      req.session.otp=false;
      res.redirect("/signup");
    } else if (req.session.resetEmail) {
      await userOTPVerification.deleteOne({
        userId: req.session.resetEmail._id,
      });
      req.session.otp=false;
      res.redirect("/login");
    } else {
      res.redirect("/signup");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadHome
const loadHome = async (req, res) => {
  try {
    const productData = await product.find().limit(8);
    const latestProducts = await product.find().sort({ _id: -1 }).limit(8);
    res.render("home", {
      login: req.session.user,
      product: productData,
      latestProducts: latestProducts,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// loadShop
const loadShop = async (req, res) => {
  try {
    const productData = await product.find();
    const categorys = await category.find();
    res.render("shop", { login: req.session.user, product:productData, category:categorys });
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

// loadCart
const loadCart = (req, res) => {
  try {
    res.render("cart", { login: req.session.user });
  } catch (error) {
    console.log(error.message);
  }
};

// loadSingleProduct
const loadSingleProduct = async (req, res) => {
  try {
    const id=req.query.id;
    const sproduct  = await product.findById({_id:id});
    const relatedProduct = await product.find({categoryId:sproduct.categoryId,brand:sproduct.brand});
    res.render("sproduct", { login: req.session.user, sproduct:sproduct, related:relatedProduct });
  } catch (error) {
    console.log(error.message);
  }
};

// loadProfile
const loadProfile = (req, res) => {
  try {
    res.render("profile", { login: req.session.user });
  } catch (error) {
    console.log(error.message);
  }
};

// userLogout
const userLogout = (req, res) => {
  try {
    delete req.session.user;
    res.redirect("/");
  } catch (error) {
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
  loadCart,
  loadSingleProduct,
  loadProfile,
  userLogout,
  verifyResubmit,
};
