const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["Product", "Category", "Cart"],
      required: true,
    },

    discountValue: { type: Number, required: true },

    applicableProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    applicableCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],

    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    target_name: {
      type: String,
      required: true,
    },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["Active", "Expired"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
