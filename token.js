import express from 'express';
import nJwt from 'njwt';

const app = express();

const CARDIGAN_ENVIRONMENT = import.meta.env.VITE_SUBMARINE_ENVIRONMENT || 'development';
const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || 'example.myshopify.com';
const CUSTOMER_ID = import.meta.env.VITE_CUSTOMER_ID;
const CUSTOMER_API_SECRET = import.meta.env.VITE_CUSTOMER_API_SECRET;

const CARDIGAN_DOMAINS = {
  development: 'https://cardigan-dev.au.ngrok.io',
  staging: 'https://app-staging.runcardigan.com',
  production: 'https://app.runcardigan.com'
};

const generateJwt = () => {
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 300;

  const claims = {
    exp: expires,
    iss: CARDIGAN_DOMAINS[CARDIGAN_ENVIRONMENT],
    aud: SHOPIFY_DOMAIN,
    sub: CUSTOMER_ID,
    iat: now,
    nbf: now
  }

  return nJwt.create(claims, CUSTOMER_API_SECRET).compact();
};

app.get("/apps/cardigan/api/v1/:subdomain/token", (req, res) => {
  res.json({
    token: generateJwt()
  });
});

export const handler = app;
