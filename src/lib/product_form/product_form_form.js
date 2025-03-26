import {
  SELECTOR_PRODUCT_FORM_RECIPIENT_NAME,
  SELECTOR_PRODUCT_FORM_RECIPIENT_EMAIL,
  SELECTOR_PRODUCT_FORM_SENDER_NAME,
  SELECTOR_PRODUCT_FORM_GREETING,
  SELECTOR_PRODUCT_FORM_DELIVERY_DATE
} from "../constants";

export class ProductFormForm {

  constructor(formElement, api, config) {
    this.formElement = formElement;
    this.api = api;
    this.config = config;

    this.initialise();
  }

  initialise() {
    this.debug('initialise()');

    const { formElement } = this;

    // store references to other elements
    this.recipientNameElement = formElement.querySelector(SELECTOR_PRODUCT_FORM_RECIPIENT_NAME);
    this.recipientEmailElement = formElement.querySelector(SELECTOR_PRODUCT_FORM_RECIPIENT_EMAIL);
    this.senderNameElement = formElement.querySelector(SELECTOR_PRODUCT_FORM_SENDER_NAME);
    this.greetingElement = formElement.querySelector(SELECTOR_PRODUCT_FORM_GREETING);
    this.deliveryDateElement = formElement.querySelector(SELECTOR_PRODUCT_FORM_DELIVERY_DATE);

    // mark this form element as initialised
    formElement.dataset.cardigan = 'true';
  }

  debug(...args) {
    if(!this.config.cardigan_js_debug) {
      return;
    }

    console.log('[Cardigan Product Form Form]', ...args);
  }

}
