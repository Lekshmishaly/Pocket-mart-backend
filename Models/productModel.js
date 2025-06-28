const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    additionalInfo: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },

    appliedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      default: null,
    },
    stocks: {
      type: Number,
      required: true,
    },
    sizes: [
      {
        size: { type: String, required: true },
        stock: { type: Number, required: true },
      },
    ],
    sleeve: {
      type: String,
      enum: ["Full Sleeve", "Half Sleeve", "Sleeveless", "Short Sleeve"],
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("product", ProductSchema);
