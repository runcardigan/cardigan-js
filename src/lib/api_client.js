// Constants for possible HTTP methods.
const GET = 'get';
const POST = 'post';

// API methods with their corresponding HTTP method and path.
const API_METHODS = {
  get_card_balance: {
    http_method: GET,
    path: 'cards/:number.json'
  },
  get_rewards_balance: {
    http_method: GET,
    path: 'rewards/:id.json',
    authenticated: true
  },
  apply_card: {
    http_method: POST,
    path: 'cards/:number/apply.json'
  },
  apply_rewards: {
    http_method: POST,
    path: 'rewards/:id/apply.json',
    authenticated: true
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

// Return whether the given method requires authentication.
const getAuthenticated = method => (API_METHODS[method].authenticated === true);

// Return a combined set of query parameters for a request
const getQueryParams = (params, locale) => {
  const defaultParams = {
    locale
  };

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

  constructor({ subdomain, endpoint, locale }) {
    this.subdomain = subdomain;
    this.endpoint = endpoint;
    this.locale = locale;
  }

  async execute({ method, params, onSuccess, onError, onComplete, token }) {
    const url = getUrl(this.endpoint, this.subdomain, method, params);
    const httpMethod = getHttpMethod(method);
    const authenticated = getAuthenticated(method);
    const queryParams = getQueryParams(params, this.locale);

    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    }

    // if the endpoint is authenticated, we require a token
    // this may be passed by the caller or, if not provided, one will be retrieved
    if(authenticated) {
      if(!token) {
        let [data, errors] = await this.getToken();

        if (errors) {
          onError && onError(errors);
          return;
        }

        token = data.token;
      }

      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url + buildQueryString(queryParams), {
      method: httpMethod,
      mode: 'cors',
      headers: headers
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
  };

  getCardBalance({ number, pin, onSuccess, onError, onComplete }) {
    return this.execute({
      method: 'get_card_balance',
      params: {
        number,
        pin
      },
      onSuccess,
      onError,
      onComplete
    });
  }

  getRewardsBalance({ id, onSuccess, onError, onComplete, token }) {
    return this.execute({
      method: 'get_rewards_balance',
      params: {
        id
      },
      onSuccess,
      onError,
      onComplete,
      token
    });
  }

  applyCard({ number, pin, onSuccess, onError, onComplete }) {
    return this.execute({
      method: 'apply_card',
      params: {
        number,
        pin
      },
      onSuccess,
      onError,
      onComplete
    });
  }

  applyRewards({ id, amount, onSuccess, onError, onComplete, token }) {
    return this.execute({
      method: 'apply_rewards',
      params: {
        id,
        amount
      },
      onSuccess,
      onError,
      onComplete,
      token
    });
  }

}
