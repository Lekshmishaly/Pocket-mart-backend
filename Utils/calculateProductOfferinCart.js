function calculateProductOfferinCart(item) {
  const productOffer = item.productId.appliedOffer?.discountValue || 0;
  const categoryOffer =
    item.productId.category.appliedOffer?.discountValue || 0;

  let discountAmount = 0;
  let discountPercentage = 0;

  // highest discount offer
  if (categoryOffer > productOffer) {
    discountAmount = (item.price * categoryOffer) / 100;
    discountPercentage = categoryOffer;
  } else if (productOffer > categoryOffer) {
    discountAmount = (item.price * productOffer) / 100;
    discountPercentage = productOffer;
  } else if (productOffer === categoryOffer && productOffer > 0) {
    discountAmount = (item.price * productOffer) / 100;
    discountPercentage = productOffer;
  }

  // final price after discount
  const discountedAmount = item.price - discountAmount;

  item.discount = discountPercentage;
  item.discountAmount = discountAmount;
  item.discountedAmount = discountedAmount;
}

module.exports = calculateProductOfferinCart;
