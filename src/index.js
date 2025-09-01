// index.js
import { Cardigan, CardiganApi } from "./lib/cardigan";
import { parseJSONScript } from "./lib/helpers";

const initialise = () => {
  // check we are in a browser context
  if(!window || !document) { return; }

  // parse Cardigan configuration
  const config = parseJSONScript(document, 'cardigan-config');

  // parse Cardigan context
  const context = parseJSONScript(document, 'cardigan-context');

  // augment the config object with any custom hooks that have been defined
  config.hooks = (window.cardigan ? window.cardigan.hooks : null) || {};

  // parse Cardigan templates, if present
  const templates = parseJSONScript(document, 'cardigan-templates');

  // initialise a Cardigan object and make it accessible to the window
  window.cardigan = new Cardigan(document, window.Shopify, config, context, templates);
}

initialise();
