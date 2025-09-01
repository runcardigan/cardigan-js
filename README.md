# Cardigan.js
Cardigan.js is a Javascript library that targets the browser.

It provides client-side functionality required to integrate Cardigan into the front end of a Shopify store.

You can learn more about Cardigan at https://docs.runcardigan.com.

## Table of contents
  - [Theme integration](#theme-integration)
    - [Drag and drop widgets](#drag-and-drop-widgets)
    - [Custom theme integration](#custom-theme-integration)
      - [From the Cardigan CDN](#from-the-cardigan-cdn)
      - [As an ES6 Module](#as-an-es6-module)
  - [Reference](#reference)
    - [Get card balance](#get-card-balance)
    - [Get rewards balance](#get-rewards-balance)
    - [Apply gift card](#apply-gift-card)
    - [Apply rewards balance](#apply-rewards-balance)
    - [Remove gift card](#remove-gift-card)
    - [Verify authorization](#verify-authorization)
    - [Get shop config](#get-shop-config)
    - [Options](#options)
  - [Development](#development)
  - [Licence](#licence)

## Theme integration
Integrating Cardigan with your Shopify theme allows customers to check the balance of their gift cards as well as purchase new cards from a gift card product page.

Cardigan offers two paths for theme integration: drag-and-drop widgets via theme app extensions, and fully custom builds using our client library.

### Drag and drop widgets
If you're using Cardigan's drag and drop widgets, you won't need to use this library directly as the widgets automatically load Cardigan.js from the Cardigan CDN and call it as needed.

Learn more about [drag and drop widgets](https://docs.runcardigan.com/introduction/theme-integration#drag-and-drop-widgets) and how to use them from the docs.

### Custom theme integration
If you want complete control over how Cardigan is integrated into your Shopify theme, or you're building a headless solution, you'll likely be using this library.

How you do that depends on your preferred integration and development method - you can either load the compiled library from the Cardigan CDN, or you can import Cardigan as an ES6 module.

Some high-level information on each of these approaches is provided below, and you can learn [more about custom theme integration](https://docs.runcardigan.com/introduction/theme-integration#custom-theme-integration) from the docs.

#### From the Cardigan CDN
The Cardigan CDN is a performant, edge-cached delivery system that makes all current and historical versions of the Cardigan.js library available directly to the browser.

The latest version of the library is `1.10.0`, which can be loaded and initialised on required pages like this:

```liquid
<script id="cardigan-config" type="application/json">
  {
    "endpoint": "https://app.runcardigan.com/api/v1",
    "subdomain": "example"
  }
</script>
<script id="cardigan-context" type="application/json">
  {
    "currency": "USD",
    "locale": "en-US"
  }
</script>
<script type="text/javascript" src="https://cdn.runcardigan.com/cardigan-js/1.10.0/cardigan.js"></script>
```

The **required** configuration options to be provided in the `cardigan-config` element are:

* `endpoint`: The Cardigan API endpoint to make requests to; this will almost always be `https://app.runcardigan.com/api/v1` unless you've been provided a specific staging environment URL by the Cardigan team;
* `subdomain`: The Shopify subdomain for your store; the subdomain is the prefix preceding `.myshopify.com` in your store URL.

Some **optional** configuration options are also available:

* `pin_behaviour`: Whether a PIN is required, optional, or not used for balance checking and redemption purposes. Valid values are `required` (default), `optional`, or `not_used`.

The `cardigan-context` element is **optional** and can be used to provide context to Cardigan in situations where multiple currencies or locales may need to be supported:

* `currency`: The currency being used in the current context. If omitted, the store's default currency will be assumed;
* `locale`: The locale being used in the current context. If omitted, the store's default locale will be assumed.

#### As an ES6 Module
If you have an existing ES6-based build process for your front end, you can add Cardigan.js as a dependency with NPM:

```shell
npm install runcardigan/cardigan-js#1.10.0
```

or Yarn:

```shell
yarn add runcardigan/cardigan-js#1.10.0
```

You can then import the `Cardigan` class and initialise it with the same configuration options as described above:

```js
// import Cardigan library
import { Cardigan } from "cardigan-js";

// initialise Cardigan instance with configuration options
const cardigan = new Cardigan(
  document,
  window.Shopify,
  {
    "endpoint": "https://app.runcardigan.com/api/v1",
    "subdomain": "example"
  },
  {
    "currency": "USD",
    "locale": "en-US"
  }
);

// use the Cardigan API object directly
cardigan.api.getCardBalance({ number: '84142498040559305028', pin: '8521 '});
```

The above approach (initialising your own `Cardigan` instance) makes the most sense if you're still looking to utilise Cardigan's built-in balance checker or product form widgets.
If you're looking purely to interact with the Cardigan API, you can initialise only an API client instance:

```js
// import Cardigan API library only
import { CardiganApi } from "cardigan-js";

// initialise a Cardigan API instance with configuration options and context information
const cardiganApi = new CardiganApi({
  "endpoint": "https://app.runcardigan.com/api/v1",
  "subdomain": "example"
}, {
  "currency": "USD",
  "locale": "en-US"
});

// use the client
cardiganApi.getCardBalance({ number: '84142498040559305028', pin: '8521 '});
```

## Reference
This section describes each of the API methods available via the client, their method signature, and an example usage.

### Get card balance
Get the balance of the given card and PIN combination.

```js
cardigan.api.getCardBalance({
  number: '84142498040559305028',
  pin: '8521',
  onSuccess: (result) => {
    // this method will run if the API call succeeds, with `result` populated as:
    // {
    //   "card": {
    //     "currency": "CAD",
    //     "balance": "100.00",
    //     "balance_formatted": "$100.00",
    //     "expires_at": null
    //   }
    // }
  },
  onError: (result) => {
    // this method will run if the API call fails, with `result` populated as:
    // {
    //   "errors": [
    //     {
    //       "code": "card_not_found",
    //       "description": "Could not find a card with the provided details."
    //     }
    //   ]
    // }
  },
  onComplete: () => {
    // this method will always run regardless of the result
  }
});
```

### Get rewards balance
Get the rewards balance for the given customer.

This endpoint requires authentication via a customer session token; when calling it, the Cardigan.js library will automatically request a token for the logged in customer.
Optionally, a token can be provided explicitly as part of the `options` argument (see [options](#options)).

```js
cardigan.api.getRewardsBalance({
  id: '487348390022',
  onSuccess: (result) => {
    // this method will run if the API call succeeds, with `result` populated as:
    // {
    //   "rewards": {
    //     "currency": "CAD",
    //     "balance": "100.00",
    //     "balance_formatted": "$100.00"
    //   }
    // }
  },
  onError: (result) => {
    // this method will run if the API call fails, with `result` populated as:
    // {
    //   "errors": [
    //     {
    //       "code": "customer_not_found",
    //       "description": "Could not find customer account."
    //     }
    //   ]
    // }
  },
  onComplete: () => {
    // this method will always run regardless of the result
  }
});
```

### Apply gift card
Validate the balance of a gift card and ensure a corresponding Shopify gift card is present, so that it can be applied to the Shopify checkout if required.

It's rare that you will need to call this endpoint unless you're developing your own custom checkout integration with Cardigan.

```js
cardigan.api.applyCard({
  number: '84142498040559305028',
  pin: '8521',
  onSuccess: (result) => {
    // this method will run if the API call succeeds, with `result` populated as:
    // {
    //   "card": {
    //     "id": "018607f9-ce90-420f-cd2e-365a14515365",
    //     "code": "2402476c03f20e567890",
    //     "currency": "CAD",
    //     "balance": "100.00"
    //   }
    // }
  },
  onError: (result) => {
    // this method will run if the API call fails, with `result` populated as:
    // {
    //   "errors": [
    //     {
    //       "code": "invalid_pin",
    //       "description": "Provided PIN is invalid."
    //     }
    //   ]
    // }
  },
  onComplete: () => {
    // this method will always run regardless of the result
  }
});
```

### Apply rewards balance
Validate the balance of a customer’s reward account and ensure a corresponding Shopify gift card is present, so that it can be applied to the Shopify checkout if required.

It's rare that you will need to call this endpoint unless you're developing your own custom checkout integration with Cardigan.

This endpoint requires authentication via a customer session token; when calling it, the Cardigan.js library will automatically request a token for the logged in customer.
Optionally, a token can be provided explicitly as part of the `options` argument (see [options](#options)).

```js
cardigan.api.applyRewards({
  id: '487348390022',
  amount: '25.00',
  onSuccess: (result) => {
    // this method will run if the API call succeeds, with `result` populated as:
    // {
    //   "reward": {
    //     "id": "018607f9-ce90-420f-cd2e-365a14515365",
    //     "code": "2402476c03f20e56RWRD",
    //     "currency": "CAD",
    //     "balance": "100.00",
    //     "amount": "75.00"
    //   }
    // }
  },
  onError: (result) => {
    // this method will run if the API call fails, with `result` populated as:
    // {
    //   "errors": [
    //     {
    //       "code": "unauthorized",
    //       "description": "Unauthorized."
    //     }
    //   ]
    // }
  },
  onComplete: () => {
    // this method will always run regardless of the result
  }
});
```

### Remove gift card
Mark a gift card as removed from a checkout, which will release any held funds (if the external card provider supports it).

It's rare that you will need to call this endpoint unless you're developing your own custom checkout integration with Cardigan.

```js
cardigan.api.removeCard({
  id: '8c4b0002-a48c-42d1-a352-d19f2fe0e657',
  onSuccess: (result) => {
    // this method will run if the API call succeeds, with `result` populated as:
    // {
    //   "card": {
    //     "id": "018607f9-ce90-420f-cd2e-365a14515365",
    //     "code": "2402476c03f20e567890",
    //     "currency": "CAD",
    //     "balance": "100.00"
    //   }
    // }
  },
  onError: (result) => {
    // this method will run if the API call fails, with `result` populated as:
    // {
    //   "errors": [
    //     {
    //       "code": "card_not_found",
    //       "description": "Could not find a card with the provided details."
    //     }
    //   ]
    // }
  },
  onComplete: () => {
    // this method will always run regardless of the result
  }
});
```

### Verify authorization
Check the validity of an existing authorization held against a card.

It's rare that you will need to call this endpoint unless you're developing your own custom checkout integration with Cardigan.

```js
cardigan.api.verifyAuthorization({
  id: '0196b7bd-3d4c-c1be-03d5-ac28e835b80a',
  onSuccess: (result) => {
    // this method will run if the API call succeeds, with `result` populated as:
    // {
    //   "authorization": {
    //     "id": "0196b7bd-3d4c-c1be-03d5-ac28e835b80a",
    //     "expires_at": "2025-05-10T15:07:02+10:00"
    //   }
    // }
  },
  onError: (result) => {
    // this method will run if the API call fails, with `result` populated as:
    // {
    //   "errors": [
    //     {
    //       "code": "authorization_not_found",
    //       "description": "Could not find an authorization with the provided details."
    //     }
    //   ]
    // }
  },
  onComplete: () => {
    // this method will always run regardless of the result
  }
});
```

### Get shop config
Get the Cardigan configuration for the relevant shop.
The information returned can be used to drive client behaviour.

```js
cardigan.api.getShopConfig({
  onSuccess: (result) => {
    // this method will run if the API call succeeds, with `result` populated as:
    // {
    //   "shop_config": {
    //     "card_length": 20,
    //     "cardigan_js_debug": false,
    //     "cardigan_js_uri": "https://cdn.runcardigan.com/cardigan-js/1.10.0/cardigan.js",
    //     "endpoint": "https://app.runcardigan.com/api/v1",
    //     "matching": {
    //       "matching_type": "variant_ids",
    //       "matching_variant_ids": [
    //         40632704663594,
    //         40632702763050
    //       ]
    //     },
    //     "pin_behaviour": "required",
    //     "pin_pattern": null,
    //     "property_names": {
    //       "recipient_name": "_recipient_name",
    //       "recipient_email": "_recipient_email",
    //       "sender_name": "_sender_name",
    //       "greeting": "_greeting",
    //       "delivery_date": "_delivery_date",
    //       "card_face_id": "_item_ref"
    //     },
    //     "subdomain": "example"
    //   }
    // }
  },
  onError: (result) => {
    // this method will run if the API call fails, with `result` populated as:
    // {
    //   "errors": [
    //     {
    //       "code": "shop_not_found",
    //       "description": "Could not find shop."
    //     }
    //   ]
    // }
  },
  onComplete: () => {
    // this method will always run regardless of the result
  }
});
```

### Options
All API method calls can take an `options` argument, allowing a degree of customisation.
Valid options include:

* `token`: Provide your own session token for authenticated requests.
* `headers`: Define a hash of custom HTTP headers to pass in the request.

For example, if you wanted to provide your own token to the authenticated rewards balance endpoint, alongside a custom `X-Verification-Token` header, you could call:

```js
const myToken = 'ue0F2xV3avBIpay3tKuC';
const myVerificationToken = 'dwbRl5ISEs62Qkert3LV';

cardiganApi.getRewardsBalance({
  id: '487348390022',
  options: {
    token: myToken,
    headers: {
      'X-Verification-Token': myVerificationToken
    }
  }
});
```

## Development
If you're a developer working on the Cardigan.js library, or you'd like an easy way to spin up a browser window with an instantiated Cardigan instance to make API calls with, this repository provides a simple local development environment, provided by [Vite](https://vitejs.dev).

### Setup
We recommend using [asdf](https://github.com/asdf-vm/asdf) for the management of tooling versions. For developing with this repository, we recommend Node.js 16.13.

Once you have `asdf` configured and ready to go, you should:

```bash
# install the version of Node.js in use by this repository
asdf install nodejs 16.13.0

# install the dependencies - run this from the project root directory
yarn install
```

### Environment variables
In a deployed Shopify theme, environment variables like the Cardigan environment, current Shopify subdomain, and logged in customer ID will be retrieved from shop metafields or the Shopify request context via Liquid templates.

For the purposes of development and testing with this example repository, we need to define these values in a local environment file.

The `.env` file lists the variables required to be set -- when starting development, you should copy this file to a new `.env.local` file in the root directory and fill it out with values specific to your environment.

* `VITE_CARDIGAN_ENDPOINT`: The Cardigan API endpoint to make requests to; this will almost always be `https://app.runcardigan.com/api/v1` unless you've been provided a specific staging environment URL by the Cardigan support team.
* `VITE_CURRENCY`: By default, Cardigan will use the default currency of the store when looking to match a profile for use with a particular request. The currency can be overridden via the `currency` context option, which is set in the local development environment with this variable.
* `VITE_CUSTOMER_API_SECRET`: The Cardigan Storefront API secret defined for your Shopify store. This should be provided to you by the Cardigan support team, and is used to generate valid JWT tokens in your local development environment for use against the live Cardigan API. For example, `Qqs99Rc29K23fe7kQvfR1LRG`.
* `VITE_CUSTOMER_ID`: The numerical ID for the Shopify customer you would like to use for development purposes. For example, `7225251091539`.
* `VITE_LOCALE`: By default, Cardigan will use the default locale of the store to generate formatted responses and messages. The locale can be overridden via the `locale` context option, which is set in the local development environment with this variable.
* `VITE_SHOPIFY_SUBDOMAIN`: The domain prefix  for the Shopify store you would like to use for development purposes. For example, this value would be `store` for a Shopify store with the domain `store.myshopify.com`.

### Starting the development server
With the above configured, starting the development server and being able to hot reload code should be as simple as:

```
yarn dev
```

The default `index.html` template includes a balance checker widget, a product form and a cart redemption form; you can also open the development console and make Cardigan API calls directly with commands like `cardigan.api.getCardBalance(...)`.

## Licence
The Cardigan Javascript library is an open-sourced software licensed under the [MIT license](LICENSE.md).

Note this licence applies only to the Javascript library; the Cardigan application itself is a proprietary, closed-source solution.
