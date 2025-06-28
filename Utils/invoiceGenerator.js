//////////////////////////////////////////////////  1. generateHeader(pdfDoc)  //////////////////////////////////////////////////

function generateHeader(doc) {
  doc
    .fontSize(20)
    .fillColor("#333333")
    .text("Pocket Mart", 50, 50)
    .fontSize(10)
    .fillColor("gray")
    .text("www.pocketmart.com", 50, 75)
    .text("Email: support@pocketmart.com", 50, 90)
    .moveDown();
}

////////////////////////////////////////////// 2. generateInvoiceInfo  ///////////////////////////////////////

function generateInvoiceInfo(doc, order) {
  doc
    .fontSize(14)
    .fillColor("#333333")
    .text(`Invoice`, 400, 50, { align: "right" })
    .fontSize(10)
    .fillColor("gray")
    .text(`Invoice Number: ${order.order_id}`, { align: "right" })
    .text(`Order Date: ${new Date(order.placed_at).toLocaleDateString()}`, {
      align: "right",
    });

  let y = 20;
  doc
    .moveTo(50, y + 90)
    .lineTo(550, y + 90)
    .lineWidth(1)
    .strokeColor("#aaaaaa")
    .stroke();
}

///////////////////////////////////////////  3. generateAddressSection ///////////////////////////////////////

function generateAddressSection(doc, order) {
  const address = order.shipping_address || {};
  let y = 130;

  // Section title
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#333")
    .text("Shipping Address:", 50, y);

  y += 20; // Push down before starting address content

  // Address details
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#000")
    .text(`${address.firstname || ""} ${address.lastname || ""}`, 50, y);

  y += 18;
  doc.text(`${address.address || ""}, ${address.landMark || ""}`, 50, y);

  y += 18;
  doc.text(
    `${address.city || ""}, ${address.state || ""}, ${
      address.postalCode || ""
    }`,
    50,
    y
  );

  y += 18;
  doc.text(`Phone: ${address.phone || ""}`, 50, y);

  // Horizontal line below the address section
  y += 20;
  doc.moveTo(50, y).lineTo(550, y).lineWidth(1).strokeColor("#aaaaaa").stroke();
}

/////////////////////////////////////////////  4. generateItemsTable ////////////////////////////////////////

function generateItemsTable(doc, items) {
  let y = 260;

  // Section Title
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#333")
    .text("Items", 50, y);

  y += 20;

  // Table Headers
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("gray")
    .text("Name", 50, y)
    .text("Size", 250, y)
    .text("Qty", 300, y, { width: 50, align: "right" })
    .text("Price", 380, y, { width: 80, align: "right" })
    .text("Total", 470, y, { width: 80, align: "right" });

  y += 20;

  // Table Rows
  doc.font("Helvetica").fontSize(10).fillColor("#333");
  items.forEach((item) => {
    const product = item.productId;
    const size = item.size;
    const quantity = item.qty;
    const price = item.price;
    const total = quantity * price;

    doc
      .text(product?.name || "Unknown", 50, y)
      .text(size.toString(), 250, y)
      .text(quantity.toString(), 300, y, { width: 50, align: "right" })
      .text(`Rs ${price.toFixed(2)}`, 380, y, { width: 80, align: "right" })
      .text(`Rs ${total.toFixed(2)}`, 470, y, { width: 80, align: "right" });

    y += 20;
  });

  // Horizontal line after table
  doc
    .moveTo(50, y + 10)
    .lineTo(550, y + 10)
    .lineWidth(1)
    .strokeColor("#aaaaaa")
    .stroke();
}

/////////////////////////////////////////////  5. generatePaymentSummary  /////////////////////////////////////

function generatePaymentSummary(doc, order) {
  const top = doc.y + 60;
  const labelX = 430;
  const valueX = 470;

  const { shipping_fee = 0, total_discount = 0, total_amount = 0 } = order;

  // Payment details
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#000")
    .text("Subtotal:", labelX, top)
    .text(`Rs ${total_amount.toFixed(2)}`, valueX, top, { align: "right" })
    .text("Discount:", labelX, top + 40)
    .text(`-Rs ${total_discount.toFixed(2)}`, valueX, top + 40, {
      align: "right",
    })
    .text("Shipping:", labelX, top + 20)
    .text(`Rs ${shipping_fee.toFixed(2)}`, valueX, top + 20, {
      align: "right",
    });

  // Horizontal line
  doc
    .moveTo(50, top + 65)
    .lineTo(550, top + 65)
    .lineWidth(1)
    .strokeColor("#aaaaaa")
    .stroke();

  // Total section
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#333")
    .text("Total: ", labelX + 15, top + 75)
    .text(
      ` Rs ${order.total_price_with_discount.toFixed(2)}`,
      valueX,
      top + 75,
      { align: "right" }
    );

  // Optional bottom line
  doc
    .moveTo(50, top + 105)
    .lineTo(550, top + 105)
    .lineWidth(1)
    .strokeColor("#aaaaaa")
    .stroke();
}

////////////////////////////////////////////////// 6. generateFooter ////////////////////////////////////////////////////

function generateFooter(doc) {
  doc
    .fontSize(10)
    .fillColor("gray")
    .text("Thank you for shopping with us!", 50, 620, { align: "center" })
    .text("For any queries, please contact s support@pocketmart.com", 50, 635, {
      align: "center",
    })
    .text("www.pocketmart.com", 50, 650, { align: "center", color: "blue" });

  let y = 20;
  doc
    .moveTo(50, y + 90) // horizontal line position (below total)
    .lineTo(550, y + 90)
    .lineWidth(1)
    .strokeColor("#aaaaaa")
    .stroke();
}

module.exports = {
  generateHeader,
  generateInvoiceInfo,
  generateAddressSection,
  generateItemsTable,
  generatePaymentSummary,
  generateFooter,
};
