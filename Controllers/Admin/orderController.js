const Order = require("../../Models/orderModel");
const { refundAmounttoWallet } = require("../../Utils/refundAmounttoWallet");

////////////////////////////// fetch Order //////////////////////////////

async function fetchOrder(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();

    const orderData = await Order.find()
      .populate("user")
      .populate({ path: "order_items.productId" })
      .sort({ placed_at: -1 })
      .skip(skip)
      .limit(limit);

    if (!orderData) {
      return res
        .status(400)
        .json({ message: "Orders not found", success: false });
    }

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orderData,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error in Order Fetch:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching orders",
    });
  }
}

////////////////////////////// Change Status //////////////////////////////

async function changeStatus(req, res) {
  try {
    const { orderId, itemId, newStatus } = req.body;
    const order_id = orderId.toString();

    const order = await Order.findOne({ order_id });

    if (!order) {
      return res
        .status(401)
        .json({ success: false, message: "Order not Found" });
    }

    order.order_items.forEach((item) => {
      if (item._id.toString() === itemId && item.order_status !== newStatus) {
        item.order_status = newStatus;
      }
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error in Change Status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while changing the status",
    });
  }
}

///////////////////////////////////// Respond To Return Request /////////////////////////////////

async function respondToReturnRequest(req, res) {
  try {
    const { orderId, itemId, request_status } = req.body;

    const orderData = await Order.findOne({ _id: orderId });

    const returnItem = orderData.order_items.find((item) => item._id == itemId);

    returnItem.return_request.status = request_status;
    orderData.isReturnReq = false;

    if (request_status === "Approved") {
      returnItem.order_status = "Returned";
      returnItem.payment_status = "Refunded";
    } else {
      returnItem.order_status = "Return Rejected";
      returnItem.payment_status = "Paid";
    }

    await orderData.save(); // Make sure to await the save operation

    if (returnItem.order_status === "Returned") {
      const refundAmount = returnItem.total_price;
      refundAmounttoWallet(orderData.user, refundAmount);
    }

    return res.status(200).json({
      success: true,
      message:
        request_status === "Approved"
          ? `Return Request ${request_status} and Amount refunded to wallet`
          : `Return Request ${request_status}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
module.exports = {
  fetchOrder,
  changeStatus,
  respondToReturnRequest,
};
