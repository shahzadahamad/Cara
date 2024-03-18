const Wallet = require("../../models/walletModel");
const Razorpay = require("../../controllers/user/checkoutController");

// loading wallet
const loadWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.session.user._id });
    if (wallet) {
      res.render("wallet", { user: req.session.user, wallet: wallet });
    } else {
      res.render("wallet", { user: req.session.user });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Adding Money to Wallet
const verifyAddMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    const razorpay = await Razorpay.razorpay();

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt#1",
    };

    const response = razorpay.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          key: razorpay.key_id,
          orderId: order.id,
          amount: amount * 100,
          cusName: req.session.user.fullname,
          cusEmail: req.session.user.email,
          cusContact: req.session.user.mobile,
        });
      } else {
        res.status(500).send({ msg: "Something went wrong" });
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500);
  }
};

// Adding money success
const verifySuccessAddMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    await Wallet.updateOne(
      { userId: req.session.user._id },
      {
        $inc: { totalAmount: amount },
        $push: {
          transactions: {
            type: "Credit",
            amount: amount,
            reason:'Add Money To Wallet',
            transactionDate: new Date(),
          },
        },
      },
      {
        upsert:true,
      }
    );
    res.json({status:true})
  } catch (error) {
    console.log(error.message);
  }
};

// Get transaction detials for showing transactions
const getTransactionData = async (req,res) => {
  try{
    const {currentPage}=req.body;
    const pageLimit = 8;
    const wallet = await Wallet.findOne({ userId: req.session.user._id });
    const totalPages = Math.ceil(wallet.transactions.length/pageLimit);
    const start = currentPage * pageLimit;
    const end = (currentPage + 1)* pageLimit;
    const limitedTransactions = wallet.transactions.sort((a, b) => b.transactionDate - a.transactionDate).slice(start,end);
    res.json({wallet:limitedTransactions,totalPages});
  }catch(error){
    console.log(error.message);
  }
};

module.exports = {
  loadWallet,
  verifyAddMoney,
  verifySuccessAddMoney,
  getTransactionData,
};
