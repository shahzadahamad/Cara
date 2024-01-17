const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/Cara");
// --------------------------------

const express = require("express");
const app = express();
const nocache = require("nocache");
const path = require("path");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const nodemon = require("nodemon");
const dotEnv = require('dotenv');
dotEnv.config();

// userSession
app.use(
  "/",
  session({
    name: "userSession",
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);

// adminSession
app.use(
  "/admin",
  session({
    name: "adminSession",
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);

// session
// app.use(
//   session({
//     secret: uuidv4(),
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 1000*80000000 },
//   })
// );

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

