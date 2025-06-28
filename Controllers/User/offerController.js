const Offer = require("../../Models/offerModel");

async function fetchBoldOffer(req, res) {
  try {
    const { product_id, category_id, product_price } = req.query;

    const productOffer = await Offer.findOne({ target_id: product_id });
    const categoryOffer = await Offer.findOne({ target_id: category_id });

    return res.json({
      productOffer: productOffer ? productOffer.discountValue : null,
      categoryOffer: categoryOffer ? categoryOffer.discountValue : null,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching offers." });
  }
}

module.exports = { fetchBoldOffer };
