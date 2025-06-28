const categoryModel = require("../../Models/categoryModel");

/////////////////////// function to add category ///////////////////////////

async function addCategory(req, res) {
  try {
    const { name, description } = req.body;
    // validate category name
    const isExist = await categoryModel.findOne({ name });
    if (isExist) {
      return res
        .status(401)
        .json({ success: false, message: "Category name already Exist" });
    }
    // add category to database
    const categoryData = await categoryModel.create({ name, description });
    if (!categoryData) {
      return res
        .status(401)
        .json({ success: false, message: "unable to add Category" });
    }
    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      categoryData,
    });
  } catch (error) {
    console.log(error);
  }
}
/////////////////////// fetch categories ///////////////////////////

async function fetchCategories(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const categoryData = await categoryModel.find().skip(skip).limit(limit);

    const totalCategories = await categoryModel.countDocuments();

    if (!categoryData.length) {
      return res
        .status(404)
        .json({ success: false, message: "No categories found" });
    }

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categoryData,
      currentPage: page,
      totalPages: Math.ceil(totalCategories / limit),
      totalCategories,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Server internal error" });
  }
}

/////////////////////// fetch Category By ID  ///////////////////////////

async function fetchCategory(req, res) {
  try {
    const { id } = req.params;
    const categoryData = await categoryModel.findById(id);

    if (!categoryData) {
      return res
        .status(401)
        .json({ success: false, message: "No categories found" });
    }

    return res.status(200).json({
      success: true,
      message: "category fetched successfully",
      categoryData,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Server internal errors" });
  }
}

/////////////////////// category status controlling ///////////////////////////

async function toggleCategory(req, res) {
  try {
    const { _id, isActive } = req.body;

    const updateData = await categoryModel.findByIdAndUpdate(
      { _id },
      {
        isActive: isActive ? false : true,
      },
      {
        new: true,
      }
    );

    if (!updateData) {
      return res
        .status(400)
        .json({ message: "unable to update, please try again" });
    }
    if (updateData.isActive) {
      return res.status(200).json({ message: "Category enabled" });
    } else {
      return res.status(200).json({ message: "Category disabled" });
    }
  } catch (err) {
    console.log(err);
  }
}

////////////////////// Edit Category ///////////////////////////

async function editCategory(req, res) {
  try {
    const { name, description, id } = req.body;

    const updatedData = await categoryModel.findByIdAndUpdate(
      id,
      { name, description, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedData) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to update" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Updated Successfully", updatedData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
module.exports = {
  addCategory,
  fetchCategories,
  fetchCategory,
  toggleCategory,
  editCategory,
};
