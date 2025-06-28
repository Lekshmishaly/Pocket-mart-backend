const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: String,

  discountValue: {
    type: Number,
    required: true,
    min: [0, "Discount value cannot be negative"],
  },

  min_purchase_amount: {
    type: Number,
    default: 0,
    min: [0, "Minimum purchase amount cannot be negative"],
  },

  max_discount_amount: {
    type: Number,
    default: null,
    min: [0, "Maximum discount amount cannot be negative"],
  },

  expiration_date: {
    type: Date,
    required: true,
  },

  usage_limit: {
    type: Number,
    default: null,
    min: [1, "Usage limit must be at least 1 if specified"],
  },

  users_applied: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      used_count: {
        type: Number,
        default: 0,
        min: [0, "Used count cannot be negative"],
      },
    },
  ],

  is_active: {
    type: Boolean,
    default: true,
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ⚠️ TTL index might not work correctly on manually updated fields
// couponSchema.index({ expiration_date: 1 }, { expireAfterSeconds: 0 });

couponSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Coupon", couponSchema);
