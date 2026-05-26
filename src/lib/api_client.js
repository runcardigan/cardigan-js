// Constants for possible HTTP methods.
const GET = 'get';
const POST = 'post';

// API methods with their corresponding HTTP method and path.
const API_METHODS = {
  apply_card: {
    http_method: POST,
    path: 'cards/apply.json'
  },
  get_card_balance: {
    http_method: POST,
    path: 'cards/balance.json'
  },
  get_shop_config: {
    http_method: GET,
    path: 'shop_config.json'
  },
  remove_card: {
    http_method: POST,
    path: 'cards/:id/remove.json'
  },
  verify_authorization: {
    http_method: POST,
    path: 'authorizations/:id/verify.json'
  }
}

// Return the appropriate API URL for the given endpoint, subdomain, method and parameters.
// Parameters appearing in the base URL as a token (eg the ':id' in '/:id/example.json') will be interpolated.
const getUrl = (endpoint, subdomain, method, params) => {
  return Object.entries(params).reduce((url, param) => {
    const [k, v] = param;
    const r = new RegExp(`/:${k}`, 'g');

    // If the parameter exists as a token in the string, it's 'consumed' and doesn't appear in the querystring.
    if(r.test(url)) {
      delete params[k];
    }

    return url.replace(r, `/${v}`);
  }, `${endpoint}/${subdomain}/${API_METHODS[method].path}`);
}

// Return the appropriate HTTP method (GET, POST, DELETE etc) for the given API method
const getHttpMethod = (method) => {
  return API_METHODS[method].http_method;
};

// Return whether the given method requires a token.
const getRequiresToken = method => (API_METHODS[method].requires_token === true);

// Get the request body for a request
const getBody = (httpMethod, params) => {
  if (httpMethod !== POST) {
    return null;
  }

  return JSON.stringify(params);
}

// Return query parameters for a request - default parameters optionally merged with query parameters for a GET request
const getQueryParams = (httpMethod, params, currency, locale, locationId) => {
  const defaultParams = {
    currency,
    locale,
    location_id: locationId
  };

  if (httpMethod !== GET) {
    return defaultParams;
  }

  return Object.assign({}, defaultParams, params);
};

// Return a querystring that can be appended to an API URL
const buildQueryString = (params) => {
  const queryStringParams = Object.entries(params).reduce((queryStringParams, param) => {
    const [k, v] = param;

    if(!v) {
      return queryStringParams;
    }

    return [...queryStringParams, `${encodeURIComponent(k)}=${encodeURIComponent(v)}`];
  }, []);

  if(queryStringParams.length === 0) {
    return '';
  }

  return `?${queryStringParams.join('&')}`;
};

export class ApiClient {

  constructor({ subdomain, endpoint }, { currency, locale, locationId }) {
    this.subdomain = subdomain;
    this.endpoint = endpoint;
    this.currency = currency;
    this.locale = locale;
    this.locationId = locationId;
  }

  async execute({ method, params, onSuccess, onError, onComplete, options = {} }) {
    const url = getUrl(this.endpoint, this.subdomain, method, params);
    const httpMethod = getHttpMethod(method);
    const body = getBody(httpMethod, params);
    const queryParams = getQueryParams(httpMethod, params, this.currency, this.locale, this.locationId);
    const requiresToken = getRequiresToken(method);

    // extract options
    let { token, headers } = options;

    // extend headers with defaults
    headers = Object.assign({
      'Content-Type': 'application/json; charset=utf-8'
    }, headers || {});

    // if the endpoint requires a token and none was provided, retrieve one
    if(requiresToken && !token) {
      let [data, errors] = await this.getToken();

      if (errors) {
        onError && onError(errors);
        return;
      }

      token = data.token;
    }

    // if we have a token (either passed or retrieved), add it to the authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url + buildQueryString(queryParams), {
      body,
      headers,
      method: httpMethod,
      mode: 'cors'
    });

    const json = await response.json();

    // if the status wasn't successful
    if(response.status !== 200) {
      onError && onError(json);
      onComplete && onComplete();
      return;
    }

    onSuccess && onSuccess(json);
    onComplete && onComplete();
  }

  async getToken() {
    const { subdomain } = this;

    try {
      const response = await fetch(`/apps/cardigan/api/v1/${subdomain}/token`);

      const json = await response.json();

      if (response.status !== 200) {
        return [null, json];
      }

      return [json, null];
    } catch (error) {
      return [
        null,
        {
          errors: [
            {
              code: 'could_not_fetch_token',
              description: 'Could not fetch customer token.'
            }
          ]
        }
      ];
    }
  }

  getCardBalance({ number, pin, includeTransactions, onSuccess, onError, onComplete, options }) {
    return this.execute({
      method: 'get_card_balance',
      params: {
        number,
        pin,
        include_transactions: includeTransactions
      },
      onSuccess,
      onError,
      onComplete,
      options
    });
  }

  applyCard({ number, pin, onSuccess, onError, onComplete, options }) {
    return this.execute({
      method: 'apply_card',
      params: {
        number,
        pin
      },
      onSuccess,
      onError,
      onComplete,
      options
    });
  }

  removeCard({ id, onSuccess, onError, onComplete, options }) {
    return this.execute({
      method: 'remove_card',
      params: {
        id
      },
      onSuccess,
      onError,
      onComplete,
      options
    });
  }

  verifyAuthorization({ id, onSuccess, onError, onComplete, options }) {
    return this.execute({
      method: 'verify_authorization',
      params: {
        id
      },
      onSuccess,
      onError,
      onComplete,
      options
    });
  }

  getShopConfig({ onSuccess, onError, onComplete, options }) {
    return this.execute({
      method: 'get_shop_config',
      params: {},
      onSuccess,
      onError,
      onComplete,
      options
    });
  }
}
