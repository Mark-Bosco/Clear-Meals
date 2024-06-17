const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const { clientSecret, clientId, ip } = require('./config');

// Create a new Express app
const proxy = express();

// Use the body-parser middleware
proxy.use(bodyParser.json());

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
        username: clientId,
        password: clientSecret
      },
      data: querystring.stringify({
        grant_type: 'client_credentials',
        scope: 'basic'
      })
    });

    console.log('Received response from FatSecret API:', response.data);

    // Return the response from the FatSecret API
    res.json(response.data);
  } catch (error) {
    console.error('Error occurred while requesting access token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listen on the specified IP address and port
proxy.listen(3000, ip, () => {
  console.log("Proxy server running");
});
