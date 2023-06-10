const { EMAIL_FROM, EMAIL_SUBJECT, FRONTEND_URL } = process.env;
module.exports = {
  from: EMAIL_FROM,
  subject: EMAIL_SUBJECT,
  frontendUrl: FRONTEND_URL  
};

