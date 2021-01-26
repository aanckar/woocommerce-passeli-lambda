require("dotenv").config();
const { create } = require("xmlbuilder2");
const {
  formatDate,
  formatAmount,
  getOrderMetaValue,
  getPasseliLangCode,
  vatNumberToFIBusinnessId,
} = require("./utils");

function createXml({
  orders,
  storeId = "WC",
  companyId,
  orderAccount,
  rowAccount,
  shippingArticleCode,
  shippingTitle,
  shippingAccount,
  sellerContactName,
  sellerContactNo,
  paymentTermsText,
}) {
  const root = create({ encoding: "UTF-8" }).ele("Orders", { version: "1.0" });

  const obj = {
    Order: orders.map((order) => {
      const includeShippingDetails = Object.entries(order.shipping).some(
        ([key, value]) => order.billing[key] !== value
      );

      const vatNumber = getOrderMetaValue("vat_number", order.meta_data);
      const lang = getOrderMetaValue("wpml_language", order.meta_data);

      const fiBusinessId =
        vatNumber && order.billing.country === "FI"
          ? vatNumberToFIBusinnessId(vatNumber)
          : "";

      return {
        ...(companyId && { CompanyIdentifier: companyId }),
        OrderIdentifier: `${storeId}${order.id}`,
        OrderType: 1,
        Status: order.status === "pending" ? "0" : "1",
        OrderDate: {
          "@Format": "YYYYMMDD",
          "#": formatDate(order.date_created),
        },
        OrderTotalAmount: formatAmount(order.total),
        VatTotalAmount: formatAmount(order.total_tax),
        OrderTotalVatExcludedAmount: formatAmount(
          Number(order.total) - Number(order.total_tax)
        ),
        OrderInformation: {
          OrderFreeText: order.customer_note,
          OrderLanguage: getPasseliLangCode(lang),
          ...(orderAccount && { OrderAccount: orderAccount }),
          CurrencyCode: order.currency,
          SellerContactName: sellerContactName,
          SellerContactNo: sellerContactNo,
        },
        PaymentTerms: {
          PaymentTermsText: paymentTermsText,
          PaymentTermsNetDates: "0",
          CashDiscountDates: "0",
          CashDiscountPercent: "0",
        },
        InvoiceCustomer: {
          ExternalCustomerIdentifier: `${storeId}${order.id}`,
          CustomerName1: `${order.billing.first_name} ${order.billing.last_name}`,
          ...(order.billing.company && {
            CustomerName2: order.billing.company,
          }),
          CustomerAddress: `${order.billing.address_1}${
            order.billing.address_2 && ` ${order.billing.address_2}`
          }${order.billing.state && ` ${order.billing.state}`}`,
          CustomerPostCode: order.billing.postcode,
          CustomerTownName: order.billing.city,
          CustomerCountryCode: order.billing.country,
          CustomerPhone1: order.billing.phone,
          CustomerEmail: order.billing.email,
          ...(vatNumber && { CustomerTaxCode: vatNumber }),
          ...(fiBusinessId && { CustomerIdentifier: fiBusinessId }),
        },
        ...(includeShippingDetails && {
          DeliveryCustomer: {
            CustomerName1: `${order.shipping.first_name} ${order.shipping.last_name}`,
            ...(order.shipping.company && {
              CustomerName2: order.shipping.company,
            }),
            CustomerAddress: `${order.shipping.address_1}${
              order.shipping.address_2 && ` ${order.shipping.address_2}`
            }${order.shipping.state && ` ${order.shipping.state}`}`,
            CustomerPostCode: order.shipping.postcode,
            CustomerTownName: order.shipping.city,
            CustomerCountryCode: order.shipping.country,
            CustomerPhone1: order.billing.phone,
            CustomerEmail: order.billing.email,
          },
        }),
        OrderRows: {
          OrderRow: [
            ...order.line_items.map((lineItem) => {
              const totalTax = lineItem.taxes.reduce((acc, val) => {
                return acc + Number(val.total);
              }, 0);
              return {
                RowArticleCode: lineItem.sku,
                RowArticle: lineItem.name,
                ...(rowAccount && { RowAccount: rowAccount }),
                RowOrderedQuantity: lineItem.quantity,
                RowUnitPrice: formatAmount(lineItem.price), // unit price w/o tax w/o discount
                RowVatPercent: order.tax_lines[0].rate_percent,
                RowVatAmount: formatAmount(totalTax), // total tax w/ discount
                RowAmount: formatAmount(Number(lineItem.total) + totalTax), // total w/ tax w/ discount
                RowVatExcludedAmount: formatAmount(lineItem.total), // total w/o tax w/ discount
              };
            }),
            ...order.shipping_lines.map((lineItem) => {
              const totalWithTax =
                Number(lineItem.total) + Number(lineItem.total_tax);
              const price = totalWithTax - Number(lineItem.taxes[0].total);
              return {
                ...(shippingArticleCode && {
                  RowArticleCode: shippingArticleCode,
                }),
                RowArticle: shippingTitle,
                ...(shippingAccount && { RowAccount: shippingAccount }),
                RowOrderedQuantity: 1,
                RowUnitPrice: formatAmount(price),
                RowVatPercent: order.tax_lines[0].rate_percent,
                RowVatAmount: formatAmount(lineItem.taxes[0].total),
                RowAmount: formatAmount(totalWithTax),
                RowVatExcludedAmount: formatAmount(price),
              };
            }),
          ],
        },
      };
    }),
  };

  const doc = root.ele(obj);
  return doc.end({ prettyPrint: true });
}

module.exports = createXml;
