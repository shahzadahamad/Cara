// database
const database = require("./config/config");

const express = require("express");
const app = express();
const nocache = require("nocache");
const path = require("path");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const nodemon = require("nodemon");
const flash = require('connect-flash');
const morgan = require('morgan');
const dotEnv = require("dotenv");
dotEnv.config();

// session
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 30 * 24 * 60 * 60 * 1000  },
  })
);

// view engine
app.set('view engine','ejs');

// morgan
// app.use(morgan('dev'));

// flash 
app.use(flash());

// json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// noCache
app.use(nocache());

// staticFile
app.use(express.static(path.join(__dirname, "public")));

// userRoutes
const userRouter = require("./routes/userRoute");
userRouter.set('views', 'views/user');
app.use("/", userRouter);

// adminRoutes
const adminRouter = require("./routes/adminRoute");
adminRouter.set('views', 'views/admin');
app.use("/admin", adminRouter);

app.set('views','views/error');

//admin error page
app.use('/admin',(req, res, next) => {
  res.status(404).render('error',{status:false});
});

// user error page
app.use('/',(req, res, next) => {
  res.status(404).render('error',{login: req.session.user,status:true});
});

// serverRunning
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on 3000 : http://localhost:3000 http://localhost:3000/admin");
});
