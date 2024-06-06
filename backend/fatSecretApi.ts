import axios from 'axios';
import { getOAuthHeader } from './oauth';

const baseUrl = 'https://platform.fatsecret.com/rest/server.api';

export const searchFood = async (query: string) => {
  const url = `${baseUrl}?method=foods.search&format=json&search_expression=${encodeURIComponent(query)}`;
  const headers = getOAuthHeader(url, 'GET');

  try {
    const response = await axios.get(url, { headers });
    return response.data.foods.food; // Adjust based on API response structure
  } catch (error) {
    console.error('Error searching for food:', error);
    throw error;
  }
};

export const getInfo = async (foodId: string) => {
    const url = `${baseUrl}?method=food.get&format=json&food_id=${foodId}`;
    const headers = getOAuthHeader(url, 'GET');
  
    try {
      const response = await axios.get(url, { headers });
      return response.data.food; // Adjust based on API response structure
    } catch (error) {
      console.error('Error getting food nutritional info:', error);
      throw error;
    }
  };
