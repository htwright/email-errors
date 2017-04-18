'use strict';

const express = require('express');
const morgan = require('morgan');
// this will load our .env file if we're
// running locally. On Gomix, .env files
// are automatically loaded.
require('dotenv').config();
const {ALERT_FROM_EMAIL, ALERT_FROM_NAME, ALERT_TO_EMAIL} = process.env;
const {logger} = require('./utilities/logger');
// these are custom errors we've created
const {FooError, BarError, BizzError} = require('./errors');

const{sendEmail} = require('./emailer');

const app = express();

// this route handler randomly throws one of `FooError`,
// `BarError`, or `BizzError`
const russianRoulette = (req, res) => {
  const errors = [FooError, BarError, BizzError];
  throw new errors[
    Math.floor(Math.random() * errors.length)]('It blew up!');
};


app.use(morgan('common', {stream: logger.stream}));

// for any GET request, we'll run our `russianRoulette` function
app.get('*', russianRoulette);

// YOUR MIDDLEWARE FUNCTION should be activated here using
// `app.use()`. It needs to come BEFORE the `app.use` call
// below, which sends a 500 and error message to the client
function sendEmailAlert(err, req, res, next){
  if(err.type === "FooError" || err.type === "BarError") {
    const mailOptions = {
       from: "SERVICE ALERTS",
       to: process.env.ALERT_TO_EMAIL,
       subject: "`ALERT: a ${err.type} occurred`",
       text: "",
       html: `<p>${err.message} ${err.stack}</p>`
      }
    sendEmail(mailOptions);
  }
  next(err);
}
app.use(sendEmailAlert);
// function sendEmailAlerts(err,req,res,next) {
//   if (err instanceof FooError || err instanceof BarError) {
//     logger.info(`I just sent an email detailing the error to ${ALERT_TO_EMAIL}`);
//     const emailInfo = {
//       from: ALERT_FROM_EMAIL,
//       to: ALERT_TO_EMAIL,
//       subject: `I found some errors. Here it is: ${err.name}`,
//       text: `Here's what happened: ${err.stack}`
//     };
//   sendEmail(emailInfo);
//   }
//   next();
// }
// app.use(sendEmailAlerts);

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({error: 'Something went wrong'}).end();
});

const port = process.env.PORT || 8080;

const listener = app.listen(port, function () {
  logger.info(`Your app is listening on port ${port}`);
});
