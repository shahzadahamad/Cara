const Address = require('../../models/addressModel');
const { updateMany } = require('../../models/userModel');

//loadAddress
const loadAddress = async (req,res)=>{
  try{
    const address = await Address.findOne({userId:req.session.user._id})
    const message=req.flash('message')
    res.render('address',{user:req.session.user,address:address,message});
  }catch(error){
    console.log(error.message);
  }
};

//add addresss
const loadAddAddress = async (req,res)=>{
  try{
    res.render('addAddress',{user:req.session.user});
  }catch(error){
    console.log(error.message);
  }
};

// Verify add address
const verifyAddAddress = async (req,res)=>{
  try{
    const {name,email,mobile,address,pincode,state,city}=req.body;
    const existing = await Address.findOne({userId:req.session.user._id});
    const update ={
      name:name,
      email: email,
      mobile: mobile,
      address: address,
      pincode: pincode,
      state:state,
      city:city,
    }
    if(existing){
      await Address.updateOne({userId:req.session.user._id},{$push:{address:update}})
      req.flash('message','Address Added');
      res.redirect('/address');
    }else{
      const addAddress = new Address({
        userId:req.session.user._id,
        address:[update]
      });
  
      await addAddress.save();
      req.flash('message','Address Added');
      res.redirect('/address');
    }
  
  }catch(error){
    console.log(error.message);
  }
};

// Delete address
const verifyDeleteAddress = async (req,res) => {
  try{
    const id = req.body.id;
    const data = await Address.updateOne({userId:req.session.user._id},{$pull:{address:{_id:id}}});
    if(data){
      res.send({data});
    }
  }catch(error){
    console.log(error.message);
  }
};

// Edit Address
const loadEditAddress = async (req,res) => {
  try{
    const id = req.query.id;
    const address = await Address.findOne({userId:req.session.user._id},{address:{$elemMatch:{_id:id}}});
    res.render('editAddress',{user:req.session.user,address:address.address[0]});
  }catch(error){
    console.log(error.message);
  }
};

// Verify edit Address
const verifyEditAddress = async (req,res) => {
  try{
    const id = req.query.id;
    const {name,email,mobile,address,pincode,state,city}=req.body;
    const update ={
      'address.$.name':name,
      'address.$.email': email,
      'address.$.mobile': mobile,
      'address.$.address': address,
      'address.$.pincode': pincode,
      'address.$.state':state,
      'address.$.city':city,
    }
    const data = await Address.updateOne({userId:req.session.user._id,'address._id':id},{$set:update});
    req.flash('message','address edited');
    res.redirect('/address');
  }catch(error){
    console.log(error.message);
  }
};

module.exports ={
  loadAddress,
  loadAddAddress,
  verifyAddAddress,
  verifyDeleteAddress,
  loadEditAddress,
  verifyEditAddress
};