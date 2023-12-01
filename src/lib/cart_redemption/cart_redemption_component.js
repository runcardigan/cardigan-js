import {
  DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_DEFAULT,
  DEFAULT_TEMPLATE_CART_REDEMPTION_APPLIED_CARD,
  DEFAULT_TEMPLATE_CART_REDEMPTION_DISCLOSURE_TOGGLE_CLOSED,
  DEFAULT_TEMPLATE_CART_REDEMPTION_DISCLOSURE_TOGGLE_OPEN,
  DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_APPLICATION_LOADING,
  DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_APPLICATION_SUCCESS,
  DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_APPLICATION_ERROR,
  DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_REMOVAL_LOADING,
  DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_REMOVAL_ERROR,
  CART_REDEMPTION_APPLIED_CARD_CACHE_KEY,
  SELECTOR_CART_REDEMPTION_DISCLOSURE_TOGGLE,
  SELECTOR_CART_REDEMPTION_DISCLOSURE_CONTENT,
  SELECTOR_CART_REDEMPTION_RESULT,
  SELECTOR_CART_REDEMPTION_APPLICATION_FORM,
  SELECTOR_CART_REDEMPTION_REMOVAL_FORM,
  SELECTOR_CART_REDEMPTION_NUMBER,
  SELECTOR_CART_REDEMPTION_PIN,
  SELECTOR_CART_REDEMPTION_APPLY,
  SELECTOR_CART_REDEMPTION_APPLIED_CARD,
  SELECTOR_CART_REDEMPTION_REMOVE,
  SELECTOR_CART_REDEMPTION_DISCOUNT,
  SELECTOR_CART_REDEMPTION_CART_FORM,
  PIN_BEHAVIOUR_OPTIONAL,
  PIN_BEHAVIOUR_NOT_USED,
  KEY_ENTER
} from "../constants";
import { renderHtmlTemplate } from "../helpers";

const DEFAULT_TEMPLATES = {
  cart_redemption_applied_card: DEFAULT_TEMPLATE_CART_REDEMPTION_APPLIED_CARD,
  cart_redemption_disclosure_toggle_closed: DEFAULT_TEMPLATE_CART_REDEMPTION_DISCLOSURE_TOGGLE_CLOSED,
  cart_redemption_disclosure_toggle_open: DEFAULT_TEMPLATE_CART_REDEMPTION_DISCLOSURE_TOGGLE_OPEN,
  cart_redemption_result_application_loading: DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_APPLICATION_LOADING,
  cart_redemption_result_application_success: DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_APPLICATION_SUCCESS,
  cart_redemption_result_application_error: DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_APPLICATION_ERROR,
  cart_redemption_result_default: DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_DEFAULT,
  cart_redemption_result_removal_loading: DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_REMOVAL_LOADING,
  cart_redemption_result_removal_error: DEFAULT_TEMPLATE_CART_REDEMPTION_RESULT_REMOVAL_ERROR
};

export class CartRedemptionComponent {

  constructor(componentElement, api, config, templates) {
    this.componentElement = componentElement;
    this.api = api;
    this.config = config;
    this.templates = Object.assign({}, DEFAULT_TEMPLATES, templates);

    this.initialise();
  }

  initialise() {
    this.debug('initialise()');

    const { componentElement, config } = this;

    // store references to other elements in the component
    this.disclosureToggleElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_DISCLOSURE_TOGGLE);
    this.disclosureContentElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_DISCLOSURE_CONTENT);
    this.resultElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_RESULT);
    this.applicationFormElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_APPLICATION_FORM);
    this.removalFormElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_REMOVAL_FORM);
    this.numberElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_NUMBER);
    this.pinElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_PIN);
    this.applyElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_APPLY);
    this.appliedCardElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_APPLIED_CARD);
    this.removeElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_REMOVE);
    this.discountElement = componentElement.querySelector(SELECTOR_CART_REDEMPTION_DISCOUNT);

    // store references to external elements
    this.cartFormElement = document.querySelector(SELECTOR_CART_REDEMPTION_CART_FORM);

    // load any cached applied card
    this.appliedCard = this.readAppliedCardCache();

    // register event listeners
    this.disclosureToggleElement.addEventListener('click', this.handleDisclosureToggleClick.bind(this));
    this.numberElement.addEventListener('keyup', (e) => { if(e.key === KEY_ENTER) { this.handleApplicationSubmit(e) }});
    this.pinElement.addEventListener('keyup', (e) => { if(e.key === KEY_ENTER) { this.handleApplicationSubmit(e) }});
    this.applyElement.addEventListener('click', this.handleApplicationSubmit.bind(this));
    this.removeElement.addEventListener('click', this.handleRemovalSubmit.bind(this));

    // render the appropriate initial result state
    this.render(this.appliedCard ? 'result_application_success' : 'result_default', this.resultElement, this.appliedCard || {});

    // render closed disclosure toggle
    this.render('disclosure_toggle_closed', this.disclosureToggleElement);

    // update component and cart form
    this.updateComponent();
    this.updateCartForm();

    // update (external) cart form
    this.updateCartForm();

    // set a flag indicating whether a PIN is required, based on the configuration
    this.pinIsRequired = (config.pin_behaviour !== PIN_BEHAVIOUR_OPTIONAL) && (config.pin_behaviour !== PIN_BEHAVIOUR_NOT_USED);

    // mark this component element as initialised
    componentElement.dataset.cardigan = 'true';
  }

  handleDisclosureToggleClick(e) {
    this.debug('handleDisclosureToggleClick()', e);

    const { disclosureToggleElement, disclosureContentElement } = this;

    const open = disclosureContentElement.style.display !== 'none';
    disclosureContentElement.style.display = open ? 'none' : '';
    this.render(open ? 'disclosure_toggle_closed' : 'disclosure_toggle_open', disclosureToggleElement);
  }

  handleApplicationSubmit(e) {
    this.debug('handleApplicationSubmit()', e);

    const { numberElement, pinElement, applyElement, resultElement, pinIsRequired, api } = this;

    // prevent form submission
    e.preventDefault();
    e.stopPropagation();

    // if the number input is empty, focus it and return
    if(numberElement && numberElement.value.trim().length === 0) {
      numberElement.focus();
      return false;
    }

    // if the pin element input is empty and we require a pin, focus it and return
    if(pinIsRequired && pinElement && pinElement.value.trim().length === 0) {
      pinElement.focus();
      return false;
    }

    // add loading class to button and disable it
    applyElement.classList.add('cardigan-button--loading');
    applyElement.disabled = true;
    numberElement.disabled = true;
    if(pinElement) {
      pinElement.disabled = true;
    }

    // render the loading result state
    this.render('result_application_loading', resultElement);

    // build values for application request
    const number = numberElement.value;
    const pin = pinElement ? pinElement.value : null;

    // make application request
    api.applyCard({
      number,
      pin,
      onSuccess: this.onApplicationSuccess.bind(this),
      onError: this.onApplicationError.bind(this),
      onComplete: this.onApplicationComplete.bind(this)
    });
  }

  onApplicationSuccess(result) {
    this.debug('onApplicationSuccess', result);

    this.appliedCard = result.card;
    this.writeAppliedCardCache(this.appliedCard);
    this.updateComponent();
    this.updateCartForm();

    this.render('result_application_success', this.resultElement, this.appliedCard);
  }

  onApplicationError(result) {
    this.debug('onApplicationError', result);

    this.render('result_application_error', this.resultElement, {
      errors: result.errors.map(e => e.description)
    });
  }

  onApplicationComplete() {
    this.debug('onApplicationComplete');

    const { numberElement, pinElement, applyElement } = this;

    applyElement.classList.remove('cardigan-button--loading');
    applyElement.disabled = false;
    numberElement.disabled = false;
    if(pinElement) {
      pinElement.disabled = false;
    }
  }

  handleRemovalSubmit(e) {
    this.debug('handleRemovalSubmit()', e);

    const { appliedCard, removeElement, api } = this;

    // prevent form submission
    e.preventDefault();
    e.stopPropagation();

    // if there's no applied card, there's nothing to remove
    if(!appliedCard) {
      return false;
    }

    // add loading class to button and disable it
    removeElement.classList.add('cardigan-button--loading');
    removeElement.disabled = true;

    // render the loading result state
    this.render('result_removal_loading', this.resultElement);

    // make removal request
    api.removeCard({
      id: appliedCard.id,
      onSuccess: this.onRemovalSuccess.bind(this),
      onError: this.onRemovalError.bind(this),
      onComplete: this.onRemovalComplete.bind(this)
    });
  }

  onRemovalSuccess(result) {
    this.debug('onRemovalSuccess', result);

    this.appliedCard = null;
    this.writeAppliedCardCache(null);
    this.updateComponent();
    this.updateCartForm();

    this.render('result_default', this.resultElement);
  }

  onRemovalError(result) {
    this.debug('onRemovalError', result);

    // if the removal error was the card not being found, we don't treat that like an error
    if(result.errors.some(error => {
      return error.code === 'card_not_found';
    })) {
      this.onRemovalSuccess();
      return;
    }

    this.render('result_removal_error', this.resultElement, {
      errors: result.errors.map(e => e.description)
    });
  }

  onRemovalComplete() {
    this.debug('onRemovalComplete');

    const { removeElement } = this;

    removeElement.classList.remove('cardigan-button--loading');
    removeElement.disabled = false;
  }

  updateComponent() {
    const { appliedCard, applicationFormElement, removalFormElement, appliedCardElement, discountElement } = this;

    applicationFormElement.style.display = appliedCard ? 'none' : '';
    removalFormElement.style.display = appliedCard ? '' : 'none';
    this.render('applied_card', appliedCardElement, appliedCard || {});

    discountElement.value = appliedCard ? appliedCard.code : '';
  }

  updateCartForm() {
    const { appliedCard, cartFormElement, cartFormDiscountElement } = this;

    if(!cartFormElement) {
      return;
    }

    if(!cartFormDiscountElement) {
      this.cartFormDiscountElement = document.createElement('input');
      this.cartFormDiscountElement.type = 'hidden';
      this.cartFormDiscountElement.name = 'discount';
      this.cartFormDiscountElement.value = appliedCard ? appliedCard.code : '';

      cartFormElement.appendChild(this.cartFormDiscountElement);
    } else {
      cartFormDiscountElement.value = appliedCard ? appliedCard.code : '';
    }
  }

  render(templateNameSuffix, element, context = {}) {
    const { templates } = this;
    renderHtmlTemplate(
      templates,
      element,
      `cart_redemption_${templateNameSuffix}`,
      context,
      'replaceChildren'
    );
  }

  readAppliedCardCache() {
    this.debug('readAppliedCardCache()');

    try {
      return JSON.parse(localStorage.getItem(CART_REDEMPTION_APPLIED_CARD_CACHE_KEY));
    } catch {
      return null;
    }
  }

  writeAppliedCardCache(appliedCard) {
    this.debug('writeAppliedCardCache()', appliedCard);

    try {
      localStorage.setItem(CART_REDEMPTION_APPLIED_CARD_CACHE_KEY, JSON.stringify(appliedCard));
    } catch {
      return null;
    }
  }

  debug(...args) {
    if(!this.config.cardigan_js_debug) {
      return;
    }

    console.log('[Cardigan Cart Redemption Form]', ...args);
  }

}
