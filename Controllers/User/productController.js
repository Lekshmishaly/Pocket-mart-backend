const productModel = require("../../Models/productModel");
const categoryModel = require("../../Models/categoryModel");

//////////////////////////////// fetchProductsHome ////////////////////////

async function fetchProductsHome(req, res) {
  try {
    const { limit } = req.params;
    const limitNumber = parseInt(limit, 10); //Prevents any accidental misinterpretation of the value if limit is passed in an unexpected format

    const latestProducts = await productModel
      .find({ isActive: true })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      message: "Latest products fetched successfully",
      ProductsData: latestProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
}
/////////////////////////////////////////////// product fetching  to userSide  ////////////////////////////////////////////////////

const fetchProducts = async (req, res) => {
  try {
    const limitParam = parseInt(req.params.limit) || 0;
    const search = req.params.search || "";

    const { filter = {}, sortBy = "" } = req.body;

    const page = parseInt(req.query.page) || 1;
    const limits = parseInt(req.query.limits) || 9;
    const skip = (page - 1) * limits;

    // Search condition
    const searchCondition = {
      ...(search && {
        name: { $regex: search, $options: "i" },
      }),
      isActive: true,
    };

    // Category ID filter
    let categoryIds = [];
    if (filter.categories?.length > 0) {
      const categories = await categoryModel.find({
        name: { $in: filter.categories },
        isActive: true,
      });
      categoryIds = categories.map((c) => c._id);
    }

    // Build other filter conditions
    const filterCondition = {
      ...(categoryIds.length > 0 && { category: { $in: categoryIds } }),
      ...(filter.sleeves?.length > 0 && { sleeve: { $in: filter.sleeves } }),
      ...(filter.price > 0 && { price: { $lte: filter.price } }),
    };

    // Sorting logic
    let sortCondition = {};
    switch (sortBy) {
      case "newest":
        sortCondition = { createdAt: -1 };
        break;
      case "price_asc":
        sortCondition = { price: 1 };
        break;
      case "price_desc":
        sortCondition = { price: -1 };
        break;
      case "name_asc":
        sortCondition = { name: 1 };
        break;
      case "name_desc":
        sortCondition = { name: -1 };
        break;
      default:
        break;
    }

    // Fetch products
    const ProductsData = await productModel
      .find({ ...searchCondition, ...filterCondition })
      .sort(sortCondition)
      .skip(skip)
      .limit(limits)
      .populate({
        path: "category",
        match: { isActive: true },
      });

    // Calculate stock for each product
    for (const product of ProductsData) {
      const totalStocks = product.sizes.reduce(
        (acc, size) => acc + size.stock,
        0
      );
      product.stocks = totalStocks;
      await product.save();
    }

    // Filter products with valid category
    const filteredProducts = ProductsData.filter(
      (product) => product.category !== null
    );

    // Get max price
    const maxPriceAgg = await productModel.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const maxPrice = maxPriceAgg.length > 0 ? maxPriceAgg[0].maxPrice : 0;

    // Total count for pagination
    const totalCount = await productModel.countDocuments({
      ...searchCondition,
      ...filterCondition,
    });

    const totalPages = Math.ceil(totalCount / limits);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      ProductsData: filteredProducts,
      maxPrice,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

/////////////////////////////////// frctch product  By ID //////////////////////////////////

async function fetchProduct(req, res) {
  try {
    const { id } = req.params;

    const productData = await productModel.findById(id).populate("category");

    if (!productData) {
      return res
        .status(401)
        .json({ success: false, message: "No Products found" });
    }

    let totalStocks = 0;
    productData.sizes.forEach((s) => {
      totalStocks += s.stock;
    });

    productData.stocks = totalStocks;
    await productData.save();

    res.status(200).json({
      success: true,
      message: "category fetched successfully",
      productData,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Server internal errors" });
  }
}
async function fetchSize(req, res) {
  try {
    const { id } = req.params;

    const prodcutData = await productModel.findById({ _id: id });
    const sizeData = prodcutData.sizes;
    if (!sizeData) {
      return res
        .status(401)
        .json({ success: false, message: "Error while fetching size data" });
    }
    return res.status(200).json({ success: true, sizeData });
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  fetchProducts,
  fetchProduct,
  fetchSize,
  fetchProductsHome,
};
