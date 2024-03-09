const express = require('express');
const adminRouter = express();
const auth = require('../middleware/adminAuth');
const upload = require('../middleware/multer');

// <--------------Admin Controller-------------->
const adminController = require('../controllers/admin/adminController');
// <--------------Admin Controller-------------->

adminRouter.get('/',auth.isLogout,adminController.loadLogin);
adminRouter.post('/login',auth.isLogout,adminController.verifyLogin);
adminRouter.get('/logout',auth.isLogin,adminController.adminLogout);

// <--------------Dashboard Controller-------------->
const dashboardController = require('../controllers/admin/dashboardController');
// <--------------Dashboard Controller-------------->

adminRouter.get('/dashboard',auth.isLogin,dashboardController.loadDashboard);
adminRouter.patch('/dashboard',dashboardController.verifyDashboard);
adminRouter.get('/custom-sale-report',auth.isLogin,dashboardController.loadCustomSalesReport);
adminRouter.post('/custom-sale-report',dashboardController.verifyCustomSalesReport);

// <--------------Category Controller-------------->
const categoryController = require('../controllers/admin/categoryController');
// <--------------Category Controller-------------->

adminRouter.get('/category',auth.isLogin,categoryController.loadCategory);
adminRouter.get('/add-category',auth.isLogin,categoryController.loadAddCategory);
adminRouter.post('/add-category',categoryController.verifyAddCategory);
adminRouter.get('/edit-categorys',auth.isLogin,categoryController.loadEditCategory);
adminRouter.post('/edit-categorys',categoryController.verifyEditCategory);
adminRouter.delete('/delete-category',categoryController.deleteCategory);

// <--------------Product Controller-------------->
const productController = require('../controllers/admin/productController');
// <--------------Product Controller-------------->

adminRouter.get('/products',auth.isLogin,productController.loadProducts);
adminRouter.get('/add-products',auth.isLogin,productController.loadAddProducts);
adminRouter.post('/add-products',upload.array('img'),productController.verifyAddProducts);
adminRouter.get('/edit-products',auth.isLogin,productController.loadEditProduct);
adminRouter.post('/edit-products',upload.array('img'),productController.verifyEditProduct);
adminRouter.patch('/edit-images',upload.single('img'),productController.verifyEditImage);
adminRouter.post('/add-images',upload.single('img'),productController.addImages);
adminRouter.delete('/delete-product',productController.verifyDeleteProduct);
adminRouter.delete('/deleteImage',productController.deleteImages);


// <--------------Order Controller-------------->
const orderController = require('../controllers/admin/orderController');
// <--------------Order Controller-------------->

adminRouter.get('/order-detials',auth.isLogin,orderController.loadOrderDetials);
adminRouter.get('/order-full-detials',auth.isLogin,orderController.loadOrderFullDetials);
adminRouter.patch('/order-status',orderController.editOrderStatus);

// <--------------Order Controller-------------->
const userController = require('../controllers/admin/userController');
// <--------------Order Controller-------------->

adminRouter.get('/user-detials',auth.isLogin,userController.loadUserDetials);
adminRouter.patch('/block-user',userController.verifyBlockUser);

// <--------------Coupon Controller-------------->
const couponController = require('../controllers/admin/couponController');
// <--------------Coupon Controller-------------->

adminRouter.get('/coupon',auth.isLogin,couponController.loadCouponDetials);
adminRouter.post('/add-coupon',couponController.verifyAddCoupon);
adminRouter.patch('/edit-coupon',couponController.verifyEditCoupon);
adminRouter.patch('/edit-coupon-confirm',couponController.verifyEditCouponConfirm);
adminRouter.delete('/coupon-delete',couponController.deleteCoupon);

// <--------------Offer Controller-------------->
const offerController = require('../controllers/admin/offerController');
// <--------------Offer Controller-------------->

adminRouter.get('/offer',auth.isLogin,offerController.loadOffers);
adminRouter.post('/add-offer',offerController.verifyOffer);
adminRouter.delete('/offer-delete',offerController.deleteOffer);
adminRouter.patch('/edit-offer',offerController.editOffer);
adminRouter.patch('/edit-offer-confirm',offerController.verifyEditOffer);
adminRouter.get('/choose-offer',auth.isLogin,offerController.loadChooseOffer);
adminRouter.patch('/adding-offers',auth.isLogin,offerController.verifyAddingOffer);


module.exports = adminRouter;