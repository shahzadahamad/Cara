const express = require('express');
const userRouter = express();
const userController = require('../controllers/userController')

// viewEngine
userRouter.set('view engine','ejs');
userRouter.set('views','./views/user');

// <--------------routes-------------->

// loadPage
userRouter.get('/',userController.loadPage);

// login
userRouter.get('/login',userController.loadLogin);
userRouter.post('/login',userController.verifyLogin);

// signup
userRouter.get('/signup',userController.loadSignup);
userRouter.post('/signup',userController.verifySignUp);

// otpVerification
userRouter.get('/otp',userController.loadOtp);
userRouter.post('/otp',userController.verifyOtp);

// forgetPassword
userRouter.get('/forget',userController.loadForgetPassword);
userRouter.post('/forget',userController.verifyForgetPassword);

// resetPassword
userRouter.get('/resetPassword',userController.loadResetPassword);
userRouter.post('/resetPassword',userController.verifyResetPassword);

// home
userRouter.get('/home',userController.loadHome);

// shop
userRouter.get('/shop',userController.loadShop);

// about
userRouter.get('/about',userController.loadAbout);

// contact
userRouter.get('/contact',userController.loadContact);

// cart
userRouter.get('/cart',userController.loadCart);

// singleProduct
userRouter.get('/sproduct',userController.loadSingleProduct);

// profile
userRouter.get('/profile',userController.loadProfile);

// logout
userRouter.get('/logout',userController.userLogout);


module.exports = userRouter;