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
    const {message,message1} = req.flash();
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const categorys = await category.find();

      res.render("addProducts", { admins: adminData, category: categorys ,message,message1});
    
  } catch (error) {
    console.log(error.message);
  }
};

// verifyAddProducts
const verifyAddProducts = async (req, res) => {
  try {
    const {name,brand,rating,price,quantity,description}=req.body
    const categorys = await category.findOne({ name: req.body.category });

    if(!name||!brand||!rating||!price||!quantity||!description||!req.body.category){
      req.flash('message1','All Fields Are Require!');
      return res.redirect('/admin/add-products')
    }

    const quantityValue = parseFloat(quantity);
    const priceValue = parseFloat(price);
    if(isNaN(quantityValue)||quantity<0||isNaN(priceValue)||price<0){
      req.flash('message1','Quantity must be a positive number!');
      return res.redirect('/admin/add-products');
    }  

    if (!req.files || req.files.length === 0) {
      req.flash('message1', 'Add Images At Least One!');
      return res.redirect(`/admin/add-products`);
    }

    const {}=req.body

    const images = [];
    const files = req.files;

    files.forEach((files) => {
      images.push(files.filename);
    });

    const addProduct = new product({
      name: name,
      brand: brand,
      categoryId: categorys._id,
      rating: rating,
      price: price,
      quantity: quantity,
      image: images,
      description: description,
    });

    const existingProduct = await product.findOne({ name: addProduct.name });

    if (existingProduct) {
      req.flash('message1','Product Already Exist!')
      return res.redirect("/admin/add-products");
    } 
      await product.insertMany(addProduct);

      req.flash('message','Product Added');
      res.redirect("/admin/add-products");
    
  } catch (error) {
    console.log(error.message);
  }
};

// loadEditProduct
const loadEditProduct = async (req,res) => {
  try{
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const categorys = await category.find();
    const {message,message1}=req.flash()
    const id = req.query.id;
    const productId = await product.findById({_id:id}).populate('categoryId');

    res.render('editProduct',{admins:adminData,category:categorys,product:productId,message,message1});
    
  }catch(error){
    console.log(error.message);
  }
};

// verifyEditProduct
const verifyEditProduct = async (req,res) => {
  try{

    const {name,brand,rating,price,quantity,description}=req.body
    const id = req.query.id;

    const existingProduct = await product.findOne({name:name ,_id:{$ne:id}});

    if(existingProduct){
      req.flash('message1','Product Already Exist');
      return res.redirect(`/admin/edit-products?id=${id}`);
    }

    if(!name||!brand||!rating||!price||!quantity||!description||!req.body.category){
      req.flash('message1','All Fields Are Require!');
      return res.redirect(`/admin/edit-products?id=${id}`)
    }

    const quantityValue = parseFloat(quantity);
    const priceValue = parseFloat(price);
    if(isNaN(quantityValue)||quantity<0||isNaN(priceValue)||price<0){
      req.flash('message1','Quantity must be a positive number!');
      return res.redirect(`/admin/edit-products?id=${id}`);
    }  

    if (!req.files || req.files.length === 0) {
      req.flash('message1', 'Add Images At Least One!');
      return res.redirect(`/admin/edit-products?id=${id}`);
    }

    const images = [];
    const files = req.files;

    files.forEach((files) => {
      images.push(files.filename);
    });

    const categorys = await category.findOne({name:req.body.category});
    
    const update = {
      name: name,
      brand: brand,
      categoryId: categorys._id,
      rating: rating,
      price: price,
      quantity: quantity,
      image: images,
      description: description,
    }



    await product.findByIdAndUpdate({_id:id},{$set:update});
    req.flash('message','Product Added');
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