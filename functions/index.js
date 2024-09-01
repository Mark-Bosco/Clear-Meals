const functions = require('firebase-functions');
const axios = require('axios');
const querystring = require('querystring');
const { initializeApp } = require("firebase-admin/app");
const admin = require('firebase-admin');

initializeApp();

const clientId = functions.config().fatsecret.clientid;
const clientSecret = functions.config().fatsecret.clientsecret;

// Initialize Firestore
const db = admin.firestore();

// Function to get an access token from FatSecret
async function getAccessToken(uid) {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    const userData = userDoc.data();
    if (userData.fatSecretToken && userData.fatSecretTokenExpiry > Date.now()) {
      //console.log('Using cached token for user:', uid);
      return userData.fatSecretToken;
    }
  }

  try {
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
        scope: 'premier'
      })
    });

    const { access_token: accessToken, expires_in: expiresIn } = response.data;

    // Store the token in Firestore
    await userRef.set({
      fatSecretToken: accessToken,
      fatSecretTokenExpiry: Date.now() + expiresIn * 1000 // Convert seconds to milliseconds
    }, { merge: true });

    //console.log('New token obtained and cached for user:', uid);
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

exports.getUserToken = functions.https.onCall(async (data, context) => {
  //console.log('getUserToken Function called');

  if (!context.auth) {
    //console.log('No auth context found in the function');
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  //console.log('User authenticated in function:', uid);

  try {
    const accessToken = await getAccessToken(uid);
    //console.log('Access token obtained successfully');
    return { access_token: accessToken };
  } catch (error) {
    console.error('Error getting access token in function:', error);
    throw new functions.https.HttpsError('internal', 'Error getting access token', error);
  }
});