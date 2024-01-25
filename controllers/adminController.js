const admin = require("../models/adminModel");
const multer = require("../middleware/multer");
const user = require("../models/userModel");
const product = require("../models/productsModel");
const category = require("../models/categoryModel");
const bcrypt = require("bcrypt");

// hashPassword
const securePassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.log(error.message);
  }
};

// loadLogin
const loadLogin = (req, res) => {
  try {
    if (req.session.passErr) {
      req.session.passErr = false;
      res.render("login", { message: "Invalied Password" });
    } else if (req.session.err) {
      req.session.err = false;
      res.render("login", { message: "Invalied Username" });
    } else {
      res.render("login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifyLogin
const verifyLogin = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const adminData = await admin.findOne({ username: username });

    if (adminData) {
      const isPasswordMatch = await bcrypt.compare(
        password,
        adminData.password
      );
      if (isPasswordMatch) {
        req.session.admin_id = adminData._id;
        res.redirect("/admin/dashboard");
      } else {
        req.session.passErr = true;
        res.redirect("/admin");
      }
    } else {
      req.session.err = true;
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loadDashboard
const loadDashboard = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    res.render("dashboard", { admins: adminData });
  } catch (error) {
    console.log(error.message);
  }
};

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

// adminLogout
const adminLogout = async (req, res) => {
  try {
    delete req.session.admin_id;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

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
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadUserDetials,
  loadProducts,
  loadAddProducts,
  verifyAddProducts,
  loadCategory,
  loadAddCategory,
  verifyAddCategory,
  verifyBlockUser,
  adminLogout,
  verifyDeleteProduct,
  deleteCategory,
};
