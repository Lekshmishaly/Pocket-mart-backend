const Reviews = require("../../Models/reviewsModel");

////////////////////////////////////// add review ////////////////////////////////////////

async function addReview(req, res) {
  try {
    const { userId, productId, rating, review } = req.body;

    // Validation
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required.",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5." });
    }

    if (!review || review.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Review comment is required." });
    }

    const reviewDetails = new Reviews({
      user: userId,
      product: productId,
      rating,
      comment: review.trim(),
    });

    const reviewAdded = await reviewDetails.save();

    if (!reviewAdded) {
      return res
        .status(401)
        .json({ success: false, message: "Unable to add your review." });
    }

    return res.status(200).json({
      success: true,
      message: "Your review is added successfully.",
    });
  } catch (error) {
    console.error("Error in Review Adding:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the review.",
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
