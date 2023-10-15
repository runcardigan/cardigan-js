import {
  CHECKOUT_APPLIED_CARDS_CACHE_KEY,
  SELECTOR_CHECKOUT_REDUCTION_CODE
} from "../constants";

export class CheckoutAppliedCards {

  constructor(formWrapperElement, api, config) {
    this.formWrapperElement = formWrapperElement;
    this.api = api;
    this.config = config;

    this.initialise();
  }

  initialise() {
    this.debug('initialise()');

    const { formWrapperElement } = this;

    // register event listeners
    document.addEventListener('page:change', this.handlePageChange.bind(this));

    // perform an initial check to remove applied cards if it's required
    this.removeAppliedCardsIfRequired();

    // mark this body element as initialised
    formWrapperElement.dataset.cardigan = 'true';
  }

  handlePageChange() {
    this.debug('handlePageChange()');

    this.removeAppliedCardsIfRequired();
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

  handleRemoveSuccess(result) {
    this.debug('handleRemoveSuccess()', result);

    this.clearAppliedCard(result.card.id);
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

    console.log('[Cardigan Checkout Applied Cards]', ...args);
  }

}
