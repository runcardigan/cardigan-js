import {
  SELECTOR_BALANCE_CHECKER_FORM,
} from "../constants";
import { BalanceCheckerForm } from "./balance_checker_form";

export class BalanceChecker {

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

    // initialise all balance checkers on the page
    document.querySelectorAll(SELECTOR_BALANCE_CHECKER_FORM).forEach(formElement => {
      // skip if the form is already initialised
      if(formElement.dataset.cardigan === 'true') {
        return;
      }

      new BalanceCheckerForm(formElement, api, config, templates);
    });
  }

  debug(...args) {
    if(!this.config.cardigan_js_debug) {
      return;
    }

    console.log('[Cardigan Balance Checker]', ...args);
  }

}
