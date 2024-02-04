const express = require('express');
const adminRouter = express();
const adminController = require('../controllers/admin/adminController');
const auth = require('../middleware/adminAuth');
const upload = require('../middleware/multer');

// viewEngine
adminRouter.set('view engine','ejs');
adminRouter.set('views','./views/admin');

// login
adminRouter.get('/',auth.isLogout,adminController.loadLogin);
adminRouter.post('/login',auth.isLogout,adminController.verifyLogin);

// dashboard
adminRouter.get('/dashboard',auth.isLogin,adminController.loadDashboard);

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

// logout
adminRouter.get('/logout',auth.isLogin,adminController.adminLogout);

module.exports = adminRouter;