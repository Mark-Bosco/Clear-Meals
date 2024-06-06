import OAuth from 'oauth-1.0a';
import CryptoJS from 'crypto-js';

const consumerKey = 'd9427d9c52974c65bdd583782e29787c';
const consumerSecret = '89ef8f64d2894a45a0fdae5262b62e3a';

const oauth = new OAuth({
  consumer: { key: consumerKey, secret: consumerSecret },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
  },
});

export const getOAuthHeader = (url: string, method: 'GET' | 'POST') => {
  const requestData = {
    url,
    method,
  };

  const oauthData = oauth.authorize(requestData);
  return {
    ...oauth.toHeader(oauthData),
    'Content-Type': 'application/json',
  };
};
