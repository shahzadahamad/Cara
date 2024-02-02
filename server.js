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
app.use("/", userRouter);

// adminRoutes
const adminRouter = require("./routes/adminRoute");
app.use("/admin", adminRouter);

// serverRunning
const port = process.env.port || 3000;
app.listen(port, () => {
  console.log("Server running on 3000 : http://localhost:3000");
});
