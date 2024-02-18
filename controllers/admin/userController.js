const admin = require("../../models/adminModel");
const multer = require("../../middleware/multer");
const user = require("../../models/userModel");
const mongoose = require('mongoose');


// loadUserDetials
const loadUserDetials = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const userData = await user.find({});
    res.render("userDetials", { users: userData, admins: adminData });
  } catch (error) {
    console.log(error.message);
  }
};

// verifyBlockUser
const verifyBlockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await user.findById({ _id: id });
    if (userData) {
      res.send(userData);
      if (userData.isBlocked) {
        await user.updateOne({ _id: id }, { $set: { isBlocked: false } });
      } else {
        await user.updateOne({ _id: id }, { $set: { isBlocked: true } });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadUserDetials,
  verifyBlockUser,
}