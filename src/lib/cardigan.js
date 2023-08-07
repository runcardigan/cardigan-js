import { ApiClient } from "./api_client";
import { BalanceChecker } from "./balance_checker/balance_checker";
import { Checkout } from "./checkout/checkout";
import { ProductForm } from "./product_form/product_form";

class Cardigan {

  constructor(document, Shopify, config = {}, templates = {}) {
    const api = new ApiClient(config);
    this.api = api;
    this.balanceChecker = new BalanceChecker(document, api, config, templates);
    this.checkout = new Checkout(document, api, config, templates, Shopify);
    this.productForm = new ProductForm(document, api, config);
  }

}

export {
  ApiClient,
  BalanceChecker,
  Checkout,
  Cardigan,
  ProductForm
}
