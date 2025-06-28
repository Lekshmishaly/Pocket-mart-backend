const Cart = require("../../Models/cartModel");
const calculateProductOfferinCart = require("../../Utils/calculateProductOfferinCart");

/////////////////////////////// Add to Cart //////////////////////////////

async function addToCart(req, res) {
  try {
    const { userId, product } = req.body;

    const { productId, size, stock, price, qty } = product;
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [
          {
            productId,
            size,
            stock,
            price,
            qty,
            totalProductPrice: price * qty,
          },
        ],
        totalCartValue: price * qty,
      });

      await cart.save();
      return res
        .status(200)
        .json({ success: true, message: "Item added to cart" });
    } else {
      const isExisting = cart.items.find(
        (item) =>
          item.productId.toString() === productId.toString() &&
          item.size === size
      );

      if (isExisting) {
        isExisting.qty += 1;
        isExisting.totalProductPrice = isExisting.price * isExisting.qty;
        cart.totalCartValue = cart.items.reduce(
          (total, item) => total + item.totalProductPrice,
          0
        );

        await cart.save();
        return res
          .status(200)
          .json({ success: true, message: "Item quantity increased by One" });
      }

      cart.items.push({
        productId,
        size,
        stock,
        price,
        qty,
        totalProductPrice: price * qty,
      });
    }
    cart.totalCartValue = cart.items.reduce(
      (total, item) => total + item.totalProductPrice,
      0
    );

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      items: cart.items,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding to cart",
    });
  }
}

///////////////////////////// check Cart Status /////////////////////////////

async function checkCartStatus(req, res) {
  try {
    const { userId, productId, size } = req.body;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(200).json({ exists: false });
    }

    const isExisting = cart.items.some(
      (item) =>
        item.productId.toString() === productId.toString() && item.size === size
    );

    return res.status(200).json({ exists: isExisting });
  } catch (error) {
    console.error("Error in checkCartStatus:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking cart status",
    });
  }
}

///////////////////////////// Fetch Cart /////////////////////////////

async function fetchCart(req, res) {
  try {
    const userId = req.params.id;

    // Find the user cart and populate the product details
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.productId",
      populate: [
        { path: "category", populate: { path: "appliedOffer" } }, // Populate category and its offer
        { path: "appliedOffer" }, // Populate product's own offer
      ],
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "No cart found",
        cartItems: { items: [], totalCartValue: 0 },
      });
    }
    // Recalculating stocks in each fetching
    cart.items.forEach((item) => {
      const sizeData = item.productId.sizes.find((s) => s.size === item.size);
      if (sizeData) {
        item.stock = sizeData.stock;
      }
    });

    //Recalculate qty by new stock
    cart.items.forEach((item) => {
      if (item.qty >= item.stock) {
        item.qty = item.stock;
      } else if (item.qty == 0 && item.stock > 0) {
        item.qty = 1;
      }
    });

    // Calculate offers for each item
    cart.items.forEach((item) => {
      calculateProductOfferinCart(item);
    });

    // Recalculate totalProductPrice
    cart.items.forEach((item) => {
      item.totalProductPrice = item.qty * item.discountedAmount;
    });

    // Filter out inactive products
    cart.items = cart.items.filter((item) => item.productId?.isActive);

    cart.totalCartValue = cart.items.reduce(
      (total, item) => total + (item.totalProductPrice || 0),
      0
    );

    cart.total_discount = cart.items.reduce(
      (total, item) => total + (item.discountAmount || 0) * (item.qty || 0),
      0
    );

    await cart.save();
    return res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      cartItems: {
        items: cart.items,
        totalCartValue: cart.totalCartValue,
        totalDiscount: cart.total_discount,
      },
    });
  } catch (error) {
    console.error("Error in Fetch Cart:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching cart items",
    });
  }
}

///////////////////////////// remove Cart Item /////////////////////////////

async function removeCartItem(req, res) {
  try {
    const item_id = req.params.product_id;
    const user_id = req.params.user_id;

    // Find the user's cart
    let cart = await Cart.findOne({ user: user_id });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Filter out the item to be removed
    cart.items = cart.items.filter((item) => item._id.toString() !== item_id);

    // Recalculate total cart price
    cart.totalCartValue = cart.items.reduce(
      (total, item) => total + item.totalProductPrice,
      0
    );

    // Save the updated cart
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed",
      cart: { items: cart.items, totalCartValue: cart.totalCartValue },
    });
  } catch (err) {
    console.error("Error in removeCartItem:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove item from cart" });
  }
}

///////////////////////////// plus Cart Item /////////////////////////////

async function plusCartItem(req, res) {
  try {
    const item_id = req.params.product_id;
    const user_id = req.params.user_id;

    let updated = false;
    let cart = await Cart.findOne({ user: user_id }).populate({
      path: "items.productId",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found ",
      });
    }

    cart.items.forEach((item) => {
      const product = item.productId;
      const sizeData = product.sizes.find((s) => s.size === item.size);

      if (
        item._id.toString() === item_id &&
        sizeData &&
        item.qty < sizeData.stock &&
        item.qty < 5
      ) {
        item.qty += 1;
        item.totalProductPrice = item.qty * item.price;
        updated = true;
      }
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Maximum qty exceeded",
      });
    }

    cart.totalCartPrice = cart.items.reduce(
      (total, item) => total + item.totalProductPrice,
      0
    );

    await cart.save();
    return res.status(200).json({
      success: true,
      message: " item Quantity increased by One",
      cart: { items: cart.items, totalCartPrice: cart.totalCartPrice },
    });
  } catch (err) {
    console.error("Error in plusCartItem:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the cart",
    });
  }
}
////////////////////////// //minus Cart Item// /////////////////////////

async function minusCartItem(req, res) {
  try {
    const item_id = req.params.product_id; // Use item_id for the product
    const user_id = req.params.user_id;

    // Find the user's cart
    let cart = await Cart.findOne({ user: user_id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Decrease the quantity of the specified item
    cart.items.forEach((item) => {
      if (item._id.toString() === item_id && item.qty > 1) {
        item.qty -= 1;
        item.totalProductPrice = item.qty * item.price;
      }
    });

    // Recalculate the total cart price
    cart.totalCartPrice = cart.items.reduce(
      (total, item) => total + item.totalProductPrice,
      0
    );

    // Save the updated cart
    await cart.save();
    return res.status(200).json({ success: true, message: "Qty - 1" });
  } catch (err) {
    console.error("Error in minusCartItem:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while decreasing the cart quantity",
    });
  }
}

async function removeOrderItems(req, res) {
  try {
    const { order_items, user } = req.body;

    const cart = await Cart.findOne({ user });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) =>
        !order_items.some(
          (orderItem) => orderItem.productId === item.productId.toString()
        )
    );

    await cart.save();

    res.status(200).json({ message: "Order items removed from cart", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
}

module.exports = {
  addToCart,
  checkCartStatus,
  fetchCart,
  removeCartItem,
  plusCartItem,
  minusCartItem,
  removeOrderItems,
};
