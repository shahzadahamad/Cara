const express = require('express');
const userRouter = express();
const auth = require('../middleware/userAuth');

// <-------------- User routes-------------->

// <--------------User Controller-------------->
const userController = require('../controllers/user/userController');
// <--------------User Controller-------------->

userRouter.get('/',auth.isLogout,userController.loadPage);
userRouter.get('/home',auth.isBlocked,userController.loadHome);
userRouter.get('/shop',auth.isBlocked,userController.loadShop);
userRouter.post('/shop-search',userController.verifyShopSearch);
userRouter.get('/search',auth.isBlocked,userController.loadSearch);
userRouter.get('/about',auth.isBlocked,userController.loadAbout);
userRouter.get('/sproduct',auth.isBlocked,userController.loadSingleProduct);
userRouter.get('/profile',auth.isBlocked,auth.isLogin,userController.loadProfile);
userRouter.get('/refer',auth.isBlocked,auth.isLogin,userController.loadRefer)
userRouter.get('/refferal',userController.verifyRefferal);
userRouter.get('/edit-user',auth.isLogin,auth.isBlocked,userController.loadEditUser);
userRouter.post('/edit-user',userController.verifyEditUser);

// <--------------User validation Controller-------------->
const userValidationController = require('../controllers/user/userValidationController');
// <--------------User validation Controller-------------->

userRouter.get('/login',auth.isLogout,userValidationController.loadLogin);
userRouter.post('/login',userValidationController.verifyLogin);
userRouter.get('/signup',auth.isLogout,userValidationController.loadSignup);
userRouter.post('/signup',userValidationController.verifySignUp);
userRouter.get('/otp',auth.isLogout,userValidationController.loadOtp);
userRouter.post('/otp',userValidationController.verifyOtp);
userRouter.post('/resetOtp',userValidationController.verifyResetOtp);
userRouter.get('/forget',userValidationController.loadForgetPassword);
userRouter.post('/forget',userValidationController.verifyForgetPassword);
userRouter.get('/resetPassword',auth.isLogout,userValidationController.loadResetPassword);
userRouter.post('/resetPassword',userValidationController.verifyResetPassword);
userRouter.get('/logout',auth.isLogin,userValidationController.userLogout);

// <--------------Cart and Checkout Controller-------------->
const cartController = require('../controllers/user/cartController');
// <--------------Cart and Checkout Controller-------------->

userRouter.get('/cart',auth.isLoginCart,auth.isBlocked,cartController.loadCart);
userRouter.post('/add-to-cart',cartController.verifyAddToCart);
userRouter.patch('/remove-product',cartController.verifyRemoveCart);
userRouter.patch('/cart-detials',cartController.verifyCartDetials);

// <--------------Address Controller-------------->
const addressController = require('../controllers/user/addressController');
// <--------------Address Controller-------------->

userRouter.get('/address',auth.isLogin,auth.isBlocked,addressController.loadAddress);
userRouter.get('/add-address',auth.isLogin,auth.isBlocked,addressController.loadAddAddress);
userRouter.patch('/add-address-check',addressController.checkAddress);
userRouter.post('/add-address',addressController.verifyAddAddress);
userRouter.get('/checkout-add-address',auth.isLogin,auth.isBlocked,addressController.loadCheckoutAddAddress);
userRouter.post('/checkout-add-address',addressController.verifyCheckoutAddAddress);
userRouter.get('/edit-address',auth.isLogin,auth.isBlocked,addressController.loadEditAddress);
userRouter.post('/edit-address',addressController.verifyEditAddress);
userRouter.get('/change-address',auth.isLogin,auth.isBlocked,addressController.loadChangeAddress);
userRouter.post('/change-address',addressController.verifyChangeAddress);
userRouter.get('/change-add-address',auth.isLogin,auth.isBlocked,addressController.loadChangeAddAddress);
userRouter.post('/change-add-address',addressController.verifyChangeAddAddress);
userRouter.patch('/remove-address',addressController.verifyDeleteAddress);

// <--------------Order Controller-------------->
const orderController = require('../controllers/user/orderController');
// <--------------Order Controller-------------->

userRouter.get('/order',auth.isLogin,auth.isBlocked,orderController.loadOrder);
userRouter.get('/order-detials',auth.isLogin,auth.isBlocked,orderController.loadOrderDetials);
userRouter.get('/cancel-order',auth.isLogin,auth.isBlocked,orderController.loadCancelPage);
userRouter.post('/cancel-order',orderController.verifyCancelPage);
userRouter.get('/invoice-download',auth.isLogin,auth.isBlocked,orderController.invoice);
userRouter.patch('/repayment',orderController.verifyRepayment);
userRouter.patch('/repayment-success',orderController.repeymentSuccess);

// <--------------Checkout Controller-------------->
const checkoutController = require('../controllers/user/checkoutController');
// <--------------Checkout Controller-------------->

userRouter.get('/checkout',auth.isLogin,auth.isBlocked,checkoutController.loadCheckout);
userRouter.post('/checkout',checkoutController.verifyCheckout);
userRouter.post('/verify-cart-checkout',checkoutController.verifyCartCheckout)
userRouter.get('/order-confirm',auth.isLogin,auth.isBlocked,checkoutController.loadOrder);  
userRouter.post('/verify-razorpay',checkoutController.verifyRazorpay);
userRouter.patch('/razorpay-success',checkoutController.razorpaySuccess);
userRouter.post('/payment-failed',checkoutController.razorpayFalied);
userRouter.post('/coupon',checkoutController.verifyCoupon);
userRouter.delete('/destory-coupon',checkoutController.deleteSession);

// <--------------Wallet Controller-------------->
const walletController = require('../controllers/user/walletController');
// <--------------Wallet Controller-------------->

userRouter.get('/wallet',auth.isLogin,auth.isBlocked,walletController.loadWallet);
userRouter.post('/add-to-wallet',walletController.verifyAddMoney);
userRouter.patch('/waller-add-success',walletController.verifySuccessAddMoney);

// <--------------wishlist Controller-------------->
const wishlistController = require('../controllers/user/wishlistController');
// <--------------wishlist Controller-------------->

userRouter.get('/wishlist',auth.isLoginCart,auth.isBlocked,wishlistController.loadWishlist);
userRouter.post('/add-to-wishlist',wishlistController.verifyWishlist)
userRouter.patch('/remove-products-wishlist',wishlistController.removeProduct);

module.exports = userRouter;