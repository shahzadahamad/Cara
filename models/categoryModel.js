const mongoose = require('mongoose');

const category = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
});

module.exports = mongoose.model('category',category);
