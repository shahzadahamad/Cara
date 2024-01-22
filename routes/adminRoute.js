const express = require('express');
const adminRouter = express();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');

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

// loadPage
adminRouter.get('/',adminController.loadPage);

// login
adminRouter.get('/login',adminController.loadLogin);
adminRouter.post('/login',adminController.verifyLogin);

// dashboard
adminRouter.get('/dashboard',adminController.loadDashboard);

// userDetials
adminRouter.get('/user-detials',adminController.loadUserDetials);

// products
adminRouter.get('/products',adminController.loadProducts);

// addProducts
adminRouter.get('/add-products',adminController.loadAddProducts);
adminRouter.post('/add-products',upload.single('img'),adminController.verifyAddProducts);

// category
adminRouter.get('/category',adminController.loadCategory);

// addCategory
adminRouter.get('/add-category',adminController.loadAddCategory);
adminRouter.post('/add-category',adminController.verifyAddCategory);

module.exports = adminRouter;