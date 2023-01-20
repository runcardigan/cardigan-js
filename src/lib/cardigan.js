import { ApiClient } from "./api_client";

export class Cardigan {

  constructor(document, Shopify, config = {}) {
    const api = new ApiClient(config);
    this.api = api;
  }

}
