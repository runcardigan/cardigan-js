import {
  SELECTOR_CHECKOUT_DISCOUNT_INPUT,
  SELECTOR_CHECKOUT_FIELDSET,
  SELECTOR_CHECKOUT_FORM,
  SELECTOR_CHECKOUT_PIN_INPUT,
  SELECTOR_CHECKOUT_REDUCTION_CODE,
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
    document.addEventListener('page:change', this.handlePageChange.bind(this));

    // perform an initial check to remove applied cards if it's required
    this.removeAppliedCardsIfRequired();

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
    formElement.submit();
  }

  handlePageChange() {
    this.debug('handlePageChange()');

    this.removeAppliedCardsIfRequired();
  }

  isPotentialCard(value) {
    this.debug('isPotentialCard()', value);

    const { config } = this;

    if(config.hooks.isPotentialCard) {
      return config.hooks.isPotentialCard(value);
    }

    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.length >= config.card_length;
  }

  removeAppliedCardsIfRequired() {
    this.debug('removeAppliedCardsIfRequired()');

    const { api } = this;

    const cachedAppliedCards = this.readAppliedCardCache();
    const appliedCardTags = this.parseAppliedCardTags();

    Object.keys(cachedAppliedCards).forEach(id => {
      const cachedAppliedCard = cachedAppliedCards[id];

      const isStillApplied = appliedCardTags.some(appliedCardTag => {
        return appliedCardTag.lastCharacters === cachedAppliedCard.lastCharacters;
      });

      // if the card is still applied, nothing to do
      if(isStillApplied) {
        return;
      }

      api.removeCard({
        id,
        onSuccess: this.handleRemoveSuccess.bind(this)
      });
    });
  }

  handleRemoveSuccess(result) {
    this.debug('handleRemoveSuccess()', result);

    this.clearAppliedCard(result.card.id);
  }

  parseAppliedCardTags() {
    this.debug('parseAppliedCardTags()');

    const { formWrapperElement } = this;
    const giftCardRegex = new RegExp('•••• ([0-9]+)');

    return Array.from(formWrapperElement.querySelectorAll(SELECTOR_CHECKOUT_REDUCTION_CODE)).map(reductionCodeElement => {
      const matches = reductionCodeElement.innerText.match(giftCardRegex);

      return {
        lastCharacters: matches ? matches[1] : null
      }
    }).filter(appliedCardTag => {
      return !!appliedCardTag.lastCharacters;
    });
  }

  readAppliedCardCache() {
    this.debug('readAppliedCardCache()');

    try {
      return JSON.parse(localStorage.getItem('cardigan:applied_cards')) || {};
    } catch {
      return {};
    }
  }

  writeAppliedCardCache(appliedCards) {
    this.debug('writeAppliedCardCache()', appliedCards);

    try {
      localStorage.setItem('cardigan:applied_cards', JSON.stringify(appliedCards));
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

  clearAppliedCard(id) {
    this.debug('clearAppliedCard()', id);

    const appliedCards = this.readAppliedCardCache();
    delete appliedCards[id];
    this.writeAppliedCardCache(appliedCards);
  }

  debug(...args) {
    if(!this.config.cardigan_js_debug) {
      return;
    }

    console.log('[Cardigan Checkout Form]', ...args);
  }

}
