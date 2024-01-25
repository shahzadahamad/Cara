const express = require('express');
const adminRouter = express();
const adminController = require('../controllers/adminController');
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

// deleteProduct
adminRouter.delete('/delete-product',adminController.verifyDeleteProduct);

// category
adminRouter.get('/category',auth.isLogin,adminController.loadCategory);

// addCategory
adminRouter.get('/add-category',auth.isLogin,adminController.loadAddCategory);
adminRouter.post('/add-category',adminController.verifyAddCategory);

// deleteCategory
adminRouter.delete('/delete-category',adminController.deleteCategory);

// block
adminRouter.put('/block-user',auth.isLogin,adminController.verifyBlockUser);

// logout
adminRouter.get('/logout',auth.isLogin,adminController.adminLogout);

module.exports = adminRouter;