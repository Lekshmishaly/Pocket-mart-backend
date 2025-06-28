const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order_id: {
    type: String,
  },
  order_items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
      qty: {
        type: Number,
        required: true,
        min: [1, "Quantity cannot be less than 1"],
      },
      price: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        required: true,
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"],
        default: 0,
      },
      order_status: {
        type: String,
        required: true,
        enum: [
          "Pending",
          "Shipped",
          "Delivered",
          "Cancelled",
          "Returned",
          "Return Rejected",
        ],
        default: "Pending",
      },
      payment_status: {
        type: String,
        required: true,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending",
      },
      Delivered_on: {
        type: Date,
      },
      total_price: {
        type: Number,
        required: true,
      },
      // 📌 Added Cancellation Fields
      cancel_request: {
        status: {
          type: String,
          enum: ["Pending", "Cancelled"],
          default: null,
        },
        reason: { type: String, default: null },
        requestedAt: { type: Date, default: null },
      },

      return_request: {
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: null,
        },
        reason: { type: String, default: null },
        explanation: { type: String, default: null },
        requestedAt: { type: Date, default: null },
      },
    },
  ],
  total_amount: {
    type: Number,
    required: true,
    min: [0, "Total amount cannot be negative"],
  },
  shipping_address: {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    address: { type: String, required: true },
    landMark: { type: String },
    postalCode: { type: Number, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  payment_method: {
    type: String,
    required: true,
    enum: ["Razor Pay", "wallet", "Cash on Delivery"],
    default: "Cash on Delivery",
  },
  total_discount: {
    type: Number,
    default: 0,
    min: [0, "Discount cannot be negative"],
    default: 0,
  },
  coupon_discount: {
    type: Number,
    default: 0,
  },
  total_price_with_discount: {
    type: Number,
    required: true,
  },
  shipping_fee: {
    type: Number,
    required: true,
    min: [0, "Shipping fee cannot be negative"],
  },
  placed_at: {
    type: Date,
    default: Date.now,
  },
  delivery_by: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isReturnReq: {
    type: Boolean,
    default: false,
  },
});

orderSchema.pre("save", function (next) {
  if (!this.delivery_by) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days after order placement
    this.delivery_by = deliveryDate;
  }
  next();
});

orderSchema.pre("save", function (next) {
  if (!this.order_id) {
    this.order_id = `PKM-${nanoid(10)}`;
  }
  next();
});

orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
