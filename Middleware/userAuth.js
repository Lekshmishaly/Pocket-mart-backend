require("dotenv").config();
const otpSchema = require("../Models/otpModel");
const User = require("../Models/userModel");
const generateAccessToken = require("../Utils/genarateAccessToken");

//verify otp
async function verifyOtp(req, res, next) {
  try {
    const { otp, userEmail } = req.body;

    const otpData = await otpSchema.findOne({ email: userEmail });

    if (!otpData) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    if (otp !== otpData.otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    const timeDiff = new Date() - otpData.createdAt;
    if (timeDiff > 1 * 60 * 1000) {
      // OTP valid for 5 minutes
      await otpData.deleteOne(); // Remove expired OTP
      return res
        .status(400)
        .json({ success: false, message: "OTP expired", otpData });
    }

    await otpSchema.deleteOne({ email: userEmail });
    next();
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// jwt Verification
async function jwtVerification(req, res, next) {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (accessToken) {
      const Accessverified = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_KEY
        // "RefreshtokenKeyShouldReplaceLater"
      );

      const user = await User.findById(Accessverified.id).select("-password");

      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User not found" });
      }

      req.user = user;
      return next();
    } else if (refreshToken) {
      const RefreshVerified = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
        // "RefreshtokenKeyShouldReplaceLater"
      );

      const user = await User.findById(RefreshVerified.id).select("-password");
      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User not found" });
      }

      const newAccessToken = generateAccessToken(user._id);

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      });

      req.user = user;
      return next();
    }

    return res
      .status(401)
      .json({ message: "Unauthorized: No valid tokens found" });
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ message: "Unauthorized: Token verification failed" });
  }
}
module.exports = {
  verifyOtp,
  jwtVerification,
};
