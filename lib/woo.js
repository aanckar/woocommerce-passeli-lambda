require("dotenv").config();
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const createXml = require("./xml");

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_SITE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: "wc/v3",
});

async function fetchWooData(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    api
      .get(endpoint, params)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => reject(error));
  });
}

async function wooOrdersToXml(config, count = 1) {
  const options = { dp: 6, ...(count > 0 ? { per_page: count } : null) };
  const orders = await fetchWooData("orders", options);
  if (!orders || !Array.isArray(orders)) {
    console.error("Error: unable to fetch WooCommerce data");
    return {};
  }
  const xml = createXml({
    orders,
    ...config,
  });
  return {
    orders,
    xml,
  };
}

module.exports = wooOrdersToXml;
