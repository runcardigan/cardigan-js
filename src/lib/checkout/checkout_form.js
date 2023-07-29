import {
  SELECTOR_CHECKOUT_DISCOUNT_INPUT,
  SELECTOR_CHECKOUT_FIELDSET,
  SELECTOR_CHECKOUT_FORM,
  SELECTOR_CHECKOUT_PIN_INPUT,
  SELECTOR_CHECKOUT_SUBMIT_BUTTON
} from "../constants";
import { renderHtmlTemplate } from "../helpers";

export class CheckoutForm {

  constructor(formWrapperElement, api, config, templates) {
    this.formWrapperElement = formWrapperElement;
    this.api = api;
    this.config = config;
    this.templates = templates;
    this.potentialCard = false;

    this.initialise();
  }

  initialise() {
    this.debug('initialise()');

    const { formWrapperElement } = this;

    // store references to other elements
    this.inputElement = formWrapperElement.querySelector(SELECTOR_CHECKOUT_DISCOUNT_INPUT);
    this.fieldsetElement = this.inputElement.closest(SELECTOR_CHECKOUT_FIELDSET);
    this.formElement = this.inputElement.closest(SELECTOR_CHECKOUT_FORM);
    this.submitElement = formWrapperElement.querySelector(SELECTOR_CHECKOUT_SUBMIT_BUTTON);

    // render the pin input
    this.renderPin();
    this.pinInputElement = formWrapperElement.querySelector(SELECTOR_CHECKOUT_PIN_INPUT);

    // register event listeners
    this.inputElement.addEventListener('input', this.handleInput.bind(this));
    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));

    // mark this form element as initialised
    formWrapperElement.dataset.cardigan = 'true';
  }

  renderPin() {
    const { templates } = this;
    renderHtmlTemplate(templates, this.fieldsetElement, 'pin');
  }

  handleInput(e) {
    this.debug('handleInput()', e);

    this.potentialCard = this.isPotentialCard(this.inputElement.value);

    this.debug('potentialCard', this.potentialCard);

    this.formWrapperElement.classList.toggle('is-potential-card', this.potentialCard);
  }

  handleSubmit(e) {
    this.debug('handleSubmit()', e);

    const { formWrapperElement, potentialCard, inputElement, pinInputElement, submitElement, api } = this;

    // don't prevent submission if no chance of a Givex card
    if(!potentialCard) {
      return true;
    }

    // don't prevent submission if the force submit flag is set
    if(formWrapperElement.dataset.forceSubmit === 'true') {
      return true;
    }

    // prevent form submission
    e.preventDefault();
    e.stopPropagation();

    // if the pin input is present and empty, focus it and return
    if(pinInputElement && pinInputElement.value.trim().length === 0) {
      pinInputElement.focus();
      return false;
    }

    // add loading spinner and disable the button to prevent resubmission.
    submitElement.classList.add('btn--loading');
    submitElement.disabled = true;

    // build values for application request
    const number = inputElement.value;
    const pin = pinInputElement ? pinInputElement.value : null;

    // make application request
    api.applyCard({
      number,
      pin,
      onSuccess: this.handleApplySuccess.bind(this),
      onFailure: this.handleApplyFailure.bind(this),
      onComplete: this.handleApplyComplete.bind(this)
    });
  }

  handleApplySuccess(result) {
    this.debug('handleApplySuccess()', result);

    const { inputElement } = this;

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'checkout[reduction_code]';
    hiddenInput.value = result.card.code;

    inputElement.after(hiddenInput);
  }

  handleApplyFailure(result) {
    this.debug('handleApplyFailure()', result);
  }

  handleApplyComplete() {
    this.debug('handleApplyComplete()');

    const { formWrapperElement, formElement } = this;
    formWrapperElement.dataset.forceSubmit = 'true';
    formElement.submit();
  }

  isPotentialCard(value) {
    this.debug('isPotentialCard()', value);

    const { config } = this;
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.length >= config.card_length;
  }

  debug(...args) {
    if(!this.config.cardigan_js_debug) {
      return;
    }

    console.log('[Cardigan Checkout Form]', ...args);
  }

}
