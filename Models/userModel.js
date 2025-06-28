const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: false,
      trim: true,
    },
    lastname: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    usedReferral: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);
