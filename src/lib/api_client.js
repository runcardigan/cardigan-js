// Constants for possible HTTP methods.
const GET = 'get';

// API methods with their corresponding HTTP method and path.
const API_METHODS = {
  get_balance: {
    http_method: GET,
    path: 'cards/:number.json'
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

// Return a combined set of query parameters for a request
const getQueryParams = (authentication, params) => {
  return Object.assign({}, authentication, params);
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

  constructor({ subdomain, endpoint }) {
    this.subdomain = subdomain;
    this.endpoint = endpoint;
  }

  async execute({ method, params, onSuccess, onFailure, onComplete }) {
    const url = getUrl(this.endpoint, this.subdomain, method, params);
    const httpMethod = getHttpMethod(method);
    const queryParams = getQueryParams(params);

    const response = await fetch(url + buildQueryString(queryParams), {
      method: httpMethod,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

    const json = await response.json();

    // if the status wasn't successful
    if(response.status !== 200) {
      onFailure && onFailure(json);
      onComplete && onComplete();
      return;
    }

    onSuccess && onSuccess(json);
    onComplete && onComplete();
  }

  getBalance({ number, pin, onSuccess, onFailure, onComplete }) {
    return this.execute({
      method: 'get_balance',
      params: {
        number,
        pin
      },
      onSuccess,
      onFailure,
      onComplete
    });
  }

}
