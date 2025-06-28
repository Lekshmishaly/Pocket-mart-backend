const categoryModel = require("../../Models/categoryModel");

//////////////////////////////////////// fetch Categories //////////////////////////////////

async function fetchCategories(req, res) {
  try {
    const categoryData = await categoryModel.find();

    if (categoryData.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "No categories found" });
    }

    return res.status(200).json({
      success: true,
      message: "categories fetched successfully",
      categoryData,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Server internal errors" });
  }
}

module.exports = {
  fetchCategories,
};
