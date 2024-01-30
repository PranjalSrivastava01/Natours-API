const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create transporter
  console.log('printing mail trap details');
  console.log(process.env.EMAIL_HOST), console.log(process.env.EMAIL_PORT);
  console.log(process.env.EMAIL_USERNAME);
  console.log(process.env.EMAIL_PASSWORD);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });

  // 2. Define email options
  // console.log(options.email),
  // console.log(options.subject),
  // console.log(options.message)
  const mailOptions = {
    from: 'Pranjal Srivastava CEO <pranjals0105@gmail.com>', // <-- Fix the missing '>'
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
