const aws = require("aws-sdk");
const ses = new aws.SES({ region: "eu-central-1" });
const MailComposer = require("nodemailer/lib/mail-composer");

function buildRawMail(mail) {
  return new Promise((resolve, reject) => {
    const compiled = mail.compile();
    compiled.keepBcc = true;
    compiled.build((err, message) => {
      if (err) {
        reject(err);
      }
      resolve(message);
    });
  });
}

async function sendMail(options) {
  const mail = new MailComposer(options);
  try {
    const rawMail = await buildRawMail(mail);
    await ses.sendRawEmail({ RawMessage: { Data: rawMail } }).promise();
  } catch (err) {
    console.error(err);
  }
}

module.exports = sendMail;
