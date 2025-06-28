const nodemailer = require("nodemailer");
const mailSender = async (email, subject, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.APP_PASSWORD,
      },
    });
    let info = await transporter.sendMail({
      from: "Lekshmi Shaly",
      to: email,
      subject: subject,
      html: body,
    });
    return info;
  } catch (err) {
    console.log(err);
  }
};
module.exports = { mailSender };
