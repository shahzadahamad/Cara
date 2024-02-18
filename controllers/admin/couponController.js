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

  const discountValue = parseFloat(discount);
  if(isNaN(discountValue) || discountValue<=0){
    return "Dicount must be a positive number" 
  }

  const quantityValue = parseFloat(quantity);
  if(isNaN(quantityValue)||quantity<=0){
    return "Quantity must be a positive number" 

  }

  const expiryDataRegex = /^\d{4}-\d{2}-\d{2}$/;
  if(!expiryDataRegex.test(expire)){
    return "Invalid expiry date format" 
  }

  return false
}

const loadCouponDetials = async (req, res) => {
  try {
    const adminData = await admin.findById({ _id: req.session.admin_id });
    const coupon = await Coupon.find();

    res.render("coupen", { admins: adminData,coupon:coupon });
  } catch (error) {
    console.log(error.message);
  }
};

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

const verifyEditCoupon = async (req,res) => {
  try{
    const {id}=req.body;
    const findCoupon = await Coupon.findOne({_id:id});
    res.json({data:findCoupon});
  }catch(error){
    console.log(error.message);
  }
}

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
}

const deleteCoupon = async (req,res) => {
  try{
    const {id}=req.query;
    await Coupon.deleteOne({_id:id});
    res.json({status:'deleted'});
  }catch(error){
    console.log(error.message);
  }
};

module.exports = {
  loadCouponDetials,
  verifyAddCoupon,
  verifyEditCoupon,
  verifyEditCouponConfirm,
  deleteCoupon,
};
