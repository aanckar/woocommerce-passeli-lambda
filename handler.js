const wooOrdersToXml = require("./lib/woo");
const sendMail = require("./lib/mail");
const config = require("./config");

exports.sendOrders = async function () {
  const { xml } = await wooOrdersToXml(config.woo);
  if (!xml) {
    console.error("Unable to create XML");
    return;
  }
  await sendMail({
    ...config.mail,
    attachments: [
      {
        filename: "orders.xml",
        content: xml,
      },
    ],
  });
};
