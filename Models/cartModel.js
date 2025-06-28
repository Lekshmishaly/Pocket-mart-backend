const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
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
        stock: {
          type: Number,
          required: true,
          min: 0,
        },
        price: {
          type: Number,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
          default: 1,
        },
        discount: {
          type: Number,
          min: 0,
          default: 0,
        },
        discountedAmount: {
          type: Number,
          min: 0,
          default: 0,
        },
        discountAmount: {
          type: Number,
          min: 0,
          default: 0,
        },
        totalProductPrice: {
          type: Number,
          require: true,
        },
      },
    ],
    totalCartValue: {
      type: Number,
      required: true,
      default: function () {
        return this.items.reduce(
          (total, item) => total + item.totalProductPrice,
          0
        );
      },
    },
    total_discount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("cart", CartSchema);
