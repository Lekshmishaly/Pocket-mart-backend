const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0, // Prevents negative balances
  },
  transactions: [
    {
      orderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
      transaction_date: {
        type: Date,
        default: Date.now, // Auto-fills the date
        required: true,
      },
      transaction_type: {
        type: String,
        enum: ["debit", "credit"],
        required: true,
      },
      transaction_status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        required: true,
        default: "pending",
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
});

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
