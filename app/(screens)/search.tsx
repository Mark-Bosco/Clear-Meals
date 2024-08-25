import React, { useState, useCallback, useMemo } from "react";
import { StyleSheet, View, Text, TextInput, FlatList, Pressable, ActivityIndicator, ScrollView, Alert } from "react-native";
import { searchFood, getAutocompleteSearch } from "../../backend/api";
import { router, useLocalSearchParams } from "expo-router";
import { Food, MealType } from "../../types/types";
import { useFoodList } from '../../contexts/FoodListContext';
import { useAuth } from "../../contexts/AuthContext";
import { saveMeal } from "../../backend/firestore";

const getCalories = (food: Food): string => {
    return food.servings.serving[0].calories;
};

const getServingSize = (food: Food): string => {
    return food.servings.serving[0].serving_description.split(' ').slice(0, 3).join(' ').replace(/,\s*$/, '');
}

const FoodResult = React.memo(({ food, onPress }: { food: Food; onPress: () => void }) => (
    <Pressable
        style={styles.foodResultContainer}
        onPress={onPress}>
        {({ pressed }) => (
            <View style={styles.foodResultContent}>
                <View style={styles.foodInfoContainer}>
                    <Text style={[styles.foodName, pressed && styles.pressedText]}>
                        {food.food_name}
                    </Text>
                    <Text style={[styles.brandName, pressed && styles.pressedText]}>
                        {food.brand_name || "Generic"}
                    </Text>
                </View>
                <View style={styles.caloriesContainer}>
                    <Text style={[styles.calories, pressed && styles.pressedText]}>
                        {getCalories(food)} cals
                    </Text>
                    <Text style={[styles.servingSize, pressed && styles.pressedText]}>
                        {getServingSize(food)}
                    </Text>
                </View>
            </View>
        )}
    </Pressable>
));

const Search = () => {
    const [query, setQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Food[]>([]);
    const [page, setPage] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const { mealType } = useLocalSearchParams<{ mealType: MealType }>();
    const { dateString } = useLocalSearchParams<{ dateString: string }>();
    const date = ((dateString ? new Date(dateString) : new Date())).toISOString().split('T')[0]; // Convert the date to a string
    const { foodList, removeFood, clearList } = useFoodList();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    // Is reset results ever used?
    const handleSearch = useCallback(async (resetResults: boolean = true, searchQuery?: string) => {
        if (loading || (resetResults && (searchQuery ?? query).trim() === "")) return;

        setLoading(true);
        // Clear suggestions on search entered
        setSuggestions([]);

        try {
            const currentPage = resetResults ? 0 : page;
            const results = await searchFood(searchQuery ?? query, currentPage);

            if (results.error) {
                console.error("API Error:", results.error);
                setSearchResults([]);
                setHasMore(false);
                return;
            }

            if (!results.foods_search || !results.foods_search.results || !results.foods_search.results.food) {
                console.error("Unexpected API response structure:", results);
                setSearchResults([]);
                setHasMore(false);
                return;
            }

            const foods = results.foods_search.results.food;

            setSearchResults(prevResults => resetResults ? foods : [...prevResults, ...foods]);
            // Do we need 2 page variables?
            setPage(currentPage + 1);
            setHasMore((results.foods_search.max_results * page) < results.foods_search.total_results)


        } catch (error) {
            console.error("Error searching for food:", error);
            setSearchResults([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [query, page, loading]);

    const handleLoadMore = useCallback(() => {
        if (hasMore && !loading) {
            handleSearch(false);
        }
    }, [hasMore, loading, handleSearch]);

    const handleInputChange = useCallback(async (text: string) => {
        setQuery(text);
        if (text.length >= 2) {
            try {
                const autocompleteSuggestions = await getAutocompleteSearch(text);
                setSuggestions(autocompleteSuggestions);
            } catch (error) {
                console.error("Error getting autocomplete suggestions:", error);
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    }, []);

    const handleSuggestionPress = useCallback((suggestion: string) => {
        setQuery(suggestion);
        setSuggestions([]);
        handleSearch(true, suggestion);
    }, [handleSearch]);

    const handleListSave = async () => {
        if (isSaving || !user || !user.uid || !mealType) {
            return;
        }

        setIsSaving(true);
        try {
            await saveMeal(user.uid, date, mealType, foodList);
            clearList();
            router.back();
        } catch (error) {
            console.error('Error saving meal:', error);
            // Show an error message to the user
            Alert.alert('Error', 'Failed to save meal. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const renderFoodListBubbles = () => (
        <View style={styles.foodListContainer}>
            <ScrollView>
                <View style={styles.foodListContent}>
                    {foodList.map((foodListItem, index) => (
                        <Pressable
                            key={index}
                            onPress={() => router.push({
                                pathname: '/(screens)/nutrition',
                                params: { foodId: foodListItem.food_id, calorieOverride: foodListItem.calories, foodIndex: index }
                            })}
                            style={styles.foodBubble}
                        >
                            <Text style={styles.foodBubbleName}>{foodListItem.food_name}</Text>
                            <Text style={styles.foodBubbleCalories}>({foodListItem.calories} cals)</Text>
                            <Pressable onPress={() => removeFood(index)}>
                                <Text style={styles.removeButton}>×</Text>
                            </Pressable>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderSuggestions = () => (
        <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
                <Pressable
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(suggestion)}
                >
                    <Text>{suggestion}</Text>
                </Pressable>
            ))}
        </View>
    );

    const renderFoodItem = useCallback(({ item }: { item: Food }) => (
        <FoodResult
            food={item}
            onPress={() => router.push({
                pathname: '/(screens)/nutrition',
                params: { foodId: item.food_id }
            })}
        />
    ), []);

    const renderFooter = useMemo(() => {
        if (!loading) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }, [loading]);

    const keyExtractor = useCallback((food: Food) => food.food_id, []);


    return (
        <View style={styles.container}>
            {foodList.length > 0 && renderFoodListBubbles()}
            <View style={styles.searchInputContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for food..."
                    value={query}
                    onChangeText={handleInputChange}
                    onSubmitEditing={() => handleSearch(true, query)}
                />
            </View>
            {suggestions.length > 0 && renderSuggestions()}
            <FlatList
                data={searchResults}
                renderItem={renderFoodItem}
                keyExtractor={keyExtractor}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={renderFooter}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={20}
                windowSize={21}
            />
            {foodList.length > 0 && (
                <View style={styles.buttonContainer}>
                    <Pressable style={styles.clearButton} onPress={clearList}>
                        <Text style={styles.buttonText}>Clear Meal</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.saveButton, isSaving && styles.savingButton]}
                        onPress={handleListSave}
                        disabled={isSaving}
                    >
                        <Text style={styles.buttonText}>
                            {isSaving ? 'Saving...' : 'Save Meal'}
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 48,
    },
    foodResultContainer: {
        marginHorizontal: 24,
        marginVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 16,
    },
    foodResultContent: {
        flexDirection: 'row',
    },
    foodInfoContainer: {
        flex: 1,
        paddingRight: 8,
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        flexWrap: 'wrap',
    },
    brandName: {
        fontSize: 18,
        color: '#4B5563',
    },
    caloriesContainer: {
        justifyContent: 'center',
    },
    calories: {
        fontSize: 20,
        fontWeight: 500,
        textAlign: 'right',
        color: '#4B5563',
    },
    servingSize: {
        fontSize: 18,
        fontWeight: 300,
        textAlign: 'right',
        color: '#4B5563',
    },
    pressedText: {
        color: '#9CA3AF',
    },
    foodListContainer: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
    },
    foodListContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    foodBubble: {
        backgroundColor: '#15803D',
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 4,
        margin: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    foodBubbleName: {
        marginRight: 8,
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    foodBubbleCalories: {
        marginRight: 8,
        color: 'white',
        fontSize: 16,
    },
    removeButton: {
        color: '#B91C1C',
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchInputContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    searchInput: {
        marginVertical: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        padding: 8,
        paddingHorizontal: 16,
    },
    suggestionsContainer: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        marginHorizontal: 16,
    },
    suggestionItem: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    loadingFooter: {
        paddingVertical: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        backgroundColor: 'white',
    },
    clearButton: {
        backgroundColor: '#B91C1C',
        padding: 8,
        borderRadius: 4,
        flex: 1,
        marginRight: 8,
    },
    saveButton: {
        backgroundColor: '#15803D',
        padding: 8,
        borderRadius: 4,
        flex: 1,
        marginLeft: 8,
    },
    savingButton: {
        backgroundColor: '#9CA3AF',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
    },
});

export default Search;