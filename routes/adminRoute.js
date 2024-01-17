const express = require('express');
const adminRouter = express();
const adminController = require('../controllers/adminController');

// viewEngine
adminRouter.set('view engine','ejs');
adminRouter.set('views','./views/admin');

// loadPage
adminRouter.get('/',adminController.loadPage);

// login
adminRouter.get('/login',adminController.loadLogin);
adminRouter.post('/login',adminController.verifyLogin);

// dashboard
adminRouter.get('/dashboard',adminController.loadDashboard);



module.exports = adminRouter;