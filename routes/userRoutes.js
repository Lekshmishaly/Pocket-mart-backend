const express = require("express");
const userRoute = express.Router();
const userController = require("../Controllers/User/userController");
const userAuth = require("../Middleware/userAuth");
const rateLimit = require("express-rate-limit");
const productController = require("../Controllers/User/productController");
const addressController = require("../Controllers/User/addressController");
const cartController = require("../Controllers/User/cartController");
const orderController = require("../Controllers/User/OrderController");
const reviewController = require("../Controllers/User/reviewController");
const categoryController = require("../Controllers/User/categoryController");
const wishlistController = require("../Controllers/User/wishlistController");
const walletController = require("../Controllers/User/walletController");
const offerController = require("../Controllers/User/offerController");
const couponController = require("../Controllers/User/couponController");

// Rate limiter to prevent abuse
const resetPasswordLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many password reset attempts, please try again later.",
});

// user controller  Routes
userRoute.post("/sendotp", userController.sendOtp);
userRoute.post("/signup", userAuth.verifyOtp, userController.createUser);
userRoute.post("/login", userController.userLogin);
userRoute.patch("/logout", userController.logout);

userRoute.post(
  "/forget-password",
  resetPasswordLimiter,
  userController.forgetPassword
);

userRoute.post("/verify-otp", userAuth.verifyOtp, (req, res) => {
  res.status(200).json({ success: true, message: "OTP verified successfully" });
});

userRoute.put("/edit", userController.editUser);

userRoute.post(
  "/reset-password",
  resetPasswordLimiter,
  userController.resetPassword
);

userRoute.post("/googleAuth", userController.googleAuth);
userRoute.put("/changepassword", userController.changePassword);
userRoute.post("/referral", userController.referral);
userRoute.patch("/referal/skip", userController.skipReferral);

//Product controller routes
userRoute.get("/product/home/:limit", productController.fetchProductsHome);
userRoute.post(
  "/fetchproductdetails/:limit/:search?",
  productController.fetchProducts
);

userRoute.get("/fetchingproduct/:id", productController.fetchProduct);
userRoute.get("/fetchSize/:id", productController.fetchSize);

//Adress controller routes
userRoute.post("/address", addressController.addAddress);
userRoute.get("/addresses/:userId", addressController.fetchAddress);
userRoute.delete("/address/:id", addressController.deleteAddress);
userRoute.put("/address/edit", addressController.editAddress);

//Cart controller routes
userRoute.post("/addcart", cartController.addToCart);
userRoute.post("/check-cart-status", cartController.checkCartStatus);
userRoute.get("/cart/:id", cartController.fetchCart);
userRoute.delete("/cart/:product_id/:user_id", cartController.removeCartItem);
userRoute.patch("/cart/min/:product_id/:user_id", cartController.minusCartItem);
userRoute.patch("/cart/add/:product_id/:user_id", cartController.plusCartItem);
userRoute.put("/cart/remove-items", cartController.removeOrderItems);

//Order controller routes
userRoute.post("/order", orderController.addOrder);
userRoute.get("/fetchorders/:userId", orderController.fetchOrders);
userRoute.get("/fetchorder/:order_id", orderController.fetchOrder);
userRoute.patch("/order/cancel", orderController.orderCancel);
userRoute.post("/return/request", orderController.returnRequest);
userRoute.put("/order-success/:orderId", orderController.retryPayment);
userRoute.get("/invoice/:orderId", orderController.generateInvoice);

//Review controller routes
userRoute.post("/product/review", reviewController.addReview);
userRoute.get("/fetchreview/:productId", reviewController.fetchReview);
userRoute.get(
  "/average-rating/:productId",
  reviewController.fetchAverageRating
);

//Category controller routes
userRoute.get("/category", categoryController.fetchCategories);

//Wishlist controller routes
userRoute.post("/wishlist", wishlistController.addTOWishlist);
userRoute.get("/wishlist/:user_id", wishlistController.fetchWishlist);
userRoute.get(
  "/wishlist/:product_id/:user_id",
  wishlistController.checkIsExistOnWishlist
);
userRoute.delete(
  "/wishlist/:product_id/:user_id",
  wishlistController.removeFromWishlist
);

//Wallet controller routes
userRoute.post("/wallet/add-money", walletController.addMoneytoWallet);
userRoute.get("/wallet", walletController.fetchWallet);
userRoute.post("/wallet/deduct", walletController.deductMoneyFromWallet);

//offer constroller route
userRoute.get("/offer", offerController.fetchBoldOffer);

//coupon Controller routes
userRoute.get("/coupon", couponController.fetchCouponDetails);
userRoute.patch("/coupon", couponController.updateCoupon);
module.exports = userRoute;
