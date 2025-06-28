require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

const MONGO_URI = process.env.DATABASE_ORGIN;
// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Could not connect to MongoDB", error));

// user Route.
const userRoute = require("./routes/userRoutes");
app.use("/user", userRoute);

// admin Route.

const adminRoute = require("./routes/adminRoutes");
const addressModel = require("./Models/addressModel");
app.use("/admin", adminRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`This app is running on http://localhost:${PORT}`);
});
