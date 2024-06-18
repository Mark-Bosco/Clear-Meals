const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const NodeCache = require('node-cache');

// Create a new cache object
const cache = new NodeCache();

// Create a new Express app
const proxy = express();

// Use the body-parser middleware
proxy.use(bodyParser.json());

// Create a GET route to retrieve the access token from the cache
proxy.get('/token', (req, res) => {
  console.log('Received GET request for /accessToken endpoint');

  // Get the access token from the cache
  const accessToken = cache.get('access_token');

  // Check if the access token exists
  if (accessToken) {
    console.log('Access token found in cache:', accessToken);
    res.json({ access_token: accessToken.access_token });
  } else {
    console.log('Access token not found in cache');
    res.status(404).json({ error: 'Access token not found' });
  }
});

// Create a POST route to the /token endpoint
proxy.post('/token', async (req, res) => {
  console.log('Received POST request for /token endpoint');

  // Make a POST request to the FatSecret API to get an access token
  try {
    console.log('Sending request to FatSecret API for access token');

    // Send a POST request to the /connect/token endpoint
    const response = await axios({
      method: 'post',
      url: 'https://oauth.fatsecret.com/connect/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: Constants.expoConfig?.extra?.clientId,
        password: Constants.expoConfig?.extra?.clientSecret
      },
      data: querystring.stringify({
        grant_type: 'client_credentials',
        scope: 'basic'
      })
    });

    const accessToken = {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
    };

    const expirationTime = new Date().getTime() + (accessToken.expires_in * 1000);
    cache.set('access_token', accessToken, expirationTime);

    console.log('Received response from FatSecret API:', response.data);

    // Return the response from the FatSecret API
    res.json(response);
  } catch (error) {
    console.error('Error occurred while requesting access token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listen on the specified IP address and port
proxy.listen(3000, ip, () => {
  console.log("Proxy server running");
});
