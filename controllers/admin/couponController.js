const admin = require("../../models/adminModel");
const Coupon = require("../../models/couponModel");

const validation = (couponCode,discount,expire,discription,quantity) => {

  if (!couponCode || !discount || !expire || !discription || !quantity) {
    return "All Fields are require or Invaled Field" 
  }

  const couponCodeRegex = /^[a-zA-Z0-9]{10}$/;
  if (!couponCodeRegex.test(couponCode)) {
    return "Invalid coupon code format" 
  }

  if(discount>200){
    return "Maximun discount amount is 200";
  }

  if(discount<5){
    return "Minimun discount amount is 5";
  }

  const discountValue = parseFloat(discount);
  if(isNaN(discountValue) || discountValue<=0){
    return "Dicount must be a positive number" 
  }

  const quantityValue = parseFloat(quantity);
  if(isNaN(quantityValue)||quantity<0){
    return "Quantity must be a positive number" 
  }

  const expiryDataRegex = /^\d{4}-\d{2}-\d{2}$/;
  if(!expiryDataRegex.test(expire)){
    return "Invalid expiry date format" 
  }

  return false
};

// loading coupon page
const loadCouponDetials = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const page = 1;
    const limit = 10;
    const startIndex = (page-1)*limit;
    const coupon = await Coupon.find().skip(startIndex).limit(limit).sort({createDate:-1});
    const totalCouponCount = await Coupon.countDocuments();
    const hasNextPage = totalCouponCount > limit * page;
    res.render("coupen", { admins: adminData,coupon:coupon,hasNextPage,totalCouponCount });
  } catch (error) {
    console.log(error.message);
  }
};

// verfify adding coupon
const verifyAddCoupon = async (req, res) => {
  try {
    const { couponCode, discount, expire, discription,quantity } = req.body;

    const validationResult = validation(couponCode,discount,expire,discription,quantity);

    if(validationResult){
      res.json({message:validationResult});
    }else{
      const coupon = new Coupon({
        couponCode: couponCode,
        discountAmount: discount,
        description: discription,
        quantity: quantity,
        expireDate: new Date(expire).setHours(23,59,59,999),
      });

       await coupon.save();
      res.json({ status: true });
    }

  } catch (error) {
    console.log(error.message);
  }
};

// verify editng coupon getting datas
const verifyEditCoupon = async (req,res) => {
  try{
    const {id}=req.body;
    const findCoupon = await Coupon.findOne({_id:id});
    res.json({data:findCoupon});
  }catch(error){
    console.log(error.message);
  }
};

// verify editing coupon
const verifyEditCouponConfirm = async (req,res) => {
  try{
    const {id}=req.body;
    const {couponCode, discount, expire, discription,quantity}=req.body.jsonData;
    const validationResult = validation(couponCode,discount,expire,discription,quantity);

    if(validationResult){
      res.json({message:validationResult});
    }else{
      const coupon = await Coupon.findOne({_id:id});

      if(coupon.couponCode==couponCode&&coupon.discountAmount==discount&&coupon.expireDate.toDateString()==new Date(expire).toDateString()&&coupon.description==discription&&coupon.quantity==quantity){
        return res.json({message:'No Changes made'});
      }

      const update = {
        couponCode:couponCode,
        discountAmount:discount,
        expireDate:new Date(expire).setHours(23,59,59,999),
        description:discription,
        quantity:quantity,
      }

      await Coupon.updateOne({_id:id},{$set:update});
      res.json({status:true})
    }
  }catch(error){
    console.log(error.message);
  }
};

// deleting coupons
const deleteCoupon = async (req,res) => {
  try{
    const {id}=req.query;
    await Coupon.deleteOne({_id:id});
    res.json({status:'deleted'});
  }catch(error){
    console.log(error.message);
  }
};

// to get the search in coupon list
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
    const coupons = await Coupon.find({$or:[{couponCode:regexPattern},{description:regexPattern}]}).skip(startIndex).limit(limit).sort({createDate:-1});
    const allCoupon = await Coupon.find().skip(startIndex).limit(limit).sort({createDate:-1});
    const totalCouponCount = await Coupon.find({$or:[{couponCode:regexPattern},{description:regexPattern}]}).countDocuments();
    const AlltotalCouponCount = await Coupon.countDocuments();
    const hasNextPage = searchValue ?  totalCouponCount > limit * pageInt : AlltotalCouponCount > limit * pageInt;
    res.json({coupon:searchValue?coupons:allCoupon, nextPage:hasNextPage ,page:pageInt});
  }catch(error){
    console.log(error.message);
  }
}

module.exports = {
  loadCouponDetials,
  verifyAddCoupon,
  verifyEditCoupon,
  verifyEditCouponConfirm,
  deleteCoupon,
  getSearchData,
};
