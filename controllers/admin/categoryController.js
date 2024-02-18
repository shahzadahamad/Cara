const mongoose = require('mongoose');
const admin = require("../../models/adminModel");
const multer = require("../../middleware/multer");
const category = require("../../models/categoryModel");

// loadCategory
const loadCategory = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const categorys = await category.find();
    res.render("category", { admins: adminData, category: categorys });
  } catch (error) {
    console.log(error.message);
  }
};

// loadAddCategory
const loadAddCategory = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    if (req.session.addCategory) {
      req.session.addCategory = false;
      res.render("addCategory", {
        admins: adminData,
        message: "Category Added",
      });
    } else if (req.session.exitCategory) {
      req.session.exitCategory = false;
      res.render("addCategory", {
        admins: adminData,
        message1: "Category Already Exist",
      });
    } else {
      res.render("addCategory", { admins: adminData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifyAddCategory
const verifyAddCategory = async (req, res) => {
  try {
    const addCategory = new category({
      name: req.body.name,
    });

    const existingCategory = await category.findOne({ name: addCategory.name });
    if (existingCategory) {
      req.session.exitCategory = true;
      res.redirect("/admin/add-category");
    } else {
      await category.insertMany(addCategory);

      req.session.addCategory = true;
      res.redirect("/admin/add-category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadEditCategory
const loadEditCategory = async (req,res) => {
  try{
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const id = req.query.id;
    const categoryId = await category.findById({_id:id});
    if(req.session.editCategory){
      req.session.editCategory=false;
      res.render('editCategory',{admins:adminData,category:categoryId,message:'Edit Category'});
    }else{
      res.render('editCategory',{admins:adminData,category:categoryId});
    }
  }catch(error){
    console.log(error.message);
  }
};

// verifyEditCategory
const verifyEditCategory = async (req,res) => {
  try{
    const id = req.query.id;
    const update = {
      name: req.body.name,
    };
    await category.findByIdAndUpdate({_id:id},{$set:update});
    req.session.editCategory=true;
    res.redirect(`/admin/edit-categorys?id=${id}`);
  }catch(error){
    console.log(error.message);
  }
}

// deleteCategory
const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const deleteCategory = await category.deleteOne({ _id: id });
    if(deleteCategory){ 
      res.send({ deleteCategory });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCategory,
  loadAddCategory,
  verifyAddCategory,
  loadEditCategory,
  verifyEditCategory,
  deleteCategory,
}