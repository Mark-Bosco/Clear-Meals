import axios from 'axios';
import ip from './config';

// Get access token from the backend
const getAccessToken = async () => {
    console.log('Requesting access token from the backend...');

    // Make a POST request to the backend to get the access token
    try {
        const response = await axios.post(`http://${ip}:3000/token`);
        console.log('Received response from the backend:', response.data);

        // The response.data object contains the access token
        return response.data.access_token;
    // Catch any errors that occur during the request
    } catch (error) {
        console.error('Error getting access token', error);
        throw error;
    }
};

// Search for food using the access token
const searchFood = async (accessToken: string, query: string) => {
    console.log('Searching for food:', query);

    // Make a POST request to the backend to search for food
    try {
        // The response object contains the search results
        const response = await axios.post(
            // The URL of the FatSecret API
            'https://platform.fatsecret.com/rest/server.api',
            null,
            {
                // The request headers contain the access token and the content type
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                // The request parameters contain the search method and the search expression
                params: {
                    method: 'foods.search',
                    search_expression: query,
                    format: 'json',
                }
            }
        );

        console.log('Received response from the FatSecret API:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error searching food', error);
        throw error;
    }
};

// Export the functions to use them in other files
export { getAccessToken, searchFood };