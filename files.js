const fs = require("fs");
const wooOrdersToXml = require("./lib/woo");
const config = require("./config");

async function saveFiles() {
  const { orders, xml } = await wooOrdersToXml(config.woo);
  if (!orders || !xml) {
    return;
  }
  fs.writeFileSync("output/orders.json", JSON.stringify(orders, null, 2));
  fs.writeFileSync("output/orders.xml", xml);
}

saveFiles();
