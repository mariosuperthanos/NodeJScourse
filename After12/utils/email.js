const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    // I used mailtrap for email testing
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // Fix: Use 'port' instead of 'host' here
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    // Activate in Gmail "less secure apps" option if using Gmail
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Mario David <mario.bargianu@gmail.com>', // Set the sender email
    to: options.email, // Recipient email
    subject: options.subject, // Email subject
    text: options.message, // Email message
    // html: options.html // You can use HTML content here if needed
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};


module.exports = sendEmail;