'use strict';

const nodemailer = require('nodemailer');
const {logger} = require('./utilities/logger');

// stored in `.env` -- never store passwords, api keys
// etc. inside source code
const {SMTP_URL} = process.env;


// `emailData` is an object that looks like this:
let mailOptions = {
 from: "SERVICE ALERTS",
 to: process.env.ALERT_TO_EMAIL,
 subject: "",
 text: "",
 html: ""
}
const sendEmail = (emailData, smtpUrl=SMTP_URL) => {
  const transporter = nodemailer.createTransport(SMTP_URL);
  logger.info(`Attempting to send email from ${emailData.from}`);
  return transporter
    .sendMail(emailData)
    .then(info => console.log(`Message sent: ${info.response}`))
    .catch(err => console.log(`Problem sending email: ${err}`));
}


module.exports = {sendEmail, mailOptions};
