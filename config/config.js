const mongoose = require("mongoose");

require('dotenv').config();

exports = mongoose.connect(process.env.mongoUrl);