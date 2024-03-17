const admin = require("../../models/adminModel");
const multer = require("../../middleware/multer");
const product = require("../../models/productsModel");
const category = require("../../models/categoryModel");
const fs = require('fs');
const path = require('path');
const imagePath = path.join(__dirname,'../../public/images/productImages/');
const mongoose = require("mongoose");

// loadProducts
const loadProducts = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const products = await product.find();
    res.render("products", { admins: adminData, product: products});
  } catch (error) {
    console.log(error.message);
  }
};

// loadAddProducts
const loadAddProducts = async (req, res) => {
  try {
    const { message, message1 } = req.flash();
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const categorys = await category.find();

    res.render("addProducts", {
      admins: adminData,
      category: categorys,
      message,
      message1,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// verifyAddProducts
const verifyAddProducts = async (req, res) => {
  try {
    const { name, brand, rating, price, quantity, description } = req.body;
    const categorys = await category.findOne({ name: req.body.category });

    if (
      !name ||
      !brand ||
      !rating ||
      !price ||
      !quantity ||
      !description ||
      !req.body.category
    ) {
      req.flash("message1", "All Fields Are Require!");
      return res.redirect("/admin/add-products");
    }

    const quantityValue = parseFloat(quantity);
    const priceValue = parseFloat(price);
    if (
      isNaN(quantityValue) ||
      quantity < 0 ||
      isNaN(priceValue) ||
      price < 0
    ) {
      req.flash("message1", "Quantity must be a positive number!");
      return res.redirect("/admin/add-products");
    }

    if (!req.files || req.files.length === 0) {
      req.flash("message1", "Images are required!");
      return res.redirect(`/admin/add-products`);
    }

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
      req.flash("message1", "Product Already Exist!");
      return res.redirect("/admin/add-products");
    }
    await product.insertMany(addProduct);

    req.flash("message", "Product Added");
    res.redirect("/admin/add-products");
  } catch (error) {
    console.log(error.message);
  }
};

// loadEditProduct
const loadEditProduct = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const categorys = await category.find();
    const { message, message1 } = req.flash();
    const id = req.query.id;
    const productId = await product
      .findById({ _id: id })
      .populate("categoryId");

    res.render("editProduct", {
      admins: adminData,
      category: categorys,
      product: productId,
      message,
      message1,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// verifyEditProduct
const verifyEditProduct = async (req, res) => {
  try {
    const { name, brand, rating, price, quantity, description } = req.body;
    const id = req.query.id;

    const existingProduct = await product.findOne({
      name: name,
      _id: { $ne: id },
    });

    if (existingProduct) {
      req.flash("message1", "Product Already Exist");
      return res.redirect(`/admin/edit-products?id=${id}`);
    }

    if (
      !name ||
      !brand ||
      !rating ||
      !price ||
      !quantity ||
      !description ||
      !req.body.category
    ) {
      req.flash("message1", "All Fields Are Require!");
      return res.redirect(`/admin/edit-products?id=${id}`);
    }

    const quantityValue = parseFloat(quantity);
    const priceValue = parseFloat(price);
    if (
      isNaN(quantityValue) ||
      quantity < 0 ||
      isNaN(priceValue) ||
      price < 0
    ) {
      req.flash("message1", "Quantity must be a positive number!");
      return res.redirect(`/admin/edit-products?id=${id}`);
    }

    const categorys = await category.findOne({ name: req.body.category });

    const update = {
      name: name,
      brand: brand,
      categoryId: categorys._id,
      rating: rating,
      price: price,
      quantity: quantity,
      description: description,
    };

    await product.findByIdAndUpdate({ _id: id }, { $set: update });
    req.flash("message", "Product Added");
    res.redirect(`/admin/edit-products?id=${id}`);
  } catch (error) {
    console.log(error.message);
  }
};

// Edite iamge
const verifyEditImage = async (req, res) => {
  try {
    const file = req.file;
    const { index, id } = req.query;
    const proImage = await product.findOne({_id:id}); 
    fs.unlink(imagePath+proImage.image[index],(err)=>{
      if(err){
        console.log(err.message);
      }
    });
    await product.updateOne(
      { _id: id },
      { $set: { ["image." + index]: file.filename } }
    );
    res.json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

// deleteProduct
const verifyDeleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const proImage = await product.findOne({_id:id});
    proImage.image.forEach(element => {
      fs.unlink(imagePath+element,(err)=>{
        if(err){
          console.log(err.message);
        }
      });
    });
    const deleteProduct = await product.deleteOne({ _id: id });
    if (deleteProduct) {
      res.send({ deleteProduct });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Delete image
const deleteImages = async (req, res) => {
  try {
    const { i, id } = req.body;

    const findImage = await product.findOne({ _id: id });

    if (findImage.image.length === 1) {
      return res.json({ status: false });
    }

    fs.unlink(imagePath+findImage.image[i],(err)=>{
      if(err){
        console.log(err.message);
      }
    });

    const imageToRevmove = findImage.image[i];
    await product.updateOne({ _id: id }, { $pull: { image: imageToRevmove } });

    res.json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

// add image
const addImages = async (req,res) => {
  try{
    const {id}=req.query;
    const file = req.file;
    await product.updateOne({_id:id},{$push:{image:file.filename}});
    res.json({status:true});
  }catch(error){
    console.log(error.message);
  }
};

// to get the search in products list
const getSearchData = async (req,res) => {
  try{
    const {searchValue,page}=req.query;
    let pageInt = parseInt(page);
    if(pageInt<=0){
      pageInt=1;
    }
    const limit = 2;
    const startIndex = (pageInt-1)*limit;
    const regexPattern = new RegExp(searchValue,'i');
    const products = await product.find({$or:[{name:regexPattern},{brand:regexPattern},{"categoryId.name":regexPattern}]}).populate('categoryId').skip(startIndex).limit(limit).sort({name: -1, brand: -1, "categoryId.name": -1});
    const allProducts = await product.find().populate('categoryId').skip(startIndex).limit(limit).sort({name:-1});
    const totalProductsCount = await product.find({name:regexPattern}).countDocuments();
    const AlltotalProductsCount = await product.countDocuments();
    const hasNextPage = searchValue ?  totalProductsCount > limit * pageInt : AlltotalProductsCount > limit * pageInt;
    res.json({products:searchValue?products:allProducts, nextPage:hasNextPage ,page:pageInt});
  }catch(error){
    console.log(error.message);
  }
}

module.exports = {
  loadProducts,
  loadAddProducts,
  verifyAddProducts,
  verifyDeleteProduct,
  loadEditProduct,
  verifyEditProduct,
  verifyEditImage,
  deleteImages,
  addImages,
  getSearchData,
};
