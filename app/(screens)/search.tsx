import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { searchFood } from "../../backend/api";
import { router, useLocalSearchParams } from "expo-router";
import { Food, FoodListItem, MealType } from "../types";
import { useFoodList } from '../FoodListContext';

const getCalories = (food: Food): string => {
    return food.servings.serving[0].calories;
};

const getServingSize = (food: Food): string => {
    return food.servings.serving[0].serving_description.split(' ').slice(0, 3).join(' ');;
}

const FoodResult = React.memo(({ food, onPress }: { food: Food; onPress: () => void }) => (
    <Pressable
        className="mx-6 my-2 bg-gray-100 rounded-2xl p-4"
        onPress={onPress}>
        {({ pressed }) => (
            <View className="flex-row">
                <View className="flex-1 pr-2">
                    <Text className={`text-lg font-bold flex-wrap ${pressed ? 'text-gray-600' : 'text-black'}`}>
                        {food.food_name}
                    </Text>
                    <Text className={`text-lg ${pressed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {food.brand_name || "Generic"}
                    </Text>
                </View>
                <View className="justify-center">
                    <Text className={`text-lg text-right ${pressed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getCalories(food)} cals
                    </Text>
                    <Text className={`text-md text-right ${pressed ? 'text-gray-400' : 'text-gray-600'}`}>
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
    const { foodList, removeFood, clearList } = useFoodList();

    const handleListSave = () => {
        router.back();
    };

    const FoodListBubbles = () => (
        <View className="bg-gray-100 p-4 mb-4" style={{ maxHeight: 100 }}>
            <ScrollView>
                <View className="flex-row flex-wrap">
                    {foodList.map((foodListItem, index) => (
                        <Pressable key={index} onPress={() => router.push({
                            pathname: '/(screens)/nutrition',
                            params: { foodId: foodListItem.food_id, calorieOverride: foodListItem.calories, foodListIndex: index}
                        })}
                            className="bg-green-700 rounded-full px-3 py-1 m-1 flex-row items-center">
                            <Text className="mr-2 text-white text-lg font-semibold">{foodListItem.food_name}</Text>
                            <Text className="mr-2 text-white text-md">({foodListItem.calories} cals)</Text>
                            <Pressable onPress={() => removeFood(index)}>
                                <Text className="text-red-700 text-xl font-bold">×</Text>
                            </Pressable>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const handleSearch = useCallback(async (resetResults: boolean = true) => {
        if (loading || (resetResults && query.trim() === "")) return;

        setLoading(true);

        try {
            const currentPage = resetResults ? 0 : page;
            const results = await searchFood(query, currentPage);

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
            // Why are we using 2 page variables?
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

    const renderFoodItem = useCallback(({ item }: { item: Food }) => (
        <FoodResult
            food={item}
            onPress={() => router.push({
                pathname: '/(screens)/nutrition',
                params: { foodId: item.food_id }
            })}
        />
    ), []);

    const keyExtractor = useCallback((food: Food) => food.food_id, []);

    const renderFooter = useMemo(() => {
        if (!loading) return null;
        return (
            <View className="py-4">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }, [loading]);

    return (
        <View className="flex-1 bg-white mt-10">
            <View className="p-4">
                <TextInput
                    className="my-1 bg-gray-200 rounded-xl p-2 px-4"
                    placeholder="Search for food..."
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={() => handleSearch()}
                />
            </View>
            {foodList.length > 0 && <FoodListBubbles />}
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
                <View className="flex-row justify-around p-4 bg-white">
                    <Pressable className="bg-red-700 p-2 rounded flex-1 mr-2" onPress={clearList}>
                        <Text className="text-white text-center font-bold text-xl">Clear List</Text>
                    </Pressable>
                    <Pressable className="bg-green-700 p-2 rounded flex-1 ml-2" onPress={handleListSave}>
                        <Text className="text-white text-center font-bold text-xl">Save List</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
};


export default Search;