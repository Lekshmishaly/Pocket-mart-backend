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
userRoute.patch("/logout", userAuth.jwtVerification, userController.logout);

userRoute.post(
  "/forget-password",
  resetPasswordLimiter,
  userController.forgetPassword
);

userRoute.post("/verify-otp", userAuth.verifyOtp, (req, res) => {
  res.status(200).json({ success: true, message: "OTP verified successfully" });
});

userRoute.put("/edit", userAuth.jwtVerification, userController.editUser);

userRoute.post(
  "/reset-password",
  resetPasswordLimiter,
  userController.resetPassword
);

userRoute.post("/googleAuth", userController.googleAuth);
userRoute.put(
  "/changepassword",

  userController.changePassword
);
userRoute.post("/referral", userAuth.jwtVerification, userController.referral);
userRoute.patch(
  "/referal/skip",
  userAuth.jwtVerification,

  userController.skipReferral
);

//Product controller routes
userRoute.get("/product/home/:limit", productController.fetchProductsHome);
userRoute.post(
  "/fetchproductdetails/:limit/:search?",
  productController.fetchProducts
);

userRoute.get("/fetchingproduct/:id", productController.fetchProduct);
userRoute.get("/fetchSize/:id", productController.fetchSize);

//Adress controller routes
userRoute.post(
  "/address",
  userAuth.jwtVerification,
  addressController.addAddress
);
userRoute.get(
  "/addresses/:userId",

  addressController.fetchAddress
);
userRoute.delete(
  "/address/:id",
  userAuth.jwtVerification,
  addressController.deleteAddress
);
userRoute.put(
  "/address/edit",
  userAuth.jwtVerification,
  addressController.editAddress
);

//Cart controller routes
userRoute.post("/addcart", userAuth.jwtVerification, cartController.addToCart);
userRoute.post(
  "/check-cart-status",
  userAuth.jwtVerification,
  cartController.checkCartStatus
);
userRoute.get("/cart/:id", userAuth.jwtVerification, cartController.fetchCart);
userRoute.delete(
  "/cart/:product_id/:user_id",
  userAuth.jwtVerification,
  cartController.removeCartItem
);
userRoute.patch(
  "/cart/min/:product_id/:user_id",
  userAuth.jwtVerification,
  cartController.minusCartItem
);
userRoute.patch(
  "/cart/add/:product_id/:user_id",
  userAuth.jwtVerification,
  cartController.plusCartItem
);
userRoute.put(
  "/cart/remove-items",
  userAuth.jwtVerification,
  cartController.removeOrderItems
);

//Order controller routes
userRoute.post("/order", userAuth.jwtVerification, orderController.addOrder);
userRoute.get(
  "/fetchorders/:userId",

  orderController.fetchOrders
);
userRoute.get(
  "/fetchorder/:order_id",

  orderController.fetchOrder
);
userRoute.patch(
  "/order/cancel",
  userAuth.jwtVerification,
  orderController.orderCancel
);
userRoute.post(
  "/return/request",
  userAuth.jwtVerification,
  orderController.returnRequest
);
userRoute.put(
  "/order-success/:orderId",
  userAuth.jwtVerification,
  orderController.retryPayment
);
userRoute.get(
  "/invoice/:orderId",
  userAuth.jwtVerification,
  orderController.generateInvoice
);

//Review controller routes
userRoute.post(
  "/product/review",
  userAuth.jwtVerification,
  reviewController.addReview
);
userRoute.get("/fetchreview/:productId", reviewController.fetchReview);
userRoute.get(
  "/average-rating/:productId",
  reviewController.fetchAverageRating
);

//Category controller routes
userRoute.get("/category", categoryController.fetchCategories);

//Wishlist controller routes
userRoute.post(
  "/wishlist",
  userAuth.jwtVerification,
  wishlistController.addTOWishlist
);
userRoute.get(
  "/wishlist/:user_id",
  userAuth.jwtVerification,
  wishlistController.fetchWishlist
);
userRoute.get(
  "/wishlist/:product_id/:user_id",

  wishlistController.checkIsExistOnWishlist
);
userRoute.delete(
  "/wishlist/:product_id/:user_id",
  userAuth.jwtVerification,
  wishlistController.removeFromWishlist
);

//Wallet controller routes
userRoute.post(
  "/wallet/add-money",
  userAuth.jwtVerification,
  walletController.addMoneytoWallet
);
userRoute.get(
  "/wallet",
  userAuth.jwtVerification,
  walletController.fetchWallet
);
userRoute.post(
  "/wallet/deduct",
  userAuth.jwtVerification,
  walletController.deductMoneyFromWallet
);

//offer constroller route
userRoute.get("/offer", offerController.fetchBoldOffer);

//coupon Controller routes
userRoute.get("/coupon", couponController.fetchCouponDetails);
userRoute.patch(
  "/coupon",
  userAuth.jwtVerification,
  couponController.updateCoupon
);
module.exports = userRoute;
