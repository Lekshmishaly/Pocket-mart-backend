const express = require("express");
const adminRoute = express.Router();

//imports
const adminController = require("../Controllers/Admin/adminController");
const categoryController = require("../Controllers/Admin/categoryController");
const productController = require("../Controllers/Admin/productController");
const userController = require("../Controllers/Admin/userController");
const orderController = require("../Controllers/Admin/orderController");
const offerController = require("../Controllers/Admin/offerController");
const couponController = require("../Controllers/Admin/couponController");
const salesController = require("../Controllers/Admin/salesController");
const dashboardController = require("../Controllers/Admin/dashboardController");

//...........ROUTES................
const adminAuth = require("../Middleware/adminAuth");

//admin controller routes
adminRoute.get("/createadmin/:email", adminController.createAdmin);
adminRoute.post("/login", adminController.login);

//catagory controller routes
adminRoute.post(
  "/category",
  adminAuth.jwtVerification,
  categoryController.addCategory
);
adminRoute.get(
  "/categories",
  adminAuth.jwtVerification,
  categoryController.fetchCategories
);
adminRoute.patch(
  "/category/toogle-status",
  adminAuth.jwtVerification,
  categoryController.toggleCategory
);
adminRoute.get(
  "/category/:id",
  adminAuth.jwtVerification,
  categoryController.fetchCategory
);
adminRoute.put(
  "/editcategory",
  adminAuth.jwtVerification,
  categoryController.editCategory
);

//product controller routes
adminRoute.post(
  "/addproduct",
  adminAuth.jwtVerification,
  productController.addProduct
);
adminRoute.get(
  "/products",
  adminAuth.jwtVerification,
  productController.fetchProducts
);
adminRoute.get(
  "/product/:id",
  adminAuth.jwtVerification,
  productController.fetchProduct
);
adminRoute.patch(
  "/product/toogle-status",
  adminAuth.jwtVerification,
  productController.toggleProduct
);
adminRoute.put(
  "/product",
  adminAuth.jwtVerification,
  productController.editProduct
);

//user controller routes
adminRoute.get(
  "/customerList",
  adminAuth.jwtVerification,
  userController.ConsumerList
);
adminRoute.patch(
  "/customer/toogle-status",
  adminAuth.jwtVerification,
  userController.toggleConsumer
);

//Order controller routes
adminRoute.get("/order", adminAuth.jwtVerification, orderController.fetchOrder);
adminRoute.put(
  "/order/status",
  adminAuth.jwtVerification,
  orderController.changeStatus
);
adminRoute.patch(
  "/return/response",
  adminAuth.jwtVerification,
  orderController.respondToReturnRequest
);

//Offer controller routes
adminRoute.post(
  "/product/offer",
  adminAuth.jwtVerification,
  offerController.productOffer
);
adminRoute.get(
  "/offer/product",
  adminAuth.jwtVerification,
  offerController.fetchProductOffer
);
adminRoute.delete(
  "/offer",
  adminAuth.jwtVerification,
  offerController.removeProductOffer
);
adminRoute.post(
  "/category/offer",
  adminAuth.jwtVerification,
  offerController.categoryOffer
);
adminRoute.get(
  "/offer/category",
  adminAuth.jwtVerification,
  offerController.fetchCategoryOffer
);

//Coupon controller routes
adminRoute.post(
  "/coupon",
  adminAuth.jwtVerification,
  couponController.addCoupon
);
adminRoute.get(
  "/coupons",
  adminAuth.jwtVerification,
  couponController.fetchCoupons
);
adminRoute.delete(
  "/coupon",
  adminAuth.jwtVerification,
  couponController.deleteCoupon
);

//sales report Controller routes
adminRoute.get(
  "/sales",
  adminAuth.jwtVerification,
  salesController.fetchSalesReport
);
adminRoute.get(
  "/sales/download/pdf",
  adminAuth.jwtVerification,
  salesController.dowloadSalesPDF
);
adminRoute.get(
  "/sales/download/excel",
  adminAuth.jwtVerification,
  salesController.downloadSalesExcel
);

//dashboard Controller routes
adminRoute.get(
  "/dashboard",
  adminAuth.jwtVerification,
  dashboardController.fetchDashboardData
);
module.exports = adminRoute;
