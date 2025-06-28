const bcrypt = require("bcrypt");
const User = require("../../Models/userModel");

//////////////////////////////////////////////////////////// ConsumerList /////////////////////////////////////////////////////

async function ConsumerList(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    const totalUsers = await User.countDocuments();

    const totalPages = Math.ceil(totalUsers / limit);
    const skip = (page - 1) * limit;

    const userDetails = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      userDetails,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error in ConsumerList:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/////////////////////////// consumer blocking //////////////////////
async function toggleConsumer(req, res) {
  try {
    const { _id, isActive } = req.body;

    const updateDetails = await User.findByIdAndUpdate(
      _id,
      {
        isActive: !isActive,
      },
      {
        new: true,
      }
    );

    if (!updateDetails) {
      return res
        .status(400)
        .json({ message: "Unable to update, please try again" });
    }

    if (updateDetails.isActive) {
      return res
        .status(200)
        .json({ message: `${updateDetails.firstname} is Unblocked` });
    } else {
      return res
        .status(200)
        .json({ message: `${updateDetails.firstname} is Blocked` });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
module.exports = {
  ConsumerList,
  toggleConsumer,
};
