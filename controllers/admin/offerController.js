const Category = require("../../models/categoryModel");
const Product = require("../../models/productsModel");
const Offer = require("../../models/offerModel");
const Admin = require("../../models/adminModel");

// adding offer validation
const validation = (
  offerTitle,
  offerType,
  discountPercentage,
  startDate,
  endDate,
  description
) => {
  if (
    !offerTitle ||
    !offerType ||
    !discountPercentage ||
    !startDate ||
    !endDate ||
    !description
  ) {
    return "All Fields are require or Invaled Field";
  }

  if (isNaN(discountPercentage) || discountPercentage <= 0) {
    return "Dicount must be a positive number";
  }

  if (isNaN(discountPercentage) || discountPercentage > 100) {
    return "Dicount must be a 0 - 100";
  }

  const expiryDataRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!expiryDataRegex.test(endDate) || !expiryDataRegex.test(startDate)) {
    return "Invalid expiry date format";
  }

  return false;
};

// editing offer validation
const validationEdit = (
  editOfferTitle,
  editDiscountPercentage,
  editStartDate,
  editEndDate,
  editDescription
) => {
  if (
    !editOfferTitle ||
    !editDiscountPercentage ||
    !editStartDate ||
    !editEndDate ||
    !editDescription
  ) {
    return "All Fields are require or Invaled Field";
  }

  if (isNaN(editDiscountPercentage) || editDiscountPercentage <= 0) {
    return "Dicount must be a positive number";
  }

  if (isNaN(editDiscountPercentage) || editDiscountPercentage > 100) {
    return "Dicount must be a 0 - 100";
  }

  const expiryDataRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (
    !expiryDataRegex.test(editEndDate) ||
    !expiryDataRegex.test(editStartDate)
  ) {
    return "Invalid expiry date format";
  }

  return false;
};

// load offer page
const loadOffers = async (req, res) => {
  try {
    const admin = await Admin.findOne({ _id: req.session.admin_id });
    const page = 1;
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const offer = await Offer.find()
      .skip(startIndex)
      .limit(limit)
      .sort({ createAt: -1 });
    const totalOfferCount = await Offer.countDocuments();
    const hasNextPage = totalOfferCount > limit * page;
    res.render("offer", {
      admins: admin,
      offer: offer,
      hasNextPage,
      totalOfferCount,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// verifyOffer
const verifyOffer = async (req, res) => {
  try {
    const {
      offerTitle,
      offerType,
      discountPercentage,
      startDate,
      endDate,
      description,
    } = req.body;

    const validationResult = validation(
      offerTitle,
      offerType,
      discountPercentage,
      startDate,
      endDate,
      description
    );

    if (validationResult) {
      res.json({ message: validationResult });
    } else {
      const offer = new Offer({
        offerTitle: offerTitle,
        offerType: offerType,
        discountPercentage: discountPercentage,
        description: description,
        startDate: new Date(startDate).setHours(23, 59, 59, 999),
        endDate: new Date(endDate).setHours(23, 59, 59, 999),
        createAt: new Date(),
      });
      await offer.save();
      res.json({ status: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// delete Offer
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.query;
    await Category.updateMany({ offer: id }, { $unset: { offer: 1 } });
    await Product.updateMany({ offer: id }, { $unset: { offer: 1 } });
    await Offer.deleteOne({ _id: id });
    res.json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

// editOffer
const editOffer = async (req, res) => {
  try {
    const { id } = req.body;
    const offer = await Offer.findOne({ _id: id });
    res.json({ data: offer });
  } catch (error) {
    console.log(error.message);
  }
};

// verify edit Offer
const verifyEditOffer = async (req, res) => {
  try {
    const { id } = req.body;
    const {
      editOfferTitle,
      editDiscountPercentage,
      editStartDate,
      editEndDate,
      editDescription,
    } = req.body.jsonData;
    const validationResult = validationEdit(
      editOfferTitle,
      editDiscountPercentage,
      editStartDate,
      editEndDate,
      editDescription
    );

    if (validationResult) {
      res.json({ message: validationResult });
    } else {
      const offer = await Offer.findOne({ _id: id });

      if (
        offer.offerTitle == editOfferTitle &&
        offer.discountPercentage == editDiscountPercentage &&
        offer.startDate.toDateString() ==
          new Date(editStartDate).toDateString() &&
        offer.endDate.toDateString() == new Date(editEndDate).toDateString() &&
        offer.description == editDescription
      ) {
        return res.json({ message: "No Changes Made" });
      }

      const update = {
        offerTitle: editOfferTitle,
        discountPercentage: editDiscountPercentage,
        startDate: new Date(editStartDate).setHours(23, 59, 59, 999),
        endDate: new Date(editEndDate).setHours(23, 59, 59, 999),
        description: editDescription,
      };

      await Offer.updateOne({ _id: id }, { $set: update });
      res.json({ status: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// laod choose Offer page
const loadChooseOffer = async (req, res) => {
  try {
    const { id } = req.query;
    const adminData = await Admin.findById({ _id: req.session.admin_id });
    const offer = await Offer.findOne({ _id: id });
    if (offer.offerType === "product") {
      const products = await Product.find();
      res.render("offerProducts", {
        admins: adminData,
        product: products,
        id: id,
      });
    } else if (offer.offerType === "category") {
      const category = await Category.find();
      res.render("offerProducts", {
        admins: adminData,
        category: category,
        id: id,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verify adding offer
const verifyAddingOffer = async (req, res) => {
  try {
    const { _id, type, id, checkbox } = req.body;
    if (type === "category") {
      if (checkbox) {
        await Category.updateOne({ _id: _id }, { $set: { offer: id } });
      } else {
        await Category.updateOne({ _id: _id }, { $unset: { offer: id } });
      }
    } else if (type === "product") {
      if (checkbox) {
        await Product.updateOne({ _id: _id }, { $set: { offer: id } });
      } else {
        await Product.updateOne({ _id: _id }, { $unset: { offer: id } });
      }
    }
    res.json({ status: "success" });
  } catch (error) {
    console.log(error.message);
  }
};

// to get the search in coupon list
const getSearchData = async (req, res) => {
  try {
    const { searchValue, page } = req.query;
    let pageInt = parseInt(page);
    if (pageInt <= 0) {
      pageInt = 1;
    }
    const limit = 10;
    const startIndex = (pageInt - 1) * limit;
    const regexPattern = new RegExp(searchValue, "i");
    const offer = await Offer.find({
      $or: [
        { offerTitle: regexPattern },
        { offerType: regexPattern },
        { description: regexPattern },
      ],
    })
      .skip(startIndex)
      .limit(limit)
      .sort({ createAt: -1 });
    const allOffer = await Offer.find()
      .skip(startIndex)
      .limit(limit)
      .sort({ createAt: -1 });
    const totalOfferCount = await Offer.find({
      $or: [
        { offerTitle: regexPattern },
        { offerType: regexPattern },
        { description: regexPattern },
      ],
    }).countDocuments();
    const AlltotalOfferCount = await Offer.countDocuments();
    const hasNextPage = searchValue
      ? totalOfferCount > limit * pageInt
      : AlltotalOfferCount > limit * pageInt;
    res.json({
      offer: searchValue ? offer : allOffer,
      nextPage: hasNextPage,
      page: pageInt,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// product and category offer adding search
const getSearchChooseData = async (req, res) => {
  try {
    const { type, searchInput } = req.query;
    const regexPattern = new RegExp(searchInput, "i");
    if (type === "product") {
      const product = await Product.find({ name: regexPattern });
      res.json({ product });
    } else if (type === "category") {
      const category = await Category.find({ name: regexPattern });
      res.json({ category });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadOffers,
  verifyOffer,
  deleteOffer,
  editOffer,
  verifyEditOffer,
  loadChooseOffer,
  verifyAddingOffer,
  getSearchData,
  getSearchChooseData,
};
