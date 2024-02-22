const express = require('express');
const adminRouter = express();
const auth = require('../middleware/adminAuth');
const upload = require('../middleware/multer');

// <--------------Admin Controller-------------->
const adminController = require('../controllers/admin/adminController');
// <--------------Admin Controller-------------->

// viewEngine
adminRouter.set('view engine','ejs');
adminRouter.set('views','./views/admin');

// login
adminRouter.get('/',auth.isLogout,adminController.loadLogin);
adminRouter.post('/login',auth.isLogout,adminController.verifyLogin);

// logout
adminRouter.get('/logout',auth.isLogin,adminController.adminLogout);

// <--------------Dashboard Controller-------------->
const dashboardController = require('../controllers/admin/dashboardController');
// <--------------Dashboard Controller-------------->

// dashboard
adminRouter.get('/dashboard',auth.isLogin,dashboardController.loadDashboard);
adminRouter.patch('/dashboard',dashboardController.verifyDashboard);

// custum sales report
adminRouter.get('/custom-sale-report',auth.isLogin,dashboardController.loadCustomSalesReport);
adminRouter.post('/custom-sale-report',dashboardController.verifyCustomSalesReport);

// <--------------Category Controller-------------->
const categoryController = require('../controllers/admin/categoryController');
// <--------------Category Controller-------------->

// category
adminRouter.get('/category',auth.isLogin,categoryController.loadCategory);

// addCategory
adminRouter.get('/add-category',auth.isLogin,categoryController.loadAddCategory);
adminRouter.post('/add-category',categoryController.verifyAddCategory);

// editCategoy
adminRouter.get('/edit-categorys',auth.isLogin,categoryController.loadEditCategory);
adminRouter.post('/edit-categorys',categoryController.verifyEditCategory);

// deleteCategory
adminRouter.delete('/delete-category',categoryController.deleteCategory);

// <--------------Product Controller-------------->
const productController = require('../controllers/admin/productController');
// <--------------Product Controller-------------->

// products
adminRouter.get('/products',auth.isLogin,productController.loadProducts);

// addProducts
adminRouter.get('/add-products',auth.isLogin,productController.loadAddProducts);
adminRouter.post('/add-products',upload.array('img',4),productController.verifyAddProducts);

// editProduct
adminRouter.get('/edit-products',auth.isLogin,productController.loadEditProduct);
adminRouter.post('/edit-products',upload.array('img',4),productController.verifyEditProduct);

//edit Image
adminRouter.patch('/edit-images',productController.verifyEditImage)

// deleteProduct
adminRouter.delete('/delete-product',productController.verifyDeleteProduct);

// <--------------Order Controller-------------->
const orderController = require('../controllers/admin/orderController');
// <--------------Order Controller-------------->

// order 
adminRouter.get('/order-detials',auth.isLogin,orderController.loadOrderDetials);

// order full detials 
adminRouter.get('/order-full-detials',auth.isLogin,orderController.loadOrderFullDetials);

// order status chaning
adminRouter.patch('/order-status',orderController.editOrderStatus);

// <--------------Order Controller-------------->
const userController = require('../controllers/admin/userController');
// <--------------Order Controller-------------->

// userDetials
adminRouter.get('/user-detials',auth.isLogin,userController.loadUserDetials);

// block
adminRouter.patch('/block-user',userController.verifyBlockUser);

// <--------------Coupon Controller-------------->
const couponController = require('../controllers/admin/couponController');
// <--------------Coupon Controller-------------->


//add coupon
adminRouter.get('/coupon',auth.isLogin,couponController.loadCouponDetials);
adminRouter.post('/add-coupon',couponController.verifyAddCoupon);

//edit coupon
adminRouter.patch('/edit-coupon',couponController.verifyEditCoupon);
adminRouter.patch('/edit-coupon-confirm',couponController.verifyEditCouponConfirm);

// delete coupon 
adminRouter.delete('/coupon-delete',couponController.deleteCoupon);

// <--------------Offer Controller-------------->
const offerController = require('../controllers/admin/offerController');
// <--------------Offer Controller-------------->

adminRouter.get('/offer',auth.isLogin,offerController.loadOffers);
adminRouter.patch('/offer-category',auth.isLogin,offerController.getCategoriesAndProduct);
adminRouter.post('/add-offer',offerController.verifyOffer);
adminRouter.delete('/offer-delete',offerController.deleteOffer);
adminRouter.patch('/edit-offer',offerController.editOffer);
adminRouter.patch('/edit-offer-confirm',offerController.verifyEditOffer);


module.exports = adminRouter;