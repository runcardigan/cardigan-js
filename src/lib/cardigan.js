import { ApiClient } from "./api_client";
import { BalanceChecker } from "./balance_checker/balance_checker";
import { ProductForm } from "./product_form/product_form";

export class Cardigan {

  constructor(document, Shopify, config = {}) {
    const api = new ApiClient(config);
    this.api = api;
    this.balanceChecker = new BalanceChecker(document, api, config);
    this.productForm = new ProductForm(document, api, config);
  }

}
