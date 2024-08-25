import axios from 'axios';
import { auth } from '../firebase';
import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';

const functions = getFunctions();

interface AccessTokenResponse {
  access_token: string;
}

// Get access token from the backend
const getAccessToken = async (): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    //console.log('Calling getUserToken function...');
    const getUserToken = httpsCallable<unknown, AccessTokenResponse>(functions, 'getUserToken');
    const result: HttpsCallableResult<AccessTokenResponse> = await getUserToken();

    //console.log('getUserToken function call result:', result);

    if (result.data && result.data.access_token) {
      return result.data.access_token;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error: any) {
    console.error('Error getting access token', error);
    throw error;
  }
};

const createFatSecretRequest = (accessToken: string) => {
  return axios.create({
    baseURL: 'https://platform.fatsecret.com/rest/server.api',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

const searchFood = async (query: string, page: number = 0) => {
  const accessToken = await getAccessToken();
  const fatSecretApi = createFatSecretRequest(accessToken);

  try {
    const response = await fatSecretApi.post('', null, {
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
    });

    // Check if the response contains valid data
    if (response.data && response.data.foods_search) {
      return {
        ...response.data.foods_search,
        foods: response.data.foods_search.results ? response.data.foods_search.results.food || [] : []
      };
    } else {
      return { foods: [], total_results: 0, max_results: 20, page_number: page };
    }
  } catch (error) {
    console.error('Error searching food', error);
    throw error;
  }
};

const getFood = async (foodId: string) => {
  const accessToken = await getAccessToken();
  const fatSecretApi = createFatSecretRequest(accessToken);

  try {
    const response = await fatSecretApi.post('', null, {
      params: {
        method: 'food.get.v4',
        food_id: foodId,
        format: 'json',
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting food details', error);
    throw error;
  }
};

const getAutocompleteSearch = async (expression: string) => {
  const accessToken = await getAccessToken();
  const fatSecretApi = createFatSecretRequest(accessToken);

  try {
    const response = await fatSecretApi.post('', null, {
      params: {
        method: 'foods.autocomplete.v2',
        expression: expression,
        format: 'json',
        max_results: 6,
      }
    });
    
    // Check if the response contains valid suggestions
    if (response.data && response.data.suggestions && Array.isArray(response.data.suggestions.suggestion)) {
      return response.data.suggestions.suggestion;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting autocomplete suggestions', error);
    return [];
  }
};

export { searchFood, getFood, getAutocompleteSearch };