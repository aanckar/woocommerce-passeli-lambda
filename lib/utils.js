const passeliLangCodes = {
  fi: "FI",
  en: "GB",
  se: "SE",
  no: "NO",
  dk: "DK",
  de: "DE",
  ru: "RU",
  be: "BE",
  ee: "EE",
};

function formatDate(str) {
  return str.replace(/-/g, "").substr(0, 8);
}

function formatAmount(amount) {
  return parseFloat(Number(amount).toFixed(6)).toString().replace(".", ",");
}

function getOrderMetaValue(key, metaData) {
  const entry = metaData.find((item) => item.key === key);
  return entry ? entry.value || null : null;
}

function getPasseliLangCode(code = "en") {
  passeliLangCodes[code] || passeliLangCodes.en;
}

function vatNumberToFIBusinnessId(str) {
  const number = str.replace("FI", "");
  return [number.slice(0, 7), number.slice(7, 8)].join("-");
}

module.exports = {
  formatDate,
  formatAmount,
  getOrderMetaValue,
  getPasseliLangCode,
  vatNumberToFIBusinnessId,
};
