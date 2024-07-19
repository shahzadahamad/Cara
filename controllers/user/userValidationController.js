const user = require("../../models/userModel");
const refferal = require("../../models/refferalModel");
const Wallet = require("../../models/walletModel");
const userOTPVerification = require("../../models/userOTPVerificationModel");
const bcrypt = require("bcryptjs");
const nodeMailer = require("nodemailer");
const validator = require("validator");

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

  const expirationTime = new Date(Date.now() + 1 * 60 * 1000);
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

// loadLogin
const loadLogin = (req, res) => {
  try {
    const message = req.flash("message");
    const message1 = req.flash("message1");
    res.render("login", { message, message1 });
  } catch (error) {
    console.log(error.message);
  }
};

// verifyLogin
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email.trim();
    const password = req.body.password;
    const userData = await user.findOne({ email: email });

    if (!email || !password) {
      req.flash("message", "All fileds are require");
      return res.redirect("/login");
    }

    if (userData) {
      const isPasswordMatch = await bcrypt.compare(password, userData.password);
      if (!isPasswordMatch) {
        req.flash("message", "Invalied Password");
        return res.redirect("/login");
      }

      if (userData.isBlocked) {
        req.flash("message", "Your accout as been blocked");
        return res.redirect("/login");
      }
    } else {
      req.flash("message", "You are not registered with us. Please sign up");
      return res.redirect("/login");
    }

    req.session.user = userData;
    return res.redirect("/");
  } catch (error) {
    console.log(error.messages);
  }
};

// loadSignUp
const loadSignup = (req, res) => {
  try {
    const { ref } = req.query;
    const message = req.flash("message");
    res.render("signup", { message, ref: ref ? ref : false });
  } catch (error) {
    console.log(error.message);
  }
};

// verifySignUp
const verifySignUp = async (req, res) => {
  try {
    const { ref } = req.query;
    const { name, email, mobile, password, cpassword } = req.body;

    if (!name || !email || !mobile || !password || !cpassword) {
      req.flash("message", "All Fileds are requred");
      return res.redirect("/signup");
    }

    if (!validator.isEmail(email)) {
      req.flash("message", "Enter a Proper Email");
      return res.redirect("/signup");
    }

    if(email.endsWith('.com')){
    }else{
      req.flash('message','Enter a Proper Email');
      return res.redirect('/signup')
    }

    if(mobile.length>10 || /\D/.test(mobile)){
      req.flash('message','Enter a Proper Mobile Number');
      return res.redirect('/signup');
    }

    if(password.includes(' ') || cpassword.includes(' ')){
      req.flash('message','Password cannot cantain white spaces');
      return res.redirect('/signup');
    };

    if(password.length < 8){
      req.flash('message','Password length should be 8 or more');
      return res.redirect('/signup');
    }

    const addUser = new user({
      fullname: name.trim(),
      email: email,
      mobile: mobile.trim(),
      password: password,
      createdDate: new Date(),
      isBlocked: false,
    });

    const existingUser = await user.findOne({ email: addUser.email });

    if (existingUser) {
      req.flash("message", "You are already registered. Please log in");
      res.redirect(`/signup?ref=${ref}`);
    } else {
      if (addUser.password === cpassword) {
        const spassword = await securePassword(password);
        addUser.password = spassword;

        req.session.userData = addUser;

        req.session.otp = true;
        generateVerificationCode(addUser);

        res.redirect(`/otp?ref=${ref}`);
      } else {
        req.flash("message", "Passwords are not same");
        res.redirect(`/signup?ref=${ref}`);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadForgetPassword
const loadForgetPassword = async (req, res) => {
  try {
    const message = req.flash("message");
    res.render("forget", { user: req.session.user, message });
  } catch (error) {
    console.log(error.message);
  }
};

// verifyForgetPassword
const verifyForgetPassword = async (req, res) => {
  try {
    if (!req.body.email) {
      req.flash("message", "Enter Email");
      return res.redirect("/forget");
    }

    if (req.session.user) {
      if (req.body.email === req.session.user.email) {
        const userData = await user.findOne({ email: req.session.user.email });
        req.session.resetEmail = userData;
        req.session.otp = true;
        generateVerificationCode(userData);
        res.redirect("/otp");
      } else {
        req.flash("message", "Please enter your email");
        res.redirect("/forget");
      }
    } else {
      const userData = await user.findOne({ email: req.body.email });
      if (userData) {
        req.session.resetEmail = userData;
        req.session.otp = true;
        generateVerificationCode(userData);
        res.redirect("/otp");
      } else {
        req.flash("message", "You are not registered with us. Please sign up.");
        res.redirect("/forget");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadResetPassword
const loadResetPassword = async (req, res) => {
  try {
    if (req.session.reset) {
      const message = req.flash("message");

      res.render("resetPassword", { message });
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
      const cpassword = req.body.cpassword;
      if (!password || !cpassword) {
        req.flash("message", "Enter Passwords");
        return res.redirect("/resetPassword");
      }
      if (password === cpassword) {
        const spassword = await securePassword(password);
        await user.updateOne(
          { email: userData.email },
          { $set: { password: spassword } }
        );
        req.session.reset = false;
        if (req.session.user) {
          req.flash("message", "Password Reset Successfully");
          res.redirect("/profile");
        } else {
          req.flash("message1", "Password Reset Successfully");
          res.redirect("/login");
        }
      } else {
        req.flash("message", "Passwords are not same");
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
    const { ref } = req.query;
    if (req.session.otp) {
      if (req.session.otpError) {
        req.session.otpError = false;
        res.render("otp", { message: "Invalied otp", ref: ref ? ref : false });
      } else if (req.session.otpExpries) {
        req.session.otpExpries = false;
        res.render("otp", {
          message: "otp expired please resend",
          ref: ref ? ref : "none",
        });
      } else {
        res.render("otp", { ref: ref ? ref : "none" });
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
      const { ref } = req.query;
      const otpDataAdd = await userOTPVerification.findOne({
        userId: req.session.userData._id,
      });
      if (!otpDataAdd) {
        req.session.otpExpries = true;
        res.redirect(`/otp?ref=${ref}`);
        return;
      }
      const otp = req.body.otp.join("");
      const isOtpMatch = await bcrypt.compare(otp, otpDataAdd.otp);
      if (isOtpMatch) {
        await userOTPVerification.deleteOne({
          userId: req.session.userData._id,
        });
        await user.insertMany(req.session.userData);

        if (ref!=='false') {

        const refferalUser = await user.findOne({ _id: ref });

          await refferal.updateOne(
            { userId: refferalUser._id },
            {
              $push: {
                history: { name: req.session.userData.fullname, amount: 100,referDate:new Date() },
              },
            },
            { upsert: true }
          );

          await Wallet.updateOne(
            { userId: refferalUser._id },
            { $inc: {totalAmount:100},
              $push: {
                transactions: {
                  type: "Credit",
                  amount: 100,
                  reason: `Refferal reward`,
                  transactionDate: new Date(),
                },
              },
            },
            {
              upsert: true
            }
          );
        }
        req.session.user = req.session.userData;
        res.redirect("/home?status=true");
      } else {
        req.session.otpError = true;
        res.redirect(`/otp?ref=${ref}`);
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
        res.redirect("/resetPassword?status=true");
      } else {
        req.session.otpError = true;
        res.redirect("/otp");
      }
    } else {
      res.redirect("/otp");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// resetotp
const verifyResetOtp = async (req, res) => {
  try {
    if (req.session.userData) {
      generateVerificationCode(req.session.userData);
    } else if (req.session.resetEmail) {
      generateVerificationCode(req.session.resetEmail);
    } else if (req.session.user) {
      const userData = await user.findOne({ _id: req.session.user._id });
      generateVerificationCode(userData);
    }
    console.log("klsafjsadlk");
    res.json({ status: true });
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
  userLogout,
  verifyResetOtp,
};
