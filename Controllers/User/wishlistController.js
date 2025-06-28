const Wishlist = require("../../Models/wishlistModel");

////////////////////////////////////// add TO Wishlist /////////////////////////////

async function addTOWishlist(req, res) {
  try {
    const { productId, userId } = req.body;

    // Find the user's wishlist
    let wishlist = await Wishlist.findOne({ userId: userId });

    if (!wishlist) {
      // If no wishlist exists, create a new one
      wishlist = new Wishlist({
        userId: userId,
        items: [
          {
            productId: productId,
          },
        ],
      });
      await wishlist.save();
      return res
        .status(201)
        .json({ message: "Product added to wishlist successfully" });
    } else {
      // Check if the product already exists in the wishlist
      const isProductInWishlist = wishlist.items.some(
        (item) => item.productId.toString() === productId
      );

      if (isProductInWishlist) {
        return res.status(200).json({
          message: "Product already exists in wishlist",
        });
      }

      // Add product to the wishlist if it doesn't already exist
      wishlist.items.push({ productId: productId });
      await wishlist.save();

      return res
        .status(201)
        .json({ message: "Product added to wishlist successfully" });
    }
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

////////////////////////////////////// fetch Wishlist /////////////////////////////

async function fetchWishlist(req, res) {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const wishlist = await Wishlist.findOne({ userId: user_id }).populate({
      path: "items.productId",
      model: "product",
    });

    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }

    return res.status(200).json({ success: true, wishlist });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the wishlist",
      error: err.message,
    });
  }
}

////////////////////////////////////// check Is Exist On WishlistApi /////////////////////////////

async function checkIsExistOnWishlist(req, res) {
  try {
    const { product_id, user_id } = req.params;

    const wishlist = await Wishlist.findOne({ userId: user_id });

    const wishlistValue =
      wishlist &&
      wishlist.items.some((item) => item.productId.toString() === product_id);

    if (wishlistValue) {
      return res.status(200).json({
        success: true,
        message: "Product exists in wishlist",
        wishlistValue,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Product not exists in wishlist",
        wishlistValue,
      });
    }
  } catch (err) {
    console.error("Error checking wishlist:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while checking the wishlist",
      error: err.message,
    });
  }
}

async function removeFromWishlist(req, res) {
  try {
    const { product_id, user_id } = req.params;

    let wishlist = await Wishlist.findOne({ userId: user_id });
    wishlist.items = wishlist.items.filter((item) => {
      return item.productId.toString() !== product_id;
    });

    await wishlist.save();
    return res.status(201).json({ message: "Product removed from wishlist" });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  addTOWishlist,
  fetchWishlist,
  checkIsExistOnWishlist,
  removeFromWishlist,
};
