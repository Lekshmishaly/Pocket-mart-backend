const jwt = require("jsonwebtoken");
require("dotenv").config;

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_KEY, {
    expiresIn: "15m",
  });
};

module.exports = generateAccessToken;
