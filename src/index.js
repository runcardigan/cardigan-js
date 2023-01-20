// index.js
import { Cardigan } from "./lib/cardigan";
import { parseJSONScript } from "./lib/helpers";

const initialise = () => {
  // check we are in a browser context
  if(!window || !document) { return; }

  // parse Cardigan configuration
  const config = parseJSONScript(document, 'cardigan-config');

  // initialise a Cardigan object and make it accessible to the window
  window.cardigan = new Cardigan(document, window.Shopify, config);
}

initialise();
