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

// userDetials
adminRouter.get('/user-detials',auth.isLogin,adminController.loadUserDetials);

// products
adminRouter.get('/products',auth.isLogin,adminController.loadProducts);

// addProducts
adminRouter.get('/add-products',auth.isLogin,adminController.loadAddProducts);
adminRouter.post('/add-products',upload.array('img',4),adminController.verifyAddProducts);

// editProduct
adminRouter.get('/edit-products',auth.isLogin,adminController.loadEditProduct);
adminRouter.post('/edit-products',upload.array('img',4),adminController.verifyEditProduct);

// deleteProduct
adminRouter.delete('/delete-product',adminController.verifyDeleteProduct);

// category
adminRouter.get('/category',auth.isLogin,adminController.loadCategory);

// addCategory
adminRouter.get('/add-category',auth.isLogin,adminController.loadAddCategory);
adminRouter.post('/add-category',adminController.verifyAddCategory);

// editCategoy
adminRouter.get('/edit-categorys',auth.isLogin,adminController.loadEditCategory);
adminRouter.post('/edit-categorys',adminController.verifyEditCategory);

// deleteCategory
adminRouter.delete('/delete-category',adminController.deleteCategory);

// block
adminRouter.patch('/block-user',auth.isLogin,adminController.verifyBlockUser);

// order 
adminRouter.get('/order-detials',auth.isLogin,adminController.loadOrderDetials);

// order full detials 
adminRouter.get('/order-full-detials',auth.isLogin,adminController.loadOrderFullDetials);

// order status chaning
adminRouter.patch('/order-status',auth.isLogin,adminController.editOrderStatus);

// logout
adminRouter.get('/logout',auth.isLogin,adminController.adminLogout);

// <--------------Dashboard Controller-------------->
const dashboardController = require('../controllers/admin/dashboardController');
// <--------------Dashboard Controller-------------->

// dashboard
adminRouter.get('/dashboard',auth.isLogin,dashboardController.loadDashboard);
adminRouter.patch('/dashboard',dashboardController.verifyDashboard);+

// custum sales report
adminRouter.get('/custom-sale-report',auth.isLogin,dashboardController.loadCustomSalesReport);
adminRouter.post('/custom-sale-report',dashboardController.verifyCustomSalesReport);


module.exports = adminRouter;