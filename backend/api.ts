import axios from 'axios';
const { ip } = require('./config');

// Get access token from the backend
const getAccessToken = async () => {
    console.log('Requesting access token from the backend...');

    // Make a POST request to the backend to get the access token
    try {
        console.log(`${ip}`)
        const response = await axios.get(`http://192.168.56.1:3000/token`);
        console.log('Received response from the backend:', response.data);
        return response.data.access_token;
    } catch (error: any) {
        // If the access token is not found in the cache or there's an error, request a new one
        if (error.response && error.response.status === 404) {
            console.log('Access token not found in cache, requesting a new one');
            try {
                const response = await axios.post(`http://${ip}:3000/token`);
                console.log('Received response from the backend:', response.data);
                return response.data.access_token;
            } catch (err) {
                console.error('Error getting new access token', err);
                throw err;
            }
        } else if (error.response) {
            console.error(`Error getting access token (${error.response.status}):`, error.response.data);
            throw error;
        } else {
            console.error('Error getting access token', error);
            throw error;
        }
    }
};

// Search for food using the access token
const searchFood = async (query: string) => {

    const accessToken = await getAccessToken();

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
export { searchFood };