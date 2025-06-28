function otpEmailTemplate(otp) {
  return {
    subject: "Your OTP VERIFICATION code from Pocket Mart",
    htmlContent: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h1 style="color: #4CAF50;">Your OTP is Here!</h1>
          <p style="font-size: 16px; color: #333;">Dear User,</p>
          <p style="font-size: 18px; font-weight: bold; color: #000;">
            Your One-Time Password (OTP) is:
          </p>
          <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">
            <strong>${otp}</strong>
          </p>
          <p style="font-size: 14px; color: #555;">
            Please use this code to complete your verification,please don't share this otp with anyone. It is valid for
            the next 02 minutes.
          </p>
          <p style="font-size: 14px; color: #555;">
            If you did not request this code, please ignore this email.
          </p>
          <footer style="margin-top: 20px; font-size: 12px; color: #888;">
            Regards, <br />
            The Pocket Mart Team
          </footer>
        </div>
      `,
  };
}

module.exports = otpEmailTemplate;
