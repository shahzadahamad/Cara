const express = require('express');
const userRouter = express();
const auth = require('../middleware/userAuth');

// viewEngine
userRouter.set('view engine','ejs');
userRouter.set('views','./views/user');

// <-------------- User routes-------------->

// <--------------User Controller-------------->
const userController = require('../controllers/user/userController');
// <--------------User Controller-------------->


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
userRouter.get('/forget',userController.loadForgetPassword);
userRouter.post('/forget',userController.verifyForgetPassword);

// resetPassword
userRouter.get('/resetPassword',auth.isLogout,userController.loadResetPassword);
userRouter.post('/resetPassword',userController.verifyResetPassword);

// home
userRouter.get('/home',userController.loadHome);

// shop
userRouter.get('/shop',userController.loadShop);

// about
userRouter.get('/about',userController.loadAbout);



// singleProduct
userRouter.get('/sproduct',userController.loadSingleProduct);

// profile
userRouter.get('/profile',auth.isLogin,userController.loadProfile);

// user-edit
userRouter.get('/edit-user',auth.isLogin,userController.loadEditUser);
userRouter.post('/edit-user',userController.verifyEditUser);

// logout
userRouter.get('/logout',auth.isLogin,userController.userLogout);


// <--------------Cart Controller-------------->
const cartController = require('../controllers/user/cartController');
// <--------------Cart Controller-------------->


// cart
userRouter.get('/cart',auth.isLoginCart,cartController.loadCart);

// cart 
userRouter.post('/add-to-cart',cartController.verifyAddToCart);

// Remove cart products
userRouter.patch('/remove-product',cartController.verifyRemoveCart);

// cart products detials
userRouter.patch('/cart-detials',cartController.verifyCartDetials);


// <--------------Address Controller-------------->
const addressController = require('../controllers/user/addressController');
// <--------------Address Controller-------------->


// user address
userRouter.get('/address',auth.isLogin,addressController.loadAddress);

// user add address 
userRouter.get('/add-address',auth.isLogin,addressController.loadAddAddress);
userRouter.post('/add-address',addressController.verifyAddAddress);

// Edit address
userRouter.get('/edit-address',auth.isLogin,addressController.loadEditAddress);
userRouter.post('/edit-address',addressController.verifyEditAddress)

// delete address
userRouter.patch('/remove-address',addressController.verifyDeleteAddress);


module.exports = userRouter;