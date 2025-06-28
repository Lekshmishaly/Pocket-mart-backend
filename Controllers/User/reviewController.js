const Reviews = require("../../Models/reviewsModel");

////////////////////////////////////// add review ////////////////////////////////////////

async function addReview(req, res) {
  try {
    const { userId, productId, rating, review } = req.body;

    const reviewDetails = new Reviews({
      user: userId,
      product: productId,
      rating,
      comment: review,
    });

    const reviewAdded = await reviewDetails.save();

    if (!reviewAdded) {
      return res
        .status(401)
        .json({ success: false, message: "Unble to add your Review" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Your review is added Successfully" });
  } catch (error) {
    console.error("Error in Review Adding:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while Adding the Review",
    });
  }
}

////////////////////////////////////// fetch review ////////////////////////////////////////

async function fetchReview(req, res) {
  try {
    const { productId } = req.params;

    const reviewData = await Reviews.find({ product: productId })
      .populate({
        path: "user",
        select: "firstname lastname",
      })
      .sort({ updatedAt: -1 });

    if (!reviewData || reviewData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No reviews found" });
    }

    return res.status(200).json({ success: true, reviewData });
  } catch (error) {
    console.error("Error in fetching Review :", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the Review",
    });
  }
}

////////////////////////////////////// fetch Average Rating ////////////////////////////////////////

async function fetchAverageRating(req, res) {
  try {
    const { productId } = req.params;

    const reviewsData = await Reviews.find({ product: productId });
    let sum = 0;
    reviewsData.forEach((review) => {
      sum += review.rating;
    });

    let avg = sum / reviewsData.length;

    const roundedAvg = Math.round(avg);

    return res.status(200).json({
      success: true,
      averageRating: roundedAvg,
    });
  } catch (err) {
    console.error("Error fetching average rating:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

module.exports = { addReview, fetchReview, fetchAverageRating };
