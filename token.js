import express from 'express';
import nJwt from 'njwt';

const app = express();

const CARDIGAN_ENDPOINT = import.meta.env.CARDIGAN_ENDPOINT || 'https://app.runcardigan.com/api/v1';
const CUSTOMER_API_SECRET = import.meta.env.VITE_CUSTOMER_API_SECRET;
const CUSTOMER_ID = import.meta.env.VITE_CUSTOMER_ID;
const SHOPIFY_SUBDOMAIN = import.meta.env.VITE_SHOPIFY_SUBDOMAIN || 'example';
const SHOPIFY_DOMAIN = `${SHOPIFY_SUBDOMAIN}.myshopify.com`;

const generateJwt = () => {
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 300;

  const claims = {
    exp: expires,
    iss: CARDIGAN_ENDPOINT,
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
