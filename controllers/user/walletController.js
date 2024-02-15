const Wallet = require('../../models/walletModel');

const loadWallet = async (req,res) => {
  try{
    const wallet = await Wallet.findOne({userId:req.session.user._id});
    console.log(wallet)
    res.render('wallet',{user:req.session.user,wallet:wallet});
  }catch(error){
    console.log(error.message);
  }
}

module.exports = {
  loadWallet,
}