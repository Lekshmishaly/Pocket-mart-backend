const Address = require("../../Models/addressModel");
const { findByIdAndUpdate } = require("../../Models/userModel");

async function addAddress(req, res) {
  try {
    const { userId, formData } = req.body;

    if (!formData) {
      return res.status(400).json({
        success: false,
        message: "No address data provided",
      });
    }

    const data = await Address.create({
      user: userId,
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      postalCode: formData.postalCode,
      landMark: formData.landMark,
      city: formData.city,
      district: formData.district,
      state: formData.state,
      country: formData.country,
    });

    return res.status(200).json({
      success: true,
      message: "Address added to profile",
      data,
    });
  } catch (error) {
    console.error("Error adding address:", error);

    return res.status(500).json({
      success: false,
      message: "Error adding address",
      error: error.message,
    });
  }
}

//////////////////////////// fetch Address ///////////////////////

async function fetchAddress(req, res) {
  try {
    const { userId } = req.params;
    const addressess = await Address.find({ user: userId });
    if (addressess.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "No Address found" });
    }
    return res.status(200).json({
      success: true,
      message: "Address fetch successfully",
      addressess,
    });
  } catch (error) {
    console.log(error);
  }
}

//////////////////////////// delete Address ///////////////////////

async function deleteAddress(req, res) {
  try {
    const _id = req.params.id;
    const deleted = await Address.findByIdAndDelete({ _id });

    if (!deleted) {
      return res
        .status(401)
        .json({ success: false, message: "Unable to delete the Address" });
    }
    return res.status(200).json({ success: true, message: "Address Deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error deleting address",
      error: error.message,
    });
  }
}

/////////////////////////// edit address /////////////////////////

async function editAddress(req, res) {
  try {
    const { editData } = req.body;
    const _id = editData._id;
    delete editData._id;

    const edit = await Address.findByIdAndUpdate(_id, editData, { new: true });

    if (!edit) {
      return res.status(404).json({
        success: false,
        message: "Address not found or update failed",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error updating address",
      error: error.message,
    });
  }
}

module.exports = {
  addAddress,
  fetchAddress,
  editAddress,
  deleteAddress,
};
