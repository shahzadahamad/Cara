const express = require('express');
const adminRouter = express();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/adminAuth');

// viewEngine
adminRouter.set('view engine','ejs');
adminRouter.set('views','./views/admin');

// multer
const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname,'../public/images/productImages'));
  },
  filename:function(req,file,cb){
    const name = Date.now()+"-"+file.originalname;
    cb(null,name);
  },
});
const upload = multer({storage:storage});

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
adminRouter.post('/add-products',upload.single('img'),adminController.verifyAddProducts);

// category
adminRouter.get('/category',auth.isLogin,adminController.loadCategory);

// addCategory
adminRouter.get('/add-category',auth.isLogin,adminController.loadAddCategory);
adminRouter.post('/add-category',adminController.verifyAddCategory);

// block
adminRouter.get('/block-user',auth.isLogin,adminController.verifyBlockUser);

// logout
adminRouter.get('/logout',auth.isLogin,adminController.adminLogout);

module.exports = adminRouter;