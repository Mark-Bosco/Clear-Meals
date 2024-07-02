const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const NodeCache = require('node-cache');
require('dotenv').config({ path: '../.env' });
const appConfig = require('../app.config');
const clientId = appConfig.expo.extra.clientId;
const clientSecret = appConfig.expo.extra.clientSecret;
const proxyIp = appConfig.expo.extra.proxyIp;
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // You can add other configuration options here if needed
});

// Create a new cache object
const cache = new NodeCache();

// Create a new Express app
const proxy = express();

// Use the body-parser middleware
proxy.use(bodyParser.json());

// Endpoint for user-specific tokens
proxy.post('/user-token', async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check if a user token exists for this user
    let accessToken = cache.get(`user_token_${uid}`);

    if (!accessToken) {
      // If no token exists, request a new one from FatSecret
      const response = await axios({
        method: 'post',
        url: 'https://oauth.fatsecret.com/connect/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: clientId,
          password: clientSecret
        },
        data: querystring.stringify({
          grant_type: 'client_credentials',
          scope: 'basic'
        })
      });

      accessToken = response.data.access_token;
      // Store the token in cache with the user's UID
      cache.set(`user_token_${uid}`, accessToken);
    }
    else {
      console.log('User token found in cache');
    }

    res.json({ access_token: accessToken });
  } catch (error) {
    console.error('Error occurred while requesting user-specific token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for general tokens
proxy.post('/general-token', async (req, res) => {
  console.log('Received POST request for /general-token endpoint');

  try {
    // Check if a general token exists in the cache
    let accessToken = cache.get('general_access_token');

    if (!accessToken) {
      console.log('General token not found in cache, requesting a new one');
      // If no token exists, request a new one from FatSecret
      const response = await axios({
        method: 'post',
        url: 'https://oauth.fatsecret.com/connect/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: clientId,
          password: clientSecret
        },
        data: querystring.stringify({
          grant_type: 'client_credentials',
          scope: 'basic'
        })
      });

      accessToken = response.data.access_token;
      // Store the token in cache
      cache.set('general_access_token', accessToken);
      console.log('Received new general token from FatSecret API');
    } else {
      console.log('General token found in cache');
    }

    res.json({ access_token: accessToken });
  } catch (error) {
    console.error('Error occurred while handling general token request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listen on the specified IP address and port
proxy.listen(3000, proxyIp, () => {
  console.log("Proxy server running");
});