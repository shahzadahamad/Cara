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



// <--------------User validation Controller-------------->
const userValidationController = require('../controllers/user/userValidationController');
// <--------------User validation Controller-------------->


// login
userRouter.get('/login',auth.isLogout,userValidationController.loadLogin);
userRouter.post('/login',userValidationController.verifyLogin);

// signup
userRouter.get('/signup',auth.isLogout,userValidationController.loadSignup);
userRouter.post('/signup',userValidationController.verifySignUp);

// otpVerification
userRouter.get('/otp',auth.isLogout,userValidationController.loadOtp);
userRouter.post('/otp',userValidationController.verifyOtp);

// forgetPassword
userRouter.get('/forget',userValidationController.loadForgetPassword);
userRouter.post('/forget',userValidationController.verifyForgetPassword);

// resetPassword
userRouter.get('/resetPassword',auth.isLogout,userValidationController.loadResetPassword);
userRouter.post('/resetPassword',userValidationController.verifyResetPassword);

// logout
userRouter.get('/logout',auth.isLogin,userValidationController.userLogout);


// <--------------Cart and Checkout Controller-------------->
const cartController = require('../controllers/user/cartController');
// <--------------Cart and Checkout Controller-------------->


// cart
userRouter.get('/cart',auth.isLoginCart,cartController.loadCart);

// cart 
userRouter.post('/add-to-cart',cartController.verifyAddToCart);

// Remove cart products
userRouter.patch('/remove-product',cartController.verifyRemoveCart);

// cart products detials
userRouter.patch('/cart-detials',cartController.verifyCartDetials);

// checkout page and verify checkout 
userRouter.get('/checkout',auth.isLogin,cartController.loadCheckout);
userRouter.post('/checkout',cartController.verifyCheckout);

// verify cart chekcout
userRouter.post('/verify-cart-checkout',cartController.verifyCartCheckout)

// user ordered page
userRouter.get('/order-confirm',auth.isLogin,cartController.loadOrder);  


// <--------------Address Controller-------------->
const addressController = require('../controllers/user/addressController');
// <--------------Address Controller-------------->


// user address
userRouter.get('/address',auth.isLogin,addressController.loadAddress);

// user add address 
userRouter.get('/add-address',auth.isLogin,addressController.loadAddAddress);
userRouter.post('/add-address',addressController.verifyAddAddress);
userRouter.get('/checkout-add-address',auth.isLogin,addressController.loadCheckoutAddAddress);
userRouter.post('/checkout-add-address',addressController.verifyCheckoutAddAddress);

// Edit address
userRouter.get('/edit-address',auth.isLogin,addressController.loadEditAddress);
userRouter.post('/edit-address',addressController.verifyEditAddress);

// Change Address
userRouter.get('/change-address',auth.isLogin,addressController.loadChangeAddress);
userRouter.post('/change-address',addressController.verifyChangeAddress);

// change add address
userRouter.get('/change-add-address',auth.isLogin,addressController.loadChangeAddAddress);
userRouter.post('/change-add-address',addressController.verifyChangeAddAddress);

// delete address
userRouter.patch('/remove-address',addressController.verifyDeleteAddress);

// <--------------Order Controller-------------->
const orderController = require('../controllers/user/orderController');
// <--------------Order Controller-------------->

userRouter.get('/order',auth.isLogin,orderController.loadOrder);
userRouter.get('/order-detials',auth.isLogin,orderController.loadOrderDetials);

userRouter.get('/cancel-order',auth.isLogin,orderController.loadCancelPage);
userRouter.post('/cancel-order',orderController.verifyCancelPage);

module.exports = userRouter;