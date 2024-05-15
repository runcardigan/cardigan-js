import {
  CHECKOUT_APPLIED_CARDS_CACHE_KEY,
  SELECTOR_CHECKOUT_DISCOUNT_INPUT,
  SELECTOR_CHECKOUT_FIELDSET,
  SELECTOR_CHECKOUT_FORM,
  SELECTOR_CHECKOUT_PIN_INPUT,
  SELECTOR_CHECKOUT_SUBMIT_BUTTON,
  PIN_BEHAVIOUR_NOT_USED,
  PIN_BEHAVIOUR_OPTIONAL
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

    const { config, formWrapperElement } = this;

    // store references to other elements
    this.inputElement = formWrapperElement.querySelector(SELECTOR_CHECKOUT_DISCOUNT_INPUT);
    this.fieldsetElement = this.inputElement.closest(SELECTOR_CHECKOUT_FIELDSET);
    this.formElement = this.inputElement.closest(SELECTOR_CHECKOUT_FORM);
    this.submitElement = formWrapperElement.querySelector(SELECTOR_CHECKOUT_SUBMIT_BUTTON);

    // set flags based on pin configuration
    this.pinIsRequired = (config.pin_behaviour !== PIN_BEHAVIOUR_OPTIONAL) && (config.pin_behaviour !== PIN_BEHAVIOUR_NOT_USED);
    this.pinIsOptional = (config.pin_behaviour === PIN_BEHAVIOUR_OPTIONAL);
    this.pinIsNotUsed = (config.pin_behaviour === PIN_BEHAVIOUR_NOT_USED);
    this.pinPattern = (this.pinIsOptional && !!config.pin_pattern) ? new RegExp(config.pin_pattern) : null;
    this.pinMayBeDisplayed = this.pinIsRequired || this.pinIsOptional;

    // render the pin input if it may be displayed
    if(this.pinMayBeDisplayed) {
      this.renderPin();
      this.pinInputElement = formWrapperElement.querySelector(SELECTOR_CHECKOUT_PIN_INPUT);
    }

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

    this.pinIsDisplayed = this.shouldDisplayPin(this.inputElement.value);

    this.debug('pinIsDisplayed', this.pinIsDisplayed);

    // the `is-potential-card` class name remains for backwards compatibility
    this.formWrapperElement.classList.toggle('pin-displayed', this.pinIsDisplayed);
    this.formWrapperElement.classList.toggle('is-potential-card', this.pinIsDisplayed);
  }

  handleSubmit(e) {
    this.debug('handleSubmit()', e);

    const { formWrapperElement, inputElement, pinInputElement, submitElement, pinIsRequired, pinPattern, pinIsDisplayed, api } = this;

    // don't prevent submission if the force submit flag is set
    if(formWrapperElement.dataset.forceSubmit === 'true') {
      return true;
    }

    // prevent form submission
    e.preventDefault();
    e.stopPropagation();

    // if the pin input is required or conditionally shown and empty, focus it and return
    if((pinIsRequired || (pinPattern && pinIsDisplayed)) && pinInputElement && pinInputElement.value.trim().length === 0) {
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

    // cache this card in local storage
    this.cacheAppliedCard(result.card);

    inputElement.after(hiddenInput);
  }

  handleApplyFailure(result) {
    this.debug('handleApplyFailure()', result);
  }

  handleApplyComplete() {
    this.debug('handleApplyComplete()');

    const { formWrapperElement, formElement } = this;
    formWrapperElement.dataset.forceSubmit = 'true';

    // if a global Checkout object is available with a jQuery reference, we use that to submit the
    // discount/gift card form. this is done to trigger the Shopify checkout's ajax submission
    // functionality for the discount/gift card form, which results in less of a page refresh and
    // avoids clearing prefilled information from the checkout
    if(Checkout && Checkout.$) {
      Checkout.$(formElement).submit();
    } else {
      formElement.submit();
    }
  }

  // return whether the PIN input should be displayed to customers
  //
  // this used to be `isPotentialCard`, hence the naming of the hook, but has been updated to
  // more accurately reflect why we are using this value
  shouldDisplayPin(number) {
    this.debug('shouldDisplayPin()', number);

    const { config, pinIsRequired, pinIsNotUsed, pinPattern } = this;

    // if a custom hook is defined, delegate to the hook
    // the isPotentialCard language remains to support legacy implementations
    if(config.hooks.isPotentialCard) {
      return config.hooks.isPotentialCard(number);
    }

    // if a pin is not used, we can return false early
    if(pinIsNotUsed) {
      return false;
    }

    const normalizedNumber = number.replace(/\D/g, '');
    const numberIsMinimumLength = normalizedNumber.length >= config.card_length;

    // if a pin is required, then display as long as the minimum card length is reached
    if(pinIsRequired) {
      return numberIsMinimumLength;
    }

    // if the pin is optional and a pattern is defined, show the pin input if the number matches that pattern
    if(pinPattern) {
      return pinPattern.test(normalizedNumber);
    }

    // otherwise, if the pin is optional with no pattern defined, show the input if the minimum length is reached
    return numberIsMinimumLength;
  }

  readAppliedCardCache() {
    this.debug('readAppliedCardCache()');

    try {
      return JSON.parse(localStorage.getItem(CHECKOUT_APPLIED_CARDS_CACHE_KEY)) || {};
    } catch {
      return {};
    }
  }

  writeAppliedCardCache(appliedCards) {
    this.debug('writeAppliedCardCache()', appliedCards);

    try {
      localStorage.setItem(CHECKOUT_APPLIED_CARDS_CACHE_KEY, JSON.stringify(appliedCards));
    } catch {
      return null;
    }
  }

  cacheAppliedCard(card) {
    this.debug('cacheAppliedCard()', card);

    const appliedCards = this.readAppliedCardCache();
    appliedCards[card.id] = {
      lastCharacters: card.code.slice(-4),
      balance: card.balance
    }
    this.writeAppliedCardCache(appliedCards);
  }

  debug(...args) {
    if(!this.config.cardigan_js_debug) {
      return;
    }

    console.log('[Cardigan Checkout Form]', ...args);
  }

}
