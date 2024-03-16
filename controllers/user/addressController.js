const Address = require("../../models/addressModel");
const Order = require('../../models/orderModel');
const { updateMany } = require("../../models/userModel");

//loadAddress
const loadAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ userId: req.session.user._id });
    const message = req.flash("message");
    res.render("address", {
      user: req.session.user,
      address: address,
      message,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//add addresss
const loadAddAddress = async (req, res) => {
  try {
    res.render("addAddress", { user: req.session.user });
  } catch (error) {
    console.log(error.message);
  }
};

const checkAddress = async (req,res) => {
  try{
    const address = await Address.findOne({userId:req.session.user._id});
    if(address && address.address.length>=3){
      res.json({status:true});
    }else{
      res.json({status:false});
    }
  }catch(error){
    console.log(error.message);
  }
}

// Verify add address
const verifyAddAddress = async (req, res) => {
  try {
    const { name, email, mobile, address, pincode, state, city } = req.body;
    const existing = await Address.findOne({ userId: req.session.user._id });
    const update = {
      name: name,
      email: email,
      mobile: mobile,
      address: address,
      pincode: pincode,
      state: state,
      city: city,
    };
    if (existing) {
      await Address.updateOne(
        { userId: req.session.user._id },
        { $push: { address: update } }
      );

        req.flash("message", "Address Added");
        res.redirect("/address");

    } else {
      const addAddress = new Address({
        userId: req.session.user._id,
        address: [update],
      });

      await addAddress.save();

        req.flash("message", "Address Added");
        res.redirect("/address");

    }
  } catch (error) {
    console.log(error.message);
  }
};

// Delete address
const verifyDeleteAddress = async (req, res) => {
  try {
    const id = req.body.id;
    const data = await Address.updateOne(
      { userId: req.session.user._id },
      { $pull: { address: { _id: id } } }
    );
    if (data) {
      res.send({ data });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Edit Address
const loadEditAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const address = await Address.findOne(
      { userId: req.session.user._id },
      { address: { $elemMatch: { _id: id } } }
    );
    res.render("editAddress", {
      user: req.session.user,
      address: address.address[0],
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Verify edit Address
const verifyEditAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const { name, email, mobile, address, pincode, state, city } = req.body;
    const update = {
      "address.$.name": name,
      "address.$.email": email,
      "address.$.mobile": mobile,
      "address.$.address": address,
      "address.$.pincode": pincode,
      "address.$.state": state,
      "address.$.city": city,
    };
    const data = await Address.updateOne(
      { userId: req.session.user._id, "address._id": id },
      { $set: update }
    );
    req.flash("message", "address edited");
    res.redirect("/address");
  } catch (error) {
    console.log(error.message);
  }
};

//add addresss checkout
const loadCheckoutAddAddress = async (req, res) => {
  try {
    res.render("addAddress", { user: req.session.user ,status:true});
  } catch (error) {
    console.log(error.message);
  }
};

// Verify add address checkout
const verifyCheckoutAddAddress = async (req, res) => {
  try {
    const { name, email, mobile, address, pincode, state, city } = req.body;
    const existing = await Address.findOne({ userId: req.session.user._id });
    const update = {
      name: name,
      email: email,
      mobile: mobile,
      address: address,
      pincode: pincode,
      state: state,
      city: city,
    };
    if (existing) {
      await Address.updateOne(
        { userId: req.session.user._id },
        { $push: { address: update } }
      );

        req.flash("message1", "Address Added");
        res.redirect("/checkout");

    } else {
      const addAddress = new Address({
        userId: req.session.user._id,
        address: [update],
      });

      await addAddress.save();
 
        req.flash("message1", "Address Added");
        res.redirect("/checkout");
      
    }
  } catch (error) {
    console.log(error.message);
  }
};

// change Address 
const loadChangeAddress = async (req,res) => {
  try{
    const id = req.query.id;
    const address = await Address.findOne({userId:req.session.user._id});
    res.render('changeAddress',{user:req.session.user._id,address:address,id:id});
  }catch(error){
    console.log(error.message);
  };
};

const verifyChangeAddress = async (req,res) => {
  try{
    const orderId=req.body.order;
    const id=req.query.id;
    const updateOrderAddress = await  Address.findOne({userId:req.session.user._id,'address._id':id},{'address.$':1,_id:0});
     await Order.updateOne({_id:orderId},{$set:{deliveryAddress:updateOrderAddress.address[0]}});
     res.redirect(`/order-detials?id=${orderId}`);
  }catch(error){
    console.log(error.message);
  }
};

// change add address
const loadChangeAddAddress = async (req, res) => {
  try {
    res.render("addAddress", { user: req.session.user ,change:true});
  } catch (error) {
    console.log(error.message);
  }
};

// chaneg add address verify
const verifyChangeAddAddress = async (req, res) => {
  try {
    const { name, email, mobile, address, pincode, state, city } = req.body;
    const existing = await Address.findOne({ userId: req.session.user._id });
    const update = {
      name: name,
      email: email,
      mobile: mobile,
      address: address,
      pincode: pincode,
      state: state,
      city: city,
    };
    if (existing) {
      await Address.updateOne(
        { userId: req.session.user._id },
        { $push: { address: update } }
      );

        req.flash("message", "Address Added");
        res.redirect("/change-address");

    } else {
      const addAddress = new Address({
        userId: req.session.user._id,
        address: [update],
      });

      await addAddress.save();
 
        req.flash("message", "Address Added");
        res.redirect("/change-address");
      
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadAddress,
  checkAddress,
  loadAddAddress,
  verifyAddAddress,
  verifyDeleteAddress,
  loadEditAddress,
  verifyEditAddress,
  verifyCheckoutAddAddress,
  loadCheckoutAddAddress,
  loadChangeAddress,
  verifyChangeAddress,
  loadChangeAddAddress,
  verifyChangeAddAddress
};
