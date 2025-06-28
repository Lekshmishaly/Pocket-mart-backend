const Offer = require("../../Models/offerModel");
const Product = require("../../Models/productModel");
const Category = require("../../Models/categoryModel");

////////////////////////////////////// product Offer ////////////////////////////////////////////

async function productOffer(req, res) {
  try {
    const {
      id,
      productName,
      offerName,
      offerValue,
      offerExpiryDate,
      target_type,
    } = req.body;

    // ----- Create the Offer -----
    const offer = new Offer({
      title: offerName,
      discountValue: offerValue,
      type: target_type,
      target_id: id,
      target_name: productName,
      endDate: offerExpiryDate,
    });

    if (offer.type === "Product") {
      // ----- Find Product and Assign Offer -----
      const productData = await Product.findOne({ _id: id });
      if (!productData) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      productData.appliedOffer = offer._id;

      await productData.save();
    }

    // ----- Save the Offer -----
    await offer.save();

    return res.status(200).json({
      success: true,
      message: `Offer successfully added to ${productName}`,
    });
  } catch (error) {
    console.error("Error adding offer:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error adding offer" });
  }
}

/////////////////////////////////////// Fetch Product Offer ////////////////////////////////////////

async function fetchProductOffer(req, res) {
  try {
    const productOffer = await Offer.find({ type: "Product" });

    return res.json({ productOffer });
  } catch (error) {
    console.log(error);
  }
}
////////////////////////////////////// remove Product Offer /////////////////////////////////////////
async function removeProductOffer(req, res) {
  try {
    const { _id } = req.query;

    const data = await Offer.deleteOne({ target_id: _id });

    if (data.deletedCount === 1) {
      return res.status(200).json({ message: "Offer Deleted successfully" });
    } else {
      return res.status(400).json({ message: "Deletion failed" });
    }
  } catch (err) {
    console.error("Error removing offer:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

////////////////////////////////////// Category Offer /////////////////////////////////////////

async function categoryOffer(req, res) {
  try {
    const {
      id,
      CategoryName,
      offerName,
      offerValue,
      offerExpiryDate,
      target_type,
    } = req.body;

    const offer = new Offer({
      title: offerName,
      discountValue: offerValue,
      type: target_type,
      target_id: id,
      target_name: CategoryName,
      endDate: offerExpiryDate,
    });

    if (offer.type === "Category") {
      // ----- Find Category and Assign Offer -----
      const categoryData = await Category.findOne({ _id: id });
      if (!categoryData) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      categoryData.appliedOffer = offer._id;

      await categoryData.save();
    }

    await offer.save();
    return res.status(200).json({
      success: true,
      message: `Offer successfully added to category for ${CategoryName}`,
    });
  } catch (err) {
    console.log(err);
  }
}

/////////////////////////////////////// Fetch Category Offer ////////////////////////////////////////

async function fetchCategoryOffer(req, res) {
  try {
    const categoryOffer = await Offer.find({ type: "Category" });

    return res.json({ categoryOffer });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  productOffer,
  fetchProductOffer,
  removeProductOffer,
  categoryOffer,
  fetchCategoryOffer,
};
