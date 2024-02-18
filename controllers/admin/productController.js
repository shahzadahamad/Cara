const admin = require("../../models/adminModel");
const multer = require("../../middleware/multer");
const product = require("../../models/productsModel");
const category = require("../../models/categoryModel");
const mongoose = require('mongoose');


// loadProducts
const loadProducts = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const products = await product.find().populate("categoryId");
    res.render("products", { admins: adminData, product: products });
  } catch (error) {
    console.log(error.message);
  }
};

// loadAddProducts
const loadAddProducts = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const categorys = await category.find();
    if (req.session.addProduct) {
      req.session.addProduct = false;
      res.render("addProducts", {
        admins: adminData,
        message: "Product Added",
        category: categorys,
      });
    } else if (req.session.exitProduct) {
      req.session.exitProduct = false;
      res.render("addProducts", {
        admins: adminData,
        message1: "Product Already Exist",
        category: categorys,
      });
    } else {
      res.render("addProducts", { admins: adminData, category: categorys });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifyAddProducts
const verifyAddProducts = async (req, res) => {
  try {
    const categorys = await category.findOne({ name: req.body.category });

    const images = [];
    const files = req.files;

    files.forEach((files) => {
      images.push(files.filename);
    });

    const addProduct = new product({
      name: req.body.name,
      brand: req.body.brand,
      categoryId: categorys._id,
      rating: req.body.rating,
      price: req.body.price,
      quantity: req.body.quantity,
      image: images,
      description: req.body.description,
    });

    const existingProduct = await product.findOne({ name: addProduct.name });

    if (existingProduct) {
      req.session.exitProduct = true;
      res.redirect("/admin/add-products");
    } else {
      await product.insertMany(addProduct);

      req.session.addProduct = true;
      res.redirect("/admin/add-products");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadEditProduct
const loadEditProduct = async (req,res) => {
  try{
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const categorys = await category.find();
    const id = req.query.id;
    const productId = await product.findById({_id:id}).populate('categoryId');
    if(req.session.editProduct){
      req.session.editProduct=false;
    res.render('editProduct',{admins:adminData,message:'Product Edited',category:categorys,product:productId});
    }else{
      res.render('editProduct',{admins:adminData,category:categorys,product:productId});
    }
  }catch(error){
    console.log(error.message);
  }
};

// verifyEditProduct
const verifyEditProduct = async (req,res) => {
  try{

    const images = [];
    const files = req.files;

    files.forEach((files) => {
      images.push(files.filename);
    });


    const categorys = await category.findOne({name:req.body.category});
    const id = req.query.id;
    const update = {
      name: req.body.name,
      brand: req.body.brand,
      categoryId: categorys._id,
      rating: req.body.rating,
      price: req.body.price,
      quantity: req.body.quantity,
      image: images,
      description: req.body.description,
    }



    await product.findByIdAndUpdate({_id:id},{$set:update});
    req.session.editProduct=true;
    res.redirect(`/admin/edit-products?id=${id}`);
  }catch(error){
    console.log(error.message);
  }
}

// deleteProduct
const verifyDeleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const deleteProduct = await product.deleteOne({ _id: id });
    if (deleteProduct) {
      res.send({ deleteProduct });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadProducts,
  loadAddProducts,
  verifyAddProducts,
  verifyDeleteProduct,
  loadEditProduct,
  verifyEditProduct,
}