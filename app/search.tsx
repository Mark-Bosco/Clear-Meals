import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import { getAccessToken, searchFood } from "../backend/api";

// The Search component fetches the access token and searches for food
const Search = () => {
    // Declare state variables to store the access token and search results
    const [accessToken, setAccessToken] = useState<string | null>(null);
    // The searchResults state variable is an array of objects
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Use the useEffect hook to fetch the access token when the component mounts
    useEffect(() => {
        // The fetchToken function fetches the access token and sets it in the state
        const fetchToken = async () => {
            const token = await getAccessToken();
            setAccessToken(token);
        };
        fetchToken();
    }, []);

    // The handleSearch function searches for food using the access token
    const handleSearch = async () => {
        // Check if the access token exists
        if (accessToken) {
            // Call the searchFood function with the access token and search query
            const results = await searchFood(accessToken, 'corn');
            // Set the search results in the state
            setSearchResults(results.foods.food);
        }
    };

    // Render the Search component
    return (
        <View className = "mt-20 flex-1, justify-center items-center">
            <Button title="Search" onPress={handleSearch} />
            <ScrollView>
                {searchResults.map((food) => (
                    <Text key={food.food_id}>{food.food_name}</Text>
                ))}
            </ScrollView>
        </View>
    );
};

export default Search;