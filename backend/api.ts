import axios from 'axios';
import Constants from 'expo-constants';
import { auth } from '../firebase';

const proxyIp = Constants.expoConfig?.extra?.proxyIp;

// Get access token from the backend
const getAccessToken = async () => {
  //console.log('Requesting access token from the backend...');

  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const idToken = await user.getIdToken();
    const response = await axios.post(`http://${proxyIp}:3000/user-token`, { idToken });
    //console.log('Received response from the backend:', response.data);
    return response.data.access_token;
  } catch (error: any) {
    //console.error('Error getting access token', error);
    throw error;
  }
};

const searchFood = async (query: string, page: number = 0) => {
  const accessToken = await getAccessToken();

  //console.log('Searching for food:', query, 'Page:', page);

  try {
    const response = await axios.post(
      'https://platform.fatsecret.com/rest/server.api',
      null,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          method: 'foods.search.v3',
          search_expression: query,
          format: 'json',
          page_number: page,
          max_results: 20,
          flag_default_serving: true,
          language: 'en',
          region: 'US',
        }
      }
    );
    
    //console.log('Received response from the FatSecret API:', response.data);
    return response.data;
  } catch (error) {
    //console.error('Error searching food', error);
    throw error;
  }
};

const getFood = async (foodId: string) => {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.post(
      'https://platform.fatsecret.com/rest/server.api',
      null,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          method: 'food.get.v4',
          food_id: foodId,
          format: 'json',
        }
      }
    );

    //console.log('Received response from the FatSecret API:', response.data);
    return response.data;
  } catch (error) {
    //console.error('Error searching food', error);
    throw error;
  }
};

const getAutocompleteSearch = async (expression: string) => {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.post(
      'https://platform.fatsecret.com/rest/server.api',
      null,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          method: 'foods.autocomplete.v2',
          expression: expression,
          format: 'json',
          max_results: 6,
        }
      }
    );
      return response.data.suggestions.suggestion;
  } catch (error) {
    //console.error('Error getting autocomplete suggestions', error);
    return[];
  }
};


export { searchFood, getFood, getAutocompleteSearch };