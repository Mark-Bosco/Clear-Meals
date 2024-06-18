import React, { useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import { searchFood } from "../backend/api";

// The Search component fetches the access token and searches for food
const Search = () => {
    // The searchResults state variable is an array of objects
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // The handleSearch function searches for food using the access token
    const handleSearch = async () => {
            // Call the searchFood function with the access token and search query
            const results = await searchFood('corn');
            // Set the search results in the state
            setSearchResults(results.foods.food);
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