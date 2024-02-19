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

    const {message,message1} = req.flash();
      res.render("addCategory", { admins: adminData,message,message1 });
    
  } catch (error) {
    console.log(error.message);
  }
};

// verifyAddCategory
const verifyAddCategory = async (req, res) => {
  try {
    const {name}=req.body;

    const existingCategory = await category.findOne({ name: name });



    if(!name){
      req.flash('message1','Invalied Category Name');
      return res.redirect(`/admin/add-category`);
    }


    if (existingCategory) {
      req.flash('message1','Category Already Exist')
      return res.redirect("/admin/add-category");
    } 

    const covertedName = name.trim().replace(/\s+/g, " ");

    const addCategory = new category({
      name: covertedName,
    });


      await category.insertMany(addCategory);
      req.flash('message','Category Added');
      res.redirect("/admin/add-category");
    
  } catch (error) {
    console.log(error.message);
  }
};

// loadEditCategory
const loadEditCategory = async (req,res) => {
  try{
    const {message,message1} = req.flash();
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const id = req.query.id;
    const categoryId = await category.findById({_id:id});

      res.render('editCategory',{admins:adminData,category:categoryId,message,message1,edit:true});
    
  }catch(error){
    console.log(error.message);
  }
};

// verifyEditCategory
const verifyEditCategory = async (req,res) => {
  try{
    const id = req.query.id;
    const {name}=req.body
    const existingCategory = await category.findOne({name:name})

    if(!name){
      req.flash('message1','Invalied Category Name');
      return res.redirect(`/admin/edit-categorys?id=${id}`);
    }

    if(existingCategory){
      req.flash('message1','This Category Already exist');
      return res.redirect(`/admin/edit-categorys?id=${id}`);
    }

     const covertedName = name.trim().replace(/\s+/g, " ");

    await category.findByIdAndUpdate({_id:id},{$set:{name:covertedName}});
    req.flash('message','Category Edited');
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