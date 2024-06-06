import OAuth from 'oauth-1.0a';
import CryptoJS from 'crypto-js';

const consumerKey = '';
const consumerSecret = '';

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
