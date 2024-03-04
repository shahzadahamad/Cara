const Wishlist = require("../../models/wishlistModel");

const loadWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find(
      { userId: req.session.user._id },
      { products: 1, _id: 0 }
    ).populate({
        path: "products.productId",
        populate: {
          path: "offer",
        },
      })
      .populate({
        path: "products.productId",
        populate: {
          path: "categoryId",
          populate: {
            path: "offer",
          },
        },
      });
    res.render("wishlist", {
      login: req.session.user,
      wishlist: wishlist[0],
      data: new Date(),
    });
  } catch (error) {
    console.log(error.message);
  }
};

const verifyWishlist = async (req, res) => {
  try {
    if (req.session.user) {
      const { id } = req.body;
      const wishlist = await Wishlist.findOne({
        userId: req.session.user._id,
        "products.productId": id,
      });
      if (wishlist) {
        res.json({ status: false });
      } else {
        await Wishlist.updateOne(
          { userId: req.session.user._id },
          { $push: { products: { productId: id } } },
          { upsert: true }
        );
        res.json({ status: true });
      }
    } else {
      res.json({ login: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;

    const w = await Wishlist.updateOne(
      { userId: req.session.user._id },
      { $pull: { products: { _id: id } } }
    );
    res.json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadWishlist,
  verifyWishlist,
  removeProduct,
};
