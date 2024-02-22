const Category = require('../../models/categoryModel');
const Product = require('../../models/productsModel');
const Offer = require('../../models/offerModel');
const Admin = require('../../models/adminModel');

const validation = (offerTitle,offerType,discountPercentage,startDate,endDate,description)=>{
  
  if (!offerTitle||!offerType||!discountPercentage||!startDate||!endDate||!description) {
    return "All Fields are require or Invaled Field" 
  }


  if(isNaN(discountPercentage) || discountPercentage<=0){
    return "Dicount must be a positive number" 
  }


  if(isNaN(discountPercentage) || discountPercentage>100){
    return "Dicount must be a 0 - 100" 
  }

  const expiryDataRegex = /^\d{4}-\d{2}-\d{2}$/;
  if(!expiryDataRegex.test(endDate)||!expiryDataRegex.test(startDate)){
    return "Invalid expiry date format" 
  }

  return false
}

const validationEdit = (editOfferTitle,editDiscountPercentage,editStartDate,editEndDate,editDescription)=>{


  if (!editOfferTitle||!editDiscountPercentage||!editStartDate||!editEndDate||!editDescription) {
    return "All Fields are require or Invaled Field" 
  }
 
  if(isNaN(editDiscountPercentage) || editDiscountPercentage<=0){
    return "Dicount must be a positive number" 
  }


  if(isNaN(editDiscountPercentage) || editDiscountPercentage>100){
    return "Dicount must be a 0 - 100" 
  }

  const expiryDataRegex = /^\d{4}-\d{2}-\d{2}$/;
  if(!expiryDataRegex.test(editEndDate)||!expiryDataRegex.test(editStartDate)){
    return "Invalid expiry date format" 
  }

  return false
}

const loadOffers = async (req,res) => {
  try{
    const admin = await Admin.findOne({_id:req.session.admin_id})
    const offer = await Offer.find();
    res.render('offer',{admins:admin,offer:offer});
  }catch(error){
    console.log(error.message)
  }
};

const getCategoriesAndProduct = async (req,res) => {
  try{
    const {value}=req.body;
    if(value==='category'){
      const category = await Category.find({},{name:1,_id:0});
      res.json({category});
    }else if(value==='product'){
      const product = await Product.find({},{name:1,_id:0});
      res.json({product})
    }
  }catch(error){
    console.log(error.message)
  }
};

const verifyOffer = async (req,res) =>{
  try{
    const {offerTitle,offerType,category,product,discountPercentage,startDate,endDate,description}=req.body;
    
    const validationResult = validation(offerTitle,offerType,discountPercentage,startDate,endDate,description);

    if(validationResult){
      res.json({message:validationResult})
    }else{
      const offer = new Offer({
        offerTitle:offerTitle,
        offerType:offerType,
        discountPercentage:discountPercentage,
        description:description,
        startDate:new Date(startDate).setHours(23,59,59,999),
        endDate:new Date(endDate).setHours(23,59,59,999),
        createAt:new Date(),
      });

      if(offerType==='category'){
        await Category.updateOne({name:category},{$set:{offer:offer._id}})
      }else if(offerType==='product'){
        await Product.updateOne({name:product},{$set:{offer:offer._id}})  
      }
      await offer.save();
      res.json({status:true});
    }

  }catch(error){
    console.log(error.message);
  }
};

const deleteOffer = async (req,res) =>{
  try{
    const {id}=req.query;
    await Category.updateMany({offer:id},{$unset:{offer:1}});
    await Product.updateMany({offer:id},{$unset:{offer:1}});
    await Offer.deleteOne({_id:id});
    res.json({status:true});
  }catch(error){
    console.log(error.message);
  }
};

const editOffer = async (req,res) => {
  try{
    const {id}=req.body;
    const offer = await Offer.findOne({_id:id});
    res.json({data:offer});
  }catch(error){
    console.log(error.message)
  }
};

const verifyEditOffer = async (req,res) => {
  try{
    const {id}=req.body;
    const {editOfferTitle,editDiscountPercentage,editStartDate,editEndDate,editDescription} = req.body.jsonData;
    const validationResult = validationEdit(editOfferTitle,editDiscountPercentage,editStartDate,editEndDate,editDescription);

    if(validationResult){
      res.json({message:validationResult});
    }else{
      const offer = await Offer.findOne({_id:id});

      if(offer.offerTitle==editOfferTitle&&offer.discountPercentage==editDiscountPercentage&&offer.startDate.toDateString()==new Date(editStartDate).toDateString()&&offer.endDate.toDateString()==new Date(editEndDate).toDateString()&&offer.description==editDescription){
        return res.json({message:'No Changes Made'});
      }

      const update = {
        offerTitle:editOfferTitle,
        discountPercentage:editDiscountPercentage,
        startDate:new Date(editStartDate).setHours(23,59,59,999),
        endDate:new Date(editEndDate).setHours(23,59,59,999),
        description:editDescription,
      }

      await Offer.updateOne({_id:id},{$set:update});
      res.json({status:true});
    }

  }catch(error){
    console.log(error.message);
  }
}
 
module.exports = {
  loadOffers,
  getCategoriesAndProduct,
  verifyOffer,
  deleteOffer,
  editOffer,
  verifyEditOffer,
}