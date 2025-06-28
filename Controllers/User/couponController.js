const Coupon = require("../../Models/couponModel");

///////////////////////////////////// fetch Coupon Details //////////////////////////////////////

async function fetchCouponDetails(req, res) {
  try {
    const { couponCode } = req.query;

    const CouponData = await Coupon.findOne({ code: couponCode });

    if (!CouponData) {
      return res
        .status(404)
        .json({ success: false, message: "unable to fetch the couponData" });
    }
    return res
      .status(200)
      .json({ message: "couponData fetched successfully", CouponData });
  } catch (error) {
    console.log(error);
  }
}

/////////////////////////////////////// update Coupon //////////////////////////////////////

async function updateCoupon(req, res) {
  try {
    const { coupon_id, user_id } = req.body;
    const couponData = await Coupon.findOne({ _id: coupon_id });

    if (!couponData) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    let userFound = false;

    if (couponData.users_applied.length === 0) {
      const appliedUser = { user: user_id, used_count: 1 };
      couponData.users_applied.push(appliedUser);
    } else {
      couponData.users_applied.forEach((user_applied) => {
        if (user_applied.user.toString() === user_id) {
          user_applied.used_count += 1;
          userFound = true;
        }
      });

      if (!userFound) {
        const appliedUser = { user: user_id, used_count: 1 };
        couponData.users_applied.push(appliedUser);
      }
    }

    await couponData.save();

    res.status(200).json({ message: "Coupon updated successfully" });
  } catch (err) {
    console.log("Error updating coupon:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
module.exports = {
  fetchCouponDetails,
  updateCoupon,
};
