const Order = require("../../Models/orderModel");
const { generateDateFilterQuery } = require("../../Utils/salesReport");
const PDFDocument = require("pdfkit-table");
const ExcelJS = require("exceljs");

///////////////////////////////////////////////////// fetch sales report ////////////////////////////////////////////////////

async function fetchSalesReport(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const { filterType, startDate, endDate } = req.query;

    const filterQueries = generateDateFilterQuery(
      filterType,
      startDate,
      endDate
    );

    const totalSalesCount = await Order.countDocuments(filterQueries);
    const orders = await Order.find(filterQueries)
      .populate("user")
      .populate("shipping_address")
      .populate("order_items.productId")
      .sort({ placed_at: -1 })
      .skip(skip)
      .limit(limit);

    let totalSales = orders.reduce((total, order) => {
      const orderTotal = order.order_items.reduce((sum, item) => {
        return sum + item.price * item.qty;
      }, 0);
      return total + orderTotal;
    }, 0);

    res.status(200).json({
      sucess: true,
      orders,
      totalSales,
      currentPage: page,
      totalPages: Math.ceil(totalSalesCount / limit),
    });
  } catch (err) {
    console.log(err);
  }
}

///////////////////////////////////////////////////// dowload Sales PDF ////////////////////////////////////////////////////

const dowloadSalesPDF = async (req, res) => {
  try {
    const { filterType, startDate, endDate } = req.query;

    const filterQueries = generateDateFilterQuery(
      filterType,
      startDate,
      endDate
    );

    const reports = await Order.find(filterQueries)
      .populate("user")
      .populate("shipping_address")
      .populate("order_items.productId")
      .sort({ placed_at: -1 });

    const pdfDoc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.pdf"
    );
    pdfDoc.pipe(res);

    pdfDoc.on("pageAdded", () => {
      pdfDoc
        .rect(0, 0, pdfDoc.page.width, pdfDoc.page.height)
        .fillColor("white")
        .fill()
        .fillColor("black");
    });

    pdfDoc
      .rect(0, 0, pdfDoc.page.width, pdfDoc.page.height)
      .fillColor("white")
      .fill()
      .fillColor("black");

    pdfDoc.fontSize(20).text("Sales Report", { align: "center" }).moveDown(2);

    for (let index = 0; index < reports.length; index++) {
      const report = reports[index];

      // Check if there is enough space for the current report header
      if (pdfDoc.y + 100 > pdfDoc.page.height) {
        pdfDoc.addPage();
      }

      pdfDoc.fontSize(14).font("Helvetica-Bold");
      pdfDoc.text(`Order ${index + 1}:`).moveDown(0.5);

      pdfDoc.fontSize(10).font("Helvetica");
      pdfDoc.text(
        `Order Date: ${new Date(report.placed_at).toLocaleDateString()}`
      );
      pdfDoc.text(
        `Customer Name: ${report.user.firstname} ${report.user.lastname}`
      );
      pdfDoc.text(`Payment Method: ${report.payment_method}`);
      const statuses = report.order_items
        .map((item) => item.order_status)
        .join(", ");
      pdfDoc.text(`Delivery Status: ${statuses}`).moveDown(0.8);

      // Prepare table data
      const table = {
        title: "Product Details",
        headers: [
          "Product Name",
          "Quantity",
          "Unit Price (RS)",
          "Total Price (RS)",
          "Coupon (RS)",
          "Discount (RS)",
        ],
        rows: report.order_items.map((item) => [
          item.productId.name,
          item.qty.toString(),
          (Number(item.price) || 0).toFixed(2),
          (Number(item.price * item.qty) || 0).toFixed(2),
          (Number(report.coupon_discount) || 0).toFixed(2),
          (Number(report.total_discount) || 0).toFixed(2),
        ]),
      };

      // Check if there is enough space before adding the table
      if (pdfDoc.y + 150 > pdfDoc.page.height) {
        pdfDoc.addPage();
      }

      try {
        await pdfDoc.table(table, {
          prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(8),
          width: 500,
          columnsSize: [140, 50, 70, 70, 70, 70],
          padding: 5,
        });
      } catch (error) {
        console.error("Error generating table:", error);
      }

      // Ensure there's enough space for the final amount
      if (pdfDoc.y + 20 > pdfDoc.page.height) {
        pdfDoc.addPage();
      }

      pdfDoc.moveDown(0.5);
      pdfDoc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`Final Amount: RS. ${report.total_price_with_discount}`);
      pdfDoc.moveDown();
    }

    pdfDoc.end();
  } catch (error) {
    console.error("Error generating sales report PDF:", error);
    res.status(500).send("Error generating sales report PDF");
  }
};

///////////////////////////////////////////////////// download Sales Excel ////////////////////////////////////////////////////

async function downloadSalesExcel(req, res) {
  try {
    const { filterType, startDate, endDate } = req.query;

    const filterQueries = generateDateFilterQuery(
      filterType,
      startDate,
      endDate
    );

    const reports = await Order.find(filterQueries)
      .populate("user")
      .populate("shipping_address")
      .populate("order_items.productId")
      .sort({ placed_at: -1 });

    // If no reports, send a message
    if (!reports || reports.length === 0) {
      return res
        .status(404)
        .json({ message: "No sales data found for the given filters." });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    // Create table design
    worksheet.columns = [
      { header: "Order Date", key: "orderDate", width: 20 },
      { header: "Customer Name", key: "customerName", width: 20 },
      { header: "Payment Method", key: "paymentMethod", width: 20 },
      { header: "Delivery Status", key: "deliveryStatus", width: 20 },
      { header: "Product Name", key: "productName", width: 25 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Unit Price (RS)", key: "unitPrice", width: 15 },
      { header: "Total Price (RS)", key: "totalPrice", width: 15 },
      { header: "Discount (RS)", key: "discount", width: 15 },
      { header: "Coupon (RS)", key: "couponDeduction", width: 15 },
      { header: "Final Amount (RS)", key: "finalAmount", width: 15 },
    ];

    // Add data to sheet
    reports.forEach((report) => {
      const orderDate = new Date(report.placed_at).toLocaleDateString();
      const products = report.order_items.map((item) => ({
        orderDate,
        customerName: `${report.user.firstname} ${report.user.lastname}`,
        paymentMethod: report.payment_method,
        deliveryStatus: item.order_status,
        productName: item.productId.name,
        quantity: item.qty,
        unitPrice: item.price || 0,
        totalPrice: item.price * item.qty || 0,
        discount: report.total_discount || 0,
        couponDeduction: report.coupon_discount || 0,
        finalAmount: report.total_price_with_discount || 0,
      }));

      // Add each product as a row
      products.forEach((product) => worksheet.addRow(product));
    });

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=SalesReport.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Write Excel file to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).json({ message: "Failed to generate sales report", error });
  }
}

module.exports = {
  fetchSalesReport,
  dowloadSalesPDF,
  downloadSalesExcel,
};
