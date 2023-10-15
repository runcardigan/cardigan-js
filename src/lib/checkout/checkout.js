import {
  SELECTOR_CHECKOUT_REDUCTION_FORM_WRAPPER,
  CHECKOUT_STEP_CONTACT_INFORMATION,
  CHECKOUT_STEP_PAYMENT_METHOD,
  CHECKOUT_STEP_SHIPPING_METHOD
} from "../constants";
import { CheckoutForm } from "./checkout_form";
import { CheckoutAppliedCards } from "./checkout_applied_cards";

const SUPPORTED_CHECKOUT_STEPS = [
  CHECKOUT_STEP_CONTACT_INFORMATION,
  CHECKOUT_STEP_SHIPPING_METHOD,
  CHECKOUT_STEP_PAYMENT_METHOD
];

export class Checkout {

  constructor(document, api, config, templates, Shopify) {
    this.document = document;
    this.api = api;
    this.config = config;
    this.templates = templates;
    this.Shopify = Shopify;

    this.initialise();
  }

  initialise() {
    this.debug('initialise()');

    const { document, Shopify, api, config, templates } = this;

    // if we're not in the Shopify checkout on a supported step, return
    if(!Shopify || !Shopify.Checkout || !SUPPORTED_CHECKOUT_STEPS.includes(Shopify.Checkout.step)) {
      return;
    }

    // define an event handler for page changes
    const handlePageChange = () => {
      document.querySelectorAll(SELECTOR_CHECKOUT_REDUCTION_FORM_WRAPPER).forEach((formWrapperElement, index) => {
        // skip if the form wrapper is already initialised
        if(formWrapperElement.dataset.cardigan === 'true') {
          return;
        }

        // initialise the checkout form component on this element
        new CheckoutForm(formWrapperElement, api, config, templates);

        // if this is the first element on the page, also initialise the applied cards component
        // this component should only exist once on the page
        if(index === 0) {
          new CheckoutAppliedCards(formWrapperElement, api, config);
        }
      });
    };

    // register event listeners for page changes
    document.addEventListener('page:load', handlePageChange);
    document.addEventListener('page:change', handlePageChange);

    // attempt immediate initialisation in case the page is already ready
    handlePageChange();
  }

  debug(...args) {
    if(!this.config.cardigan_js_debug) {
      return;
    }

    console.log('[Cardigan Checkout]', ...args);
  }

}
