const express = require('express');
const userRouter = express();
const userController = require('../controllers/userController');
const auth = require('../middleware/userAuth');

// viewEngine
userRouter.set('view engine','ejs');
userRouter.set('views','./views/user');

// <--------------routes-------------->

// loadPage
userRouter.get('/',auth.isLogout,userController.loadPage);

// login
userRouter.get('/login',auth.isLogout,userController.loadLogin);
userRouter.post('/login',userController.verifyLogin);

// signup
userRouter.get('/signup',auth.isLogout,userController.loadSignup);
userRouter.post('/signup',userController.verifySignUp);

// otpVerification
userRouter.get('/otp',auth.isLogout,userController.loadOtp);
userRouter.post('/otp',userController.verifyOtp);

// forgetPassword
userRouter.get('/forget',auth.isLogout,userController.loadForgetPassword);
userRouter.post('/forget',userController.verifyForgetPassword);

// resetPassword
userRouter.get('/resetPassword',auth.isLogout,userController.loadResetPassword);
userRouter.post('/resetPassword',userController.verifyResetPassword);

// resubmit
userRouter.post('/resubmit',userController.verifyResubmit);

// home
userRouter.get('/home',userController.loadHome);

// shop
userRouter.get('/shop',userController.loadShop);

// about
userRouter.get('/about',userController.loadAbout);

// cart
userRouter.get('/cart',auth.isLoginCart,userController.loadCart);

// singleProduct
userRouter.get('/sproduct',userController.loadSingleProduct);

// profile
userRouter.get('/profile',auth.isLogin,userController.loadProfile);

// cart 
userRouter.post('/add-to-cart',userController.verifyAddToCart);

// Remove cart products
userRouter.patch('/remove-product',userController.verifyRemoveCart);

// cart products detials
userRouter.patch('/cart-detials',userController.verifyCartDetials);

// logout
userRouter.get('/logout',auth.isLogin,userController.userLogout);

module.exports = userRouter;