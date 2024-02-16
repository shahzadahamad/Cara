const Wallet = require("../../models/walletModel");
const Razorpay = require("../../controllers/user/checkoutController");

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

const verifySuccessAddMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    await Wallet.updateOne(
      { userId: req.session.user._id },
      {
        $inc: { totalAmount: amount },
        $push: {
          transactions: {
            type: "credit",
            amount: amount,
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

module.exports = {
  loadWallet,
  verifyAddMoney,
  verifySuccessAddMoney,
};
