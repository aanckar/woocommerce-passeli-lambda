# WooCommerce -> Visma Passeli integration

A very basic serverless (AWS Lambda) function that

- fetches the latest WooCommerce orders using the WooCommerce REST API
- Creates a Passeli-compatible XML
- Sends the XML via email
