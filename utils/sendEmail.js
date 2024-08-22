const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmailNodeMailer = async (emailData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: emailData?.email,
      subject: emailData.subject,
      html: emailData.html,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("email error: ", error?.message);
  }
};
module.exports = sendEmailNodeMailer;
