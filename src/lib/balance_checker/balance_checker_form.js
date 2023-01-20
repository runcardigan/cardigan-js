import {
  SELECTOR_BALANCE_CHECKER_NUMBER,
  SELECTOR_BALANCE_CHECKER_PIN,
  SELECTOR_BALANCE_CHECKER_RESULT,
  SELECTOR_BALANCE_CHECKER_SUBMIT
} from "../constants";

export class BalanceCheckerForm {

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
    this.numberElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_NUMBER);
    this.pinElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_PIN);
    this.resultElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_RESULT);
    this.submitElement = formElement.querySelector(SELECTOR_BALANCE_CHECKER_SUBMIT);

    // register event listeners
    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));

    // mark this form element as initialised
    formElement.dataset.cardigan = 'true';
  }

  handleSubmit(e) {
    this.debug('handleSubmit()', e);

    const { numberElement, pinElement, submitElement, resultElement, api } = this;

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

    // render the blank result state
    resultElement.classList.remove('cardigan-result--success', 'cardigan-result--error');
    resultElement.innerText = '';

    // build values for balance request
    const number = numberElement.value;
    const pin = pinElement.value;

    // make balance check request
    api.getBalance({
      number,
      pin,
      onSuccess: this.onSuccess.bind(this),
      onError: this.onError.bind(this),
      onComplete: this.onComplete.bind(this)
    });
  }

  onSuccess(card) {
    this.debug('onSuccess', card);

    const { resultElement } = this;

    resultElement.classList.add('cardigan-result--success');
    resultElement.innerText = card.balance;
  }

  onError(error) {
    this.debug('onError', error);

    const { resultElement } = this;

    resultElement.classList.add('cardigan-result--success');
    resultElement.innerText = error.errors.join(', ');
  }

  onComplete() {
    this.debug('onComplete');

    const { numberElement, pinElement, submitElement } = this;

    submitElement.classList.remove('btn--loading');
    numberElement.disabled = false;
    pinElement.disabled = false;
    submitElement.disabled = false;
  }

  debug(...args) {
    if(!this.config.debug) {
      return;
    }

    console.log('[Cardigan BalanceCheckerForm]', ...args);
  }

}
