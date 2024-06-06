// src/screens/SearchScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, FlatList, StyleSheet } from 'react-native';
import { searchFood, getInfo } from '../backend/fatSecretApi';
import FoodItem, { FoodItemType } from '../components/FoodItem';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItemType[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItemType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    try {
      const foodResults = await searchFood(query);
      setResults(foodResults);
      setSelectedFood(null);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (foodId: string) => {
    setIsLoading(true);
    try {
      const foodInfo = await getInfo(foodId);
      setSelectedFood(foodInfo);
    } catch (error) {
      console.error('Failed to get food info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a food..."
        />
        <Pressable style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>
      </View>

      {isLoading && <Text>Loading...</Text>}

      {!selectedFood ? (
        <FlatList
          data={results}
          renderItem={({ item }) => <FoodItem item={item} onSelect={handleSelect} />}
          keyExtractor={item => item.food_id}
          ListEmptyComponent={<Text>No results found</Text>}
        />
      ) : (
        <View style={styles.foodDetails}>
          <FoodItem item={selectedFood} onSelect={() => { }} />
          <Text>Calories: {selectedFood.serving?.calories || 'N/A'}</Text>
          {/* Add a button to add this food to a meal */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  searchBar: { flexDirection: 'row', marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: 'gray', padding: 8, borderRadius: 4 },
  button: { padding: 8, backgroundColor: 'blue', borderRadius: 4, marginLeft: 8 },
  buttonText: { color: 'white' },
  foodDetails: { padding: 16 },
});

export default SearchScreen;