const Order = require("../../Models/orderModel");
const Cart = require("../../Models/cartModel");
const Wallet = require("../../Models/walletModel");
const User = require("../../Models/userModel");
const {
  manageStock,
  manageStockAfterCancel,
} = require("../../Utils/manageProductStock");
const PDFDocument = require("pdfkit");
const {
  generateHeader,
  generateInvoiceInfo,
  generateAddressSection,
  generateItemsTable,
  generatePaymentSummary,
  generateFooter,
} = require("../../Utils/invoiceGenerator");

////////////////////////////////// create Order //////////////////////////////

async function addOrder(req, res) {
  try {
    const {
      user,
      cartItems,
      total_amount,
      totalDiscount,
      coupon_Discount,
      total_price_with_discount,
      shipping_address,
      payment_method,
      payment_status,
    } = req.body;

    const products = [];

    // Creating product Array
    cartItems.forEach((item) => {
      if (item.qty >= 1) {
        products.push({
          productId: item.productId._id,
          qty: item.qty,
          size: item.size,
          price: item.price,
          discount: item.discount || 0,
          payment_status: payment_method === "wallet" ? "Paid" : payment_status,
          total_price: item.discountedAmount || item.price,
        });
      }
    });

    // Creating order collection document
    const order = await Order.create({
      user,
      order_items: products,
      order_status: "Pending",
      total_amount: total_amount,
      total_discount: totalDiscount,
      coupon_discount: coupon_Discount,
      total_price_with_discount: total_price_with_discount,
      shipping_address,
      payment_method,
      shipping_fee: 0,
    });

    await order.save();

    manageStock(products);

    return res
      .status(200)
      .json({ success: true, message: "Order Placed", order });
  } catch (error) {
    console.error("Error in Order:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while placing the order.",
    });
  }
}

////////////////////////////////////// fetch Orders //////////////////////////////////

async function fetchOrders(req, res) {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ user: userId });

    const orderDetails = await Order.find({ user: userId })
      .sort({ placed_at: -1 })
      .skip(skip)
      .limit(limit);

    // ✅ DO NOT return 404 for empty array
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orderDetails,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error("Error in Fetch Orders:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching Orders",
    });
  }
}

///////////////////////////////////// fetch Order //////////////////////////////////

async function fetchOrder(req, res) {
  try {
    const { order_id } = req.params;

    const orderData = await Order.findOne({ order_id: order_id }).populate({
      path: "order_items.productId", // Path to populate
    });

    if (!orderData) {
      return res.status(401).json({
        success: false,
        message: "Order not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      orderData,
    });
  } catch (error) {
    console.error("Error in Fetch Order:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching Order",
    });
  }
}
// manageStockAfterCancel(order.order_items);

///////////////////////////////////// order Cancel //////////////////////////////////

async function orderCancel(req, res) {
  try {
    const { userId, order_id, itemId, reason } = req.body;

    const order = await Order.findOne({ order_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let itemCancelled = false;
    let refundAmount = 0;

    order.order_items.forEach((item) => {
      if (
        item._id.toString() === itemId &&
        item.order_status === "Pending" &&
        item.payment_status === "Paid"
      ) {
        // Update order and payment status
        item.order_status = "Cancelled";
        item.payment_status = "Refunded";
        itemCancelled = true;

        // Add cancel request details
        item.cancel_request = {
          status: "Cancelled",
          reason: reason,
          requestedAt: new Date(),
        };

        // Store refund amount
        refundAmount = item.total_price;

        // Restore stock
        manageStockAfterCancel(item);
      } else if (
        item._id.toString() === itemId &&
        item.order_status === "Pending" &&
        item.payment_status === "Pending"
      ) {
        item.order_status = "Cancelled";
        itemCancelled = true;

        // Add cancel request details
        item.cancel_request = {
          status: "Cancelled",
          reason: reason,
          requestedAt: new Date(),
        };

        // Restore stock
        manageStockAfterCancel(item);
      }
    });

    if (!itemCancelled) {
      return res.status(400).json({
        success: false,
        message: "Item not found or already cancelled",
      });
    }

    await order.save();

    // ✅ Process Refund to Wallet
    if (refundAmount > 0 && order.payment_method !== "Cash on Delivery") {
      let userWallet = await Wallet.findOne({ user: userId });

      if (!userWallet) {
        userWallet = new Wallet({ user: userId, balance: 0, transactions: [] });
      }

      // Update wallet balance
      userWallet.balance += refundAmount;

      userWallet.transactions.push({
        orderID: order._id,
        transaction_date: new Date(),
        transaction_type: "credit",
        transaction_status: "completed",
        amount: refundAmount,
      });

      await userWallet.save();
    }

    // ✅ Always return a response
    return res.status(200).json({
      success: true,
      message:
        order.payment_method !== "Cash on Delivery"
          ? "Order item cancelled successfully and refunded to wallet"
          : "Order item cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Error in Order Cancelling:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while cancelling the order",
    });
  }
}

//////////////////////////////////// Return Request ////////////////////////////////

async function returnRequest(req, res) {
  try {
    const { reason, explanation, orderID, itemId } = req.body;

    const orderData = await Order.findOne({
      order_id: orderID,
    });

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    const returnItem = orderData.order_items.find((item) => item._id == itemId);

    if (!returnItem) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    orderData.isReturnReq = true;
    returnItem.return_request.reason = reason;
    returnItem.return_request.explanation = explanation;
    returnItem.return_request.status = "Pending";

    await orderData.save();
    return res
      .status(200)
      .json({ message: "Return request registered successfully" });
  } catch (error) {
    console.log(error);
  }
}

////////////////////////////////////// retry Payment /////////////////////////////////////

async function retryPayment(req, res) {
  try {
    const { orderId } = req.params;

    const orderData = await Order.findOne({
      order_id: orderId,
    });
    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    orderData.order_items.forEach((item) => {
      item.payment_status = "Paid";
    });

    await orderData.save();

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      order: orderData,
    });
  } catch (error) {
    console.error("Error retrying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
}

/////////////////////////////////////////////////// generateInvoice /////////////////////////////

async function generateInvoice(req, res) {
  try {
    const orderId = req.params.orderId;
    const orderData = await Order.findById(orderId)
      .populate("user")
      .populate("order_items.productId")
      .lean();

    if (!orderData) {
      return res.status(404).send("Order not found");
    }

    const pdfDoc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.setHeader("Content-Type", "application/pdf");

    pdfDoc.pipe(res);

    // Reuse your invoice generation helper functions
    generateHeader(pdfDoc);
    generateInvoiceInfo(pdfDoc, orderData);
    generateAddressSection(pdfDoc, orderData);
    generateItemsTable(pdfDoc, orderData.order_items);
    generatePaymentSummary(pdfDoc, orderData);
    generateFooter(pdfDoc);

    pdfDoc.end();
  } catch (err) {
    console.error("Error generating invoice:", err);
    res.status(500).send("Error generating invoice PDF");
  }
}

module.exports = {
  addOrder,
  fetchOrders,
  fetchOrder,
  orderCancel,
  returnRequest,
  retryPayment,
  generateInvoice,
};
