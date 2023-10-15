export const SELECTOR_BALANCE_CHECKER_FORM = '[data-cardigan-balance-checker="form"]';
export const SELECTOR_BALANCE_CHECKER_NUMBER = '[data-cardigan-balance-checker="number"]';
export const SELECTOR_BALANCE_CHECKER_PIN = '[data-cardigan-balance-checker="pin"]';
export const SELECTOR_BALANCE_CHECKER_RESULT = '[data-cardigan-balance-checker="result"]';
export const SELECTOR_BALANCE_CHECKER_SUBMIT = '[data-cardigan-balance-checker="submit"]';

export const SELECTOR_CHECKOUT_DISCOUNT_INPUT = '[data-discount-field="true"]';
export const SELECTOR_CHECKOUT_FIELDSET = '.fieldset';
export const SELECTOR_CHECKOUT_FORM = 'form';
export const SELECTOR_CHECKOUT_REDUCTION_FORM_WRAPPER = '[data-reduction-form]:not(.edit_checkout)';
export const SELECTOR_CHECKOUT_REDUCTION_CODE = '.reduction-code';
export const SELECTOR_CHECKOUT_PIN_INPUT = '[name="checkout[pin]"]';
export const SELECTOR_CHECKOUT_SUBMIT_BUTTON = '[type="submit"]';

export const CHECKOUT_STEP_CONTACT_INFORMATION = 'contact_information';
export const CHECKOUT_STEP_PAYMENT_METHOD = 'shipping_method';
export const CHECKOUT_STEP_SHIPPING_METHOD = 'payment_method';
export const CHECKOUT_APPLIED_CARDS_CACHE_KEY = 'cardigan:applied_cards';

export const SELECTOR_PRODUCT_FORM_FORM = '[data-cardigan-product-form="form"]';
export const SELECTOR_PRODUCT_FORM_RECIPIENT_NAME = '[data-cardigan-product-form="recipient-name"]';
export const SELECTOR_PRODUCT_FORM_RECIPIENT_EMAIL = '[data-cardigan-product-form="recipient-email"]';
export const SELECTOR_PRODUCT_FORM_SENDER_NAME = '[data-cardigan-product-form="sender-name"]';
export const SELECTOR_PRODUCT_FORM_GREETING = '[data-cardigan-product-form="greeting"]';
export const SELECTOR_PRODUCT_FORM_DELIVERY_DATE = '[data-cardigan-product-form="delivery-date"]';
export const SELECTOR_PRODUCT_FORM_PARENT_SECTION = '[data-section]';

export const DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_DEFAULT = '<span></span>';
export const DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_LOADING = '<span></span>';
export const DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_SUCCESS = '<span>{{ balance_formatted }}</span>';
export const DEFAULT_TEMPLATE_BALANCE_CHECKER_RESULT_ERROR = '<span>{{ errors }}</span>';
