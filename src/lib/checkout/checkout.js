import {
  SELECTOR_CHECKOUT_REDUCTION_FORM_WRAPPER,
  CHECKOUT_STEP_CONTACT_INFORMATION,
  CHECKOUT_STEP_PAYMENT_METHOD,
  CHECKOUT_STEP_SHIPPING_METHOD
} from "../constants";
import { CheckoutForm } from "./checkout_form";

const SUPPORTED_CHECKOUT_STEPS = [
  CHECKOUT_STEP_CONTACT_INFORMATION,
  CHECKOUT_STEP_SHIPPING_METHOD,
  CHECKOUT_STEP_PAYMENT_METHOD
];

export class Checkout {

  constructor(document, api, config, Shopify) {
    this.document = document;
    this.api = api;
    this.config = config;
    this.Shopify = Shopify;

    this.initialise();
  }

  initialise() {
    this.debug('initialise()');

    const { document, Shopify, api, config } = this;

    // if we're not in the Shopify checkout on a supported step, return
    if(!Shopify || !Shopify.Checkout || !SUPPORTED_CHECKOUT_STEPS.includes(Shopify.Checkout.step)) {
      return;
    }

    // define an event handler for page changes
    const handlePageChange = () => {
      document.querySelectorAll(SELECTOR_CHECKOUT_REDUCTION_FORM_WRAPPER).forEach(formWrapperElement => {
        // skip if the form wrapper is already initialised
        if(formWrapperElement.dataset.cardigan === 'true') {
          return;
        }

        new CheckoutForm(formWrapperElement, api, config);
      });
    };

    // register event listeners for page changes
    document.addEventListener('page:load', handlePageChange);
    document.addEventListener('page:change', handlePageChange);

    // attempt immediate initialisation in case the page is already ready
    handlePageChange();
  }

  debug(...args) {
    if(!this.config.debug) {
      return;
    }

    console.log('[Cardigan Checkout]', ...args);
  }

}
