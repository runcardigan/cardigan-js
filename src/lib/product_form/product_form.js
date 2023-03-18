import {
  SELECTOR_PRODUCT_FORM_FORM,
} from "../constants";
import { ProductFormForm } from "./product_form_form";

export class ProductForm {

  constructor(document, api, config) {
    this.document = document;
    this.api = api;
    this.config = config;

    this.initialise();
  }

  initialise() {
    this.debug('initialise()');

    const { document, api, config } = this;

    // initialise all product forms on the page
    document.querySelectorAll(SELECTOR_PRODUCT_FORM_FORM).forEach(formElement => {
      // skip if the form is already initialised
      if(formElement.dataset.cardigan === 'true') {
        return;
      }

      new ProductFormForm(formElement, api, config);
    });
  }

  debug(...args) {
    if(!this.config.debug) {
      return;
    }

    console.log('[Cardigan Product Form]', ...args);
  }

}
