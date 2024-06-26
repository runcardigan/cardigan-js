import {
  DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_DEFAULT,
  DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_LOADING,
  DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_SUCCESS,
  DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_ERROR,
  SELECTOR_BALANCE_CHECKER_NUMBER,
  SELECTOR_BALANCE_CHECKER_PIN,
  SELECTOR_BALANCE_CHECKER_PIN_WRAPPER,
  SELECTOR_BALANCE_CHECKER_RESULT,
  SELECTOR_BALANCE_CHECKER_SUBMIT,
  PIN_BEHAVIOUR_OPTIONAL,
  PIN_BEHAVIOUR_NOT_USED
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

    const { config, formElement } = this;

    // store references to other elements
    this.numberElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_NUMBER);
    this.pinElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_PIN);
    this.pinWrapperElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_PIN_WRAPPER);
    this.resultElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_RESULT);
    this.submitElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_SUBMIT);

    // register event listeners
    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));
    this.numberElement.addEventListener('input', this.handleInput.bind(this));

    // render the default result state
    this.renderResult('default');

    // set flags based on pin configuration
    this.pinIsRequired = (config.pin_behaviour !== PIN_BEHAVIOUR_OPTIONAL) && (config.pin_behaviour !== PIN_BEHAVIOUR_NOT_USED);
    this.pinIsOptional = (config.pin_behaviour === PIN_BEHAVIOUR_OPTIONAL);
    this.pinIsNotUsed = (config.pin_behaviour === PIN_BEHAVIOUR_NOT_USED);
    this.pinPattern = (this.pinIsOptional && !!config.pin_pattern) ? new RegExp(config.pin_pattern) : null;

    // fire the input() event to ensure pin visibility is correct initially
    this.handleInput();

    // mark this form element as initialised
    formElement.dataset.cardigan = 'true';
  }

  handleInput(e) {
    this.debug('handleInput()', e);

    this.pinIsDisplayed = this.shouldDisplayPin(this.numberElement.value);

    this.pinWrapperElement && (this.pinWrapperElement.style.display = this.pinIsDisplayed ? 'block' : 'none');
  }

  handleSubmit(e) {
    this.debug('handleSubmit()', e);

    const { numberElement, pinElement, submitElement, pinIsRequired, pinPattern, pinIsDisplayed, api } = this;

    // prevent form submission
    e.preventDefault();
    e.stopPropagation();

    // if the number input is empty, focus it and return
    if(numberElement && numberElement.value.trim().length === 0) {
      numberElement.focus();
      return false;
    }

    // if the pin input is required or conditionally shown and empty, focus it and return
    if((pinIsRequired || (pinPattern && pinIsDisplayed)) && pinElement && pinElement.value.trim().length === 0) {
      pinElement.focus();
      return false;
    }

    // add loading class to button and disable it
    submitElement.classList.add('cardigan-button--loading');
    submitElement.disabled = true;
    numberElement.disabled = true;
    if(pinElement) {
      pinElement.disabled = true;
    }

    // render the loading result state
    this.renderResult('loading');

    // build values for balance request
    const number = numberElement.value;
    const pin = (pinIsDisplayed && pinElement) ? pinElement.value : null;

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
    submitElement.disabled = false;
    numberElement.disabled = false;
    if(pinElement) {
      pinElement.disabled = false;
    }
  }

  shouldDisplayPin(number) {
    this.debug('shouldDisplayPin()', number);

    const { pinIsRequired, pinIsNotUsed, pinPattern } = this;

    if(pinIsRequired) {
      return true;
    }

    if(pinIsNotUsed) {
      return false;
    }

    const normalizedNumber = number.replace(/\D/g, '');
    return !pinPattern || pinPattern.test(normalizedNumber);
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
