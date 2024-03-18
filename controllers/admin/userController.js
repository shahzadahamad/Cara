const admin = require("../../models/adminModel");
const multer = require("../../middleware/multer");
const user = require("../../models/userModel");
const mongoose = require('mongoose');

// loadUserDetials
const loadUserDetials = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const page = 1;
    const limit = 10;
    const startIndex = (page-1)*limit;
    const userData = await user.find().skip(startIndex).limit(limit).sort({createdDate:-1});
    const totalUserCount = await user.countDocuments();
    const hasNextPage = totalUserCount > limit * page;
    res.render("userDetials", { users: userData, admins: adminData,hasNextPage,totalUserCount});
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

// to get the search data in user list
const getSearchData = async (req,res) => {
  try{
    const {searchValue,page}=req.query;
    let pageInt = parseInt(page);
    if(pageInt<=0){
      pageInt=1;
    }
    const limit = 10;
    const startIndex = (pageInt-1)*limit;
    const regexPattern = new RegExp(searchValue,'i');
    const users = await user.find({$or:[{fullname:regexPattern},{email:regexPattern},{mobile:regexPattern}]}).skip(startIndex).limit(limit).sort({createdDate: -1});
    const allUsers = await user.find().skip(startIndex).limit(limit).sort({createdDate:-1});
    const totalUsersCount = await user.find({$or:[{fullname:regexPattern},{email:regexPattern},{mobile:regexPattern}]}).countDocuments();
    const AlltotalUsersCount = await user.countDocuments();
    const hasNextPage = searchValue ?  totalUsersCount > limit * pageInt : AlltotalUsersCount > limit * pageInt;
    res.json({users:searchValue?users:allUsers, nextPage:hasNextPage ,page:pageInt});
  }catch(error){
    console.log(error.message);
  }
};

module.exports = {
  loadUserDetials,
  verifyBlockUser,
  getSearchData,
}