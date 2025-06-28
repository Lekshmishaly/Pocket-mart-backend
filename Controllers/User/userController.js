// Import Google Auth Library
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//models
const User = require("../../Models/userModel");
const otpSchema = require("../../Models/otpModel");

//utils
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const { mailSender } = require("../../Utils/nodeMailer");
const otpEmailTemplate = require("../../Utils/emailTemplate");
const generateReferralCode = require("../../Utils/generateReferralCode");

//functions
const generateAccessToken = require("../../Utils/genarateAccessToken");
const generateRefreshToken = require("../../Utils/genarateRefreshToken");
const Wallet = require("../../Models/walletModel");

//////////////////////////////////// send otp /////////////////////////////////

async function sendOtp(req, res) {
  try {
    const { userEmail } = req.body;
    const checkExist = await User.findOne({ email: userEmail });
    const cehckOtpExist = await otpSchema.deleteOne({ email: userEmail });

    if (checkExist) {
      return res
        .status(401)
        .json({ success: false, message: "E-mail already Exist" });
    }
    const otp = otpGenerator.generate(5, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await otpSchema.create({ email: userEmail, otp });
    const { subject, htmlContent } = otpEmailTemplate(otp);
    const mailRes = await mailSender(userEmail, subject, htmlContent);

    return res
      .status(200)
      .json({ success: true, message: "OTP Send Successfully", otp });
  } catch (err) {
    console.log(err);
  }
}

///////////////////////////////// create users ///////////////////////////////////

async function createUser(req, res) {
  try {
    const { userFirstName, userLastName, userEmail, userMobile, userPassword } =
      req.body;

    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const referralCode = generateReferralCode(userFirstName);
    // Create new user
    await User.create({
      firstname: userFirstName,
      lastname: userLastName,
      email: userEmail,
      phone: userMobile,
      password: hashedPassword,
      referralCode,
    });

    return res.status(200).json({
      success: true,
      message: "Your are Registered to Pocket Mart, Welcome",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
///////////////////////////////// user Login /////////////////////////////////

async function userLogin(req, res) {
  try {
    const { userEmail, userPassword } = req.body;
    const userData = await User.findOne({ email: userEmail });
    if (!userData.isActive) {
      return res.status(401).json({
        success: false,
        message:
          "You can't access the account.The account is Blocked by the admin",
      });
    }
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered, Please Signup",
      });
    }

    const matchPass = await bcrypt.compare(userPassword, userData.password);
    if (matchPass) {
      if (userData.isActive == false) {
        const message = `Your account is currently inactive, and access to the website is restricted...!`;
        return res.status(403).json({ success: false, message });
      }

      userData.password = undefined;

      const accessToken = generateAccessToken(userData._id);
      const refreshToken = generateRefreshToken(userData._id);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 minutes expiration for access token
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration for refresh token
      });
      return res.status(200).json({
        success: true,
        message: "Login Successful, Welcome Back",
        userData,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  } catch (err) {
    console.error("Unexpected error during login:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}

///////////////////////////////// google Auth //////////////////////////////////

async function googleAuth(req, res) {
  try {
    const { sub, name, email } = req.body;
    const userData = await User.findOne({ email });

    if (userData) {
      if (userData.googleId && userData.googleId == sub) {
        return res
          .status(200)
          .json({ success: true, message: "Login Successful", userData });
      } else if (userData.googleId && userData.googleId != sub) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized User" });
      } else if (!userData.googleId || userData.googleId === "") {
        userData.googleId = sub;
        await userData.save();

        return res.status(200).json({
          success: true,
          message: "Login Successful,Welcome Back",
          userData,
        });
      }
    } else {
      const newUser = new User({
        name: name,
        email: email,
        googleId: sub,
      });
      const userData = await newUser.save();
      return res.status(201).json({
        success: true,
        message: "You are Registered, Welcome to Pocket Mart",
        userData,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

/////////////////////////////////// edit profile //////////////////////////////////

async function editUser(req, res) {
  try {
    const { userId, firstname, lastname, phone } = req.body;
    const update = await User.findByIdAndUpdate(
      { _id: userId },
      { firstname, lastname, phone },
      { new: true }
    );
    if (!update) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to update Profile" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Profile Updated", update });
  } catch (err) {
    console.log(err);
  }
}

// forget Password
async function forgetPassword(req, res) {
  try {
    const { userEmail } = req.body;
    const checkExist = await User.findOne({ email: userEmail });
    if (!checkExist) {
      return res
        .status(404)
        .json({ success: false, message: "E-mail Does not Exist" });
    }

    // Check if there's an existing OTP for this email
    const existingOtp = await otpSchema.findOne({ email: userEmail });
    if (existingOtp) {
      const timeDiff = new Date() - existingOtp.createdAt;
      if (timeDiff < 5 * 60 * 1000) {
        // OTP is valid for 5 minutes
        return res
          .status(200)
          .json({ success: true, message: "OTP already sent recently" });
      }
      await existingOtp.deleteOne(); // Remove old OTP if expired
    }

    const otp = otpGenerator.generate(5, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    await otpSchema.create({ email: userEmail, otp, createdAt: new Date() });
    const { subject, htmlContent } = otpEmailTemplate(otp);

    const mailRes = await mailSender(userEmail, subject, htmlContent);

    return res
      .status(200)
      .json({ success: true, message: "OTP Sent Successfully", otp });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

///////////////////////////////// reset Password ////////////////////////////////////////

async function resetPassword(req, res) {
  try {
    const { newPassword, confirmPassword, userEmail } = req.body;

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while resetting the password",
    });
  }
}

///////////////////////////////// logout ////////////////////////////////////////

async function logout(req, res) {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
}

//////////////////////////// change Password //////////////////////////////

async function changePassword(req, res) {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is missing." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    const updatePassword = await bcrypt.hash(newPassword, 10);
    const updateUserData = await User.findByIdAndUpdate(
      { _id: userId },
      { password: updatePassword }
    );

    return res
      .status(200)
      .json({ message: "Password Updated Successfuly", success: true });
  } catch (error) {
    console.error("Error in verifyPassword:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
}

/////////////////////////////////////////////////////// Register With Referral ////////////////////////////////////////////////////

async function referral(req, res) {
  try {
    const { referralCode, _id } = req.body;
    const referralAmount = 200;

    // Validate referred user
    const user = await User.findById(_id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.usedReferral) {
      return res
        .status(400)
        .json({ success: false, message: "Referral already used" });
    }

    // Validate referrer
    const referrer = await User.findOne({ referralCode: referralCode });
    if (!referrer) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Referral Code" });
    }

    // Update referrer's wallet
    let referralWallet = await Wallet.findOne({ user: referrer._id });

    if (!referralWallet) {
      referralWallet = await Wallet.create({
        user: referrer._id,
        balance: referralAmount,
        transactions: [
          {
            transaction_type: "credit",
            transaction_status: "completed",
            amount: referralAmount,
          },
        ],
      });
    } else {
      referralWallet = await Wallet.findOneAndUpdate(
        { user: referrer._id },
        {
          $inc: { balance: referralAmount },
          $push: {
            transactions: {
              transaction_type: "credit",
              transaction_status: "completed",
              amount: referralAmount,
            },
          },
        },
        { new: true }
      );
    }

    // Update referred user's wallet
    let userWallet = await Wallet.findOne({ user: user._id });

    if (!userWallet) {
      userWallet = await Wallet.create({
        user: user._id,
        balance: referralAmount,
        transactions: [
          {
            transaction_type: "credit",
            transaction_status: "completed",
            amount: referralAmount,
          },
        ],
      });
    } else {
      userWallet = await Wallet.findOneAndUpdate(
        { user: user._id },
        {
          $inc: { balance: referralAmount },
          $push: {
            transactions: {
              transaction_type: "credit",
              transaction_status: "completed",
              amount: referralAmount,
            },
          },
        },
        { new: true }
      );
    }

    // Mark referral as used
    user.usedReferral = true;
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: "Referral reward credited to both wallets!",
      updatedUser,
    });
  } catch (err) {
    console.error("Referral Error:", err.message || err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/////////////////////////////////////////////////////// skip Referal ////////////////////////////////////////////////////

async function skipReferral(req, res) {
  try {
    const { _id } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { usedReferral: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    updatedUser.password = undefined;

    return res.status(200).json({
      success: true,
      updatedUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error while skipping referral",
    });
  }
}
module.exports = {
  sendOtp,
  createUser,
  userLogin,
  googleAuth,
  editUser,
  forgetPassword,
  resetPassword,
  logout,
  changePassword,
  referral,
  skipReferral,
};
