const Order = require('../../models/orderModel');

// Order detials 
const loadOrder = async (req,res) => {
  try{
    const order = await Order.find({userId:req.session.user._id}).populate('userId orderItems.productId');
    res.render('orderDetials',{user:req.session.user,order:order});
  }catch(error){
    console.log(error.message)
  }
};

// Order full Detials
const loadOrderDetials = async (req,res) => {
  try{
    const id = req.query.id;
    const order = await Order.find({_id:id}).populate('userId orderItems.productId');
    res.render('orderFullDetials',{user:req.session.user,order:order});
  }catch(error){
    console.log(error.message)
  }
};

// cancel page
const loadCancelPage = async (req,res) => {
  try{
    const {id}=req.query;
    const message = req.flash('message');
    const _id = await Order.findOne({_id:id},{_id:1});
    res.render('orderCancel',{user:req.session.user,id:_id.id,message});
  }catch(error){
    console.log(error.message);
  }
};

// verify cancel page
const verifyCancelPage = async (req,res) => {
  try{
    const {id} = req.query;
    const {reason}=req.body;

    if(!reason){
      req.flash('message','Please give a reason');
      return res.redirect(`/cancel-order?id=${id}`);
    }
    const update = {
      orderStatus:'Cancelled',
      cancelReason:reason,
      cancelDate:new Date
    }
    await Order.updateOne({_id:id},{$set:update});
    res.redirect('/order');
  }catch(error){
    console.log(error.message);
  }
};

module.exports = {
  loadOrderDetials,
  loadOrder,
  loadCancelPage,
  verifyCancelPage,
}