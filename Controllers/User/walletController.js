const Wallet = require("../../Models/walletModel");

//////////////////////////// add Money to Wallet ///////////////////////////////

async function addMoneytoWallet(req, res) {
  try {
    const { amount, userID } = req.body;

    // ✅ Convert `amount` to a number
    const numericAmount = Number(amount);

    // ✅ Create User Wallet
    let myWallet = await Wallet.findOne({ user: userID });

    if (!myWallet) {
      myWallet = new Wallet({
        user: userID,
        balance: numericAmount,
        transactions: [
          {
            transaction_date: new Date(),
            transaction_type: "credit",
            transaction_status: "completed",
            amount: numericAmount,
          },
        ],
      });

      await myWallet.save();
      return res
        .status(200)
        .json({ success: true, message: "Amount added to new wallet." });
    }

    // ✅ Update Wallet
    myWallet.balance += numericAmount;
    myWallet.transactions.push({
      transaction_date: new Date(),
      transaction_type: "credit",
      transaction_status: "completed",
      amount: numericAmount,
    });

    await myWallet.save();

    return res
      .status(200)
      .json({ success: true, message: "Amount added to wallet successfully." });
  } catch (error) {
    console.error("Error adding money to wallet:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
}

//////////////////////////// fetch Wallet ///////////////////////////////

async function fetchWallet(req, res) {
  try {
    const { userID, page = 1, limit = 5 } = req.query;

    let myWallet = await Wallet.findOne({ user: userID });

    if (!myWallet) {
      myWallet = new Wallet({
        user: userID,
        balance: 0,
        transactions: [],
      });
      await myWallet.save();
      return res.status(200).json({
        success: true,
        myWallet: {
          balance: 0,
          transactions: [],
          totalTransactionCount: 0,
        },
      });
    }

    // ✅ Paginate transactions
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);

    const totalTransactionCount = myWallet.transactions.length;
    const paginatedTransactions = myWallet.transactions
      .slice()
      .reverse()
      .slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      myWallet: {
        balance: myWallet.balance,
        transactions: paginatedTransactions,
        totalTransactionCount,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

//////////////////////////// deduct Money From Wallet///////////////////////////////

async function deductMoneyFromWallet(req, res) {
  try {
    const { userID, orderID, total_amount } = req.body; // Use total_amount from the order
    const amount = Number(total_amount);

    // ✅ Validate Input
    if (!amount || !userID || !orderID) {
      return res.status(400).json({
        success: false,
        message: "User ID, Amount, and Order ID are required.",
      });
    }

    // ✅ Find User Wallet
    let myWallet = await Wallet.findOne({ user: userID });

    if (!myWallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user.",
      });
    }

    // ✅ Check if the balance is sufficient
    if (myWallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance.",
      });
    }

    // ✅ Deduct the Amount
    myWallet.balance -= amount;
    myWallet.transactions.push({
      orderID,
      transaction_date: new Date(),
      transaction_type: "debit",
      transaction_status: "completed",
      amount: amount,
    });

    await myWallet.save();

    return res.status(200).json({
      success: true,
      message: "Amount deducted from wallet successfully.",
      newBalance: myWallet.balance,
    });
  } catch (error) {
    console.error("Error deducting money from wallet:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
}
module.exports = {
  addMoneytoWallet,
  fetchWallet,
  deductMoneyFromWallet,
};
