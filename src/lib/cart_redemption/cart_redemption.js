import {
  SELECTOR_CART_REDEMPTION_COMPONENT,
} from "../constants";
import { CartRedemptionComponent } from "./cart_redemption_component";

export class CartRedemption {

  constructor(document, api, config, templates) {
    this.document = document;
    this.api = api;
    this.config = config;
    this.templates = templates;

    this.initialise();
  }

  initialise() {
    this.debug('initialise()');

    const { document, api, config, templates } = this;

    // initialise all cart redemption forms on the page
    document.querySelectorAll(SELECTOR_CART_REDEMPTION_COMPONENT).forEach(componentElement => {
      // skip if the component is already initialised
      if(componentElement.dataset.cardigan === 'true') {
        return;
      }

      new CartRedemptionComponent(componentElement, api, config, templates);
    });
  }

  debug(...args) {
    if(!this.config.cardigan_js_debug) {
      return;
    }

    console.log('[Cardigan Cart Redemption]', ...args);
  }

}
