/////////////////////////////////////////////////// Date Filter Query ////////////////////////////////////////////////////

function generateDateFilterQuery(filterType, startDate, endDate) {
  const now = new Date();

  const filterQueries = {
    order_items: {
      $elemMatch: { order_status: "Delivered" }, // Ensure at least one order item is delivered
    },
  };
  if (filterType === "custom" && startDate && endDate) {
    // Custom date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    filterQueries.placed_at = { $gte: start, $lte: end };
  } else if (filterType === "daily") {
    // Filter for today
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    filterQueries.placed_at = { $gte: startOfDay, $lte: endOfDay };
  } else if (filterType === "weekly") {
    // Filter for the current week
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    filterQueries.placed_at = { $gte: startOfWeek, $lte: endOfWeek };
  } else if (filterType === "monthly") {
    // Filter for the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    filterQueries.placed_at = { $gte: startOfMonth, $lte: endOfMonth };
  } else if (filterType === "yearly") {
    // Filter for the current year
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    filterQueries.placed_at = { $gte: startOfYear, $lte: endOfYear };
  }

  return filterQueries;
}
module.exports = { generateDateFilterQuery };
