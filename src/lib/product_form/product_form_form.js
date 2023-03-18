import {
  SELECTOR_PRODUCT_FORM_RECIPIENT_NAME,
  SELECTOR_PRODUCT_FORM_RECIPIENT_EMAIL,
  SELECTOR_PRODUCT_FORM_SENDER_NAME,
  SELECTOR_PRODUCT_FORM_GREETING,
  SELECTOR_PRODUCT_FORM_DELIVERY_DATE,
  SELECTOR_PRODUCT_FORM_PARENT_SECTION
} from "../constants";

export class ProductFormForm {

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
    this.recipientNameElement = formElement.querySelector(SELECTOR_PRODUCT_FORM_RECIPIENT_NAME);
    this.recipientEmailElement = formElement.querySelector(SELECTOR_PRODUCT_FORM_RECIPIENT_EMAIL);
    this.senderNameElement = formElement.querySelector(SELECTOR_PRODUCT_FORM_SENDER_NAME);
    this.greetingElement = formElement.querySelector(SELECTOR_PRODUCT_FORM_GREETING);
    this.deliveryDateElement = formElement.querySelector(SELECTOR_PRODUCT_FORM_DELIVERY_DATE);

    // add `form` attributes to input elements from the parent section
    // this ensures that on typical Shopify themes, line item properties are included in the add to cart request
    this.addProductFormAttributesFromParentSection();

    // mark this form element as initialised
    formElement.dataset.cardigan = 'true';
  }

  addProductFormAttributesFromParentSection() {
    this.debug('addProductFormAttributesFromParentSection()');

    const parentSectionElement = this.formElement.closest(SELECTOR_PRODUCT_FORM_PARENT_SECTION);

    if(!parentSectionElement) {
      return;
    }

    const sectionId = parentSectionElement.getAttribute('data-section');
    const productFormId = `product-form-${sectionId}`;

    this.recipientNameElement && this.recipientNameElement.setAttribute('form', productFormId);
    this.recipientEmailElement && this.recipientEmailElement.setAttribute('form', productFormId);
    this.senderNameElement && this.senderNameElement.setAttribute('form', productFormId);
    this.greetingElement && this.greetingElement.setAttribute('form', productFormId);
    this.deliveryDateElement && this.deliveryDateElement.setAttribute('form', productFormId);
  }

  debug(...args) {
    if(!this.config.debug) {
      return;
    }

    console.log('[Cardigan Product Form Form]', ...args);
  }

}
