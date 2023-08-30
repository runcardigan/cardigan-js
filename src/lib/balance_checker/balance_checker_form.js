import {
  DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_DEFAULT,
  DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_LOADING,
  DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_SUCCESS,
  DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_ERROR,
  SELECTOR_BALANCE_CHECKER_NUMBER,
  SELECTOR_BALANCE_CHECKER_PIN,
  SELECTOR_BALANCE_CHECKER_RESULT,
  SELECTOR_BALANCE_CHECKER_SUBMIT
} from "../constants";
import { renderHtmlTemplate } from "../helpers";

const DEFAULT_TEMPLATES = {
  balance_checker_result_default: DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_DEFAULT,
  balance_checker_result_loading: DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_LOADING,
  balance_checker_result_success: DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_SUCCESS,
  balance_checker_result_error: DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_ERROR
};

export class BalanceCheckerForm {

  constructor(formElement, api, config, templates) {
    this.formElement = formElement;
    this.api = api;
    this.config = config;
    this.templates = Object.assign({}, DEFAULT_TEMPLATES, templates);

    this.initialise();
  }

  initialise() {
    this.debug('initialise()');

    const { formElement } = this;

    // store references to other elements
    this.numberElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_NUMBER);
    this.pinElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_PIN);
    this.resultElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_RESULT);
    this.submitElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_SUBMIT);

    // register event listeners
    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));

    // render the default result state
    this.renderResult('default');

    // mark this form element as initialised
    formElement.dataset.cardigan = 'true';
  }

  handleSubmit(e) {
    this.debug('handleSubmit()', e);

    const { numberElement, pinElement, submitElement, api } = this;

    // prevent form submission
    e.preventDefault();
    e.stopPropagation();

    // if the number input is empty, focus it and return
    if(numberElement && numberElement.value.trim().length === 0) {
      numberElement.focus();
      return false;
    }

    // if the security code input is empty, focus it and return
    if(pinElement && pinElement.value.trim().length === 0) {
      pinElement.focus();
      return false;
    }

    // add loading class to button and disable it
    submitElement.classList.add('cardigan-button--loading');
    submitElement.disabled = true;
    numberElement.disabled = true;
    pinElement.disabled = true;

    // render the loading result state
    this.renderResult('loading');

    // build values for balance request
    const number = numberElement.value;
    const pin = pinElement.value;

    // make card balance check request
    api.getCardBalance({
      number,
      pin,
      onSuccess: this.onSuccess.bind(this),
      onError: this.onError.bind(this),
      onComplete: this.onComplete.bind(this)
    });
  }

  onSuccess(result) {
    this.debug('onSuccess', result);

    this.renderResult('success', result.card);
  }

  onError(result) {
    this.debug('onError', result);

    this.renderResult('error', {
      errors: result.errors.map(e => e.description)
    });
  }

  onComplete() {
    this.debug('onComplete');

    const { numberElement, pinElement, submitElement } = this;

    submitElement.classList.remove('cardigan-button--loading');
    numberElement.disabled = false;
    pinElement.disabled = false;
    submitElement.disabled = false;
  }

  renderResult(templateNameSuffix, context = {}) {
    const { resultElement, templates } = this;
    renderHtmlTemplate(
      templates,
      resultElement,
      `balance_checker_result_${templateNameSuffix}`,
      context,
      'replaceChildren'
    );
  }

  debug(...args) {
    if(!this.config.cardigan_js_debug) {
      return;
    }

    console.log('[Cardigan Balance Checker Form]', ...args);
  }

}
