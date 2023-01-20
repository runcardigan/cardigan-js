import { ApiClient } from "./api_client";
import { BalanceChecker } from "./balance_checker/balance_checker";

export class Cardigan {

  constructor(document, Shopify, config = {}) {
    const api = new ApiClient(config);
    this.api = api;
    this.balanceChecker = new BalanceChecker(document, api, config);
  }

}
