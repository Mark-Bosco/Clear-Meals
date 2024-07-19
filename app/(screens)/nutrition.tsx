import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, TextInput, NativeSyntheticEvent, TextInputSubmitEditingEventData } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getFood } from "../../backend/api";

const ozToGrams = (oz: number) => oz * 28.34952;
const gramsToOz = (g: number) => g / 28.34952;

interface Food {
    food_id: string;
    food_name: string;
    brand_name: string;
    servings: {
        serving: Serving[];
    };
}

interface Serving {
    metric_serving_amount: string;
    metric_serving_unit: string;
    serving_description: string;
    amount: string;
    unit: string;
    calories: string;
    fat?: string;
    saturated_fat?: string;
    trans_fat?: string;
    cholesterol?: string;
    sodium?: string;
    carbohydrate?: string;
    fiber?: string;
    sugar?: string;
    protein?: string;
    vitamin_a?: string;
    vitamin_c?: string;
    calcium?: string;
    iron?: string;
}

// Nutrition screen component
const Nutrition: React.FC = () => {
    // Food ID from URL params
    const { foodId } = useLocalSearchParams<{ foodId: string }>();
    // Collection of food servings
    const [food, setFood] = useState<Food | null>(null);
    // Index of currently displayed serving
    const [servingIndex, setServingIndex] = useState(0);
    // Currently displayed serving
    const [currServing, setCurrServing] = useState<Serving | null>(null);
    // Flag for when a measurement is edited to start syncing
    const [sync, setSync] = useState(false);
    // Reset the calorie and serving size inputs back to default
    const [reset, setReset] = useState(false);

    // Create default metric serving sizes, if they don't exist, for the selected food item
    const addMetricServings = (food: Food) => {
        // Make a deep copy of the servings array to avoid direct state mutation
        let newServings = food.servings.serving.map(serving => ({ ...serving }));

        const firstServing = newServings[0];
        const metricAmount = parseFloat(firstServing.metric_serving_amount);

        if (!(firstServing.metric_serving_unit)) {
            throw new Error('Missing metric serving unit for food item');
        }

        const hasOz = newServings.some(s => s.serving_description.split(' ')[1] === 'oz');
        const hasGram = newServings.some(s => s.serving_description.split(' ')[1] === 'g');
        
        const metricUnit = firstServing.metric_serving_unit.toLowerCase();

        if (metricUnit === 'oz' || metricUnit === 'g') {
            if (!hasOz) {
                // Add oz serving
                const ozAmount = metricUnit === 'oz' ? metricAmount : gramsToOz(metricAmount);
                const ozServing: Serving = {
                    ...firstServing,
                    serving_description: `${ozAmount.toFixed(1)} oz`,
                    amount: ozAmount.toFixed(1),
                    unit: 'oz',
                    metric_serving_amount: ozAmount.toString(),
                    metric_serving_unit: 'oz'
                };
                newServings.push(ozServing)
            }
            if (!hasGram) {
                // Add g serving
                const gAmount = metricUnit === 'g' ? metricAmount : ozToGrams(metricAmount);
                const gServing: Serving = {
                    ...firstServing,
                    serving_description: `${gAmount.toFixed(0)} g`,
                    amount: gAmount.toFixed(0),
                    unit: 'g',
                    metric_serving_amount: gAmount.toString(),
                    metric_serving_unit: 'g'
                };
                newServings.push(gServing);
            }
        }

        return {
            ...food,
            servings: { serving: newServings }
        };
    };

    // Fetch food data on mount and create default metric serving sizes
    useEffect(() => {
        const fetchData = async () => {
            if (!foodId) return;
            try {
                const servings = await getFood(foodId);
                let updatedServings = addMetricServings(servings.food);
                setFood(updatedServings);
                setServingIndex(0);
                setReset(true);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [foodId]);


    // Load a serving to display
    const loadServing = (index: number, rawScaleFactor: number, calorieChange: boolean) => {
        if (!food) return;

        const serving = food.servings.serving[index];
        const base = calorieChange ? parseFloat(serving.calories) : parseFloat(serving.serving_description.split(' ')[0]);
        const scaleFactor = rawScaleFactor / base

        const currServing: Serving = {
            serving_description: serving.serving_description,
            amount: (parseFloat(serving.serving_description.split(' ')[0]) * scaleFactor).toFixed(1),
            unit: serving.serving_description.split(' ')[1].replace(/,$/, ''),
            metric_serving_amount: (parseFloat(serving.metric_serving_amount) * scaleFactor).toFixed(1),
            metric_serving_unit: serving.metric_serving_unit,
            calories: (parseFloat(serving.calories) * scaleFactor).toFixed(0),
            fat: serving.fat ? (parseFloat(serving.fat) * scaleFactor).toFixed(0) : 'N/A',
            carbohydrate: serving.carbohydrate ? (parseFloat(serving.carbohydrate) * scaleFactor).toFixed(0) : 'N/A',
            protein: serving.protein ? (parseFloat(serving.protein) * scaleFactor).toFixed(0) : 'N/A',
            saturated_fat: serving.saturated_fat ? (parseFloat(serving.saturated_fat) * scaleFactor).toFixed(0) : 'N/A',
            trans_fat: serving.trans_fat ? (parseFloat(serving.trans_fat) * scaleFactor).toFixed(0) : 'N/A',
            cholesterol: serving.cholesterol ? (parseFloat(serving.cholesterol) * scaleFactor).toFixed(0) : 'N/A',
            sodium: serving.sodium ? (parseFloat(serving.sodium) * scaleFactor).toFixed(0) : 'N/A',
            fiber: serving.fiber ? (parseFloat(serving.fiber) * scaleFactor).toFixed(0) : 'N/A',
            sugar: serving.sugar ? (parseFloat(serving.sugar) * scaleFactor).toFixed(0) : 'N/A',
            vitamin_a: serving.vitamin_a ? (parseFloat(serving.vitamin_a) * scaleFactor).toFixed(0) : 'N/A',
            vitamin_c: serving.vitamin_c ? (parseFloat(serving.vitamin_c) * scaleFactor).toFixed(0) : 'N/A',
            iron: serving.iron ? (parseFloat(serving.iron) * scaleFactor).toFixed(0) : 'N/A',
            calcium: serving.calcium ? (parseFloat(serving.calcium) * scaleFactor).toFixed(0) : 'N/A',
        }
        setCurrServing(currServing);
    }

    // Update when selected serving type changes or reset
    useEffect(() => {
        if (reset) {
            loadServing(servingIndex, 1, false);
            setReset(false);
            setSync(false);
        } else if (sync) {
            // Keep the current scaling when switching serving types
            const currCals = parseFloat(currServing?.calories || '0');
            loadServing(servingIndex, currCals, true);
        } else {
            const baseAmount = parseFloat(food?.servings.serving[servingIndex].serving_description.split(' ')[0] || '0');
            loadServing(servingIndex, baseAmount, false);
        }

    }, [servingIndex, reset]);

    // Calculate scale factor when serving size changes
    const handleServingSizeChange = (value: string) => {
        setSync(true);
        const factor = parseFloat(value);

        if (!isNaN(factor) && factor >= 0) {
            loadServing(servingIndex, factor, false);
        } else {
            loadServing(servingIndex, 0, false);
        }
    };

    // Calculate scale factor when calories changes
    const handleCalorieChange = (value: string) => {
        setSync(true);
        const calories = parseFloat(value);

        if (!isNaN(calories) && calories >= 0) {
            loadServing(servingIndex, calories, true);
        } else {
            loadServing(servingIndex, 0, true);
        }
    };

    // Early return if food or currServing is null
    if (!food || !currServing) {
        return (
            <SafeAreaView className="flex-1 bg-white mt-10 p-4">
                <Text className="text-2xl text-center">Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white mt-10 p-4">
            <ScrollView>
                <Text className="text-5xl text-center font-bold">{food.food_name}</Text>
                <Text className="text-3xl text-center mb-6">{food.brand_name || "Generic"}</Text>
                <NutritionLabel
                    currServing={currServing}
                />
            </ScrollView>
            <View>
                <View className='flex-row justify-between mt-2'>
                    <Text className='text-3xl font-bold py-1'>Serving Type:</Text>
                    <Pressable className="bg-gray-500 rounded px-4 justify-center active:bg-gray-600" onPress={() => setReset(true)}>
                        <Text className="text-white text-xl font-bold">Reset</Text>
                    </Pressable>
                </View>
                <View className="border-b border-black my-2" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="">
                    {food.servings.serving.map((serving, index) => (
                        <Pressable
                            key={index}
                            className={`mr-2 p-3 border border-gray-300 rounded ${servingIndex === index ? 'bg-green-700' : 'bg-gray-500'}`}
                            onPress={() => setServingIndex(index)}
                        >
                            <Text className='text-2xl font-bold text-white'>{`${serving.serving_description.replace(/^\d+.\d+|\d+\s*/, '')}`}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
            <View className="border-b border-black my-2" />
            <View className='bg-green-700 rounded-xl p-3 mt-2'>
                <View className="flex-row items-center justify-center">
                    <View className="flex-row items-center">
                        <TextInput
                            className="bg-white text-2xl rounded px-2 py-1"
                            keyboardType="numeric"
                            defaultValue={currServing.amount}
                            onSubmitEditing={(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) =>
                                handleServingSizeChange(e.nativeEvent.text)}
                        />
                        <Text className="ml-2 text-2xl text-white font-bold">{currServing.unit}</Text>
                    </View>
                    <View className="ml-10 flex-row items-center">
                        <TextInput
                            className="bg-white text-2xl rounded px-2 py-1"
                            keyboardType="numeric"
                            defaultValue={currServing.calories}
                            onSubmitEditing={(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) =>
                                handleCalorieChange(e.nativeEvent.text)}
                        />
                        <Text className="ml-2 text-2xl text-white font-bold">cal</Text>
                    </View>
                    <View className="ml-10 flex-row items-center bg-white rounded px-4 py-1">
                        <Pressable onPress={() => console.log("Temp")}>
                            <Text className="text-2xl font-bold">Save</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const NutritionLabel: React.FC<{ currServing: Serving; }> = ({ currServing }) => {
    return (
        <View className="border-2 border-black p-3 mb-4 bg-gray-100">
            <Text className="ml-1 text-3xl text-left font-extrabold">
                Nutrition Facts
            </Text>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between mt-1 mb-1">
                <Text className="ml-1 flex-3 font-semibold text-xl">
                    Serving Size
                </Text>
                <Text className="mr-1 flex-1 text-right font-semibold text-xl">
                    {currServing.amount} {currServing.unit}
                </Text>
                <Text className="mr-1 text-right font-semibold text-xl">
                    {currServing.unit === "g" || currServing.unit === "oz" ? ""
                        : `(${currServing.metric_serving_amount}${currServing.metric_serving_unit})`}
                </Text>
            </View>
            <View className="border-b-8 border-black"></View>
            <View className="flex-row justify-between mt-2 mb-1">
                <Text className="ml-1 flex-3 font-extrabold text-3xl">
                    Calories
                </Text>
                <Text className="mr-1 flex-1 text-right font-extrabold text-3xl">
                    {currServing.calories}
                </Text>
            </View>
            <View className="border-b-4 border-black"></View>
            <View className="flex-row justify-between mt-1">
                <Text className="ml-1 flex-3 font-extrabold text-lg">
                    Total Fat
                </Text>
                <Text className="mr-1 flex-1 text-right font-extrabold text-xl">
                    {currServing.fat == "N/A" ? "N/A" : `${currServing.fat}g`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-8 flex-3 text-lg">
                    Saturated Fat
                </Text>
                <Text className="mr-1 flex-1 text-right text-xl">
                    {currServing.saturated_fat == "N/A" ? "N/A" : `${currServing.saturated_fat}g`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-8 flex-3 text-lg">
                    Trans Fat
                </Text>
                <Text className="mr-1 flex-1 text-right text-xl">
                    {currServing.trans_fat == "N/A" ? "N/A" : `${currServing.trans_fat}g`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-1 flex-3 font-extrabold text-lg">
                    Cholesterol
                </Text>
                <Text className="mr-1 flex-1 text-right font-extrabold text-xl">
                    {currServing.cholesterol == "N/A" ? "N/A" : `${currServing.cholesterol}mg`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-1 flex-3 font-extrabold text-lg">
                    Sodium
                </Text>
                <Text className="mr-1 flex-1 text-right font-extrabold text-xl">
                    {currServing.sodium == "N/A" ? "N/A" : `${currServing.sodium}mg`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-1 flex-3 font-extrabold text-lg">
                    Total Carbohydrate
                </Text>
                <Text className="mr-1 flex-1 text-right font-extrabold text-xl">
                    {currServing.carbohydrate == "N/A" ? "N/A" : `${currServing.carbohydrate}g`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-8 flex-3 text-lg">
                    Dietary Fiber
                </Text>
                <Text className="mr-1 flex-1 text-right text-xl">
                    {currServing.fiber == "N/A" ? "N/A" : `${currServing.fiber}g`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-8 flex-3 text-lg">
                    Total Sugars
                </Text>
                <Text className="mr-1 flex-1 text-right text-xl">
                    {currServing.sugar == "N/A" ? "N/A" : `${currServing.sugar}g`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-1 flex-3 font-extrabold text-lg">
                    Protein
                </Text>
                <Text className="mr-1 flex-1 text-right font-extrabold text-xl">
                    {currServing.protein == "N/A" ? "N/A" : `${currServing.protein}g`}
                </Text>
            </View>
            <View className="border-b-8 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-1 flex-3 text-lg">
                    Vitamin A
                </Text>
                <Text className="mr-1 flex-1 text-right text-xl">
                    {currServing.vitamin_a == "N/A" ? "N/A" : `${currServing.vitamin_a}mcg`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-1 flex-3 text-lg">
                    Vitamin C
                </Text>
                <Text className="mr-1 flex-1 text-right text-xl">
                    {currServing.vitamin_c == "N/A" ? "N/A" : `${currServing.vitamin_c}mg`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-1 flex-3 text-lg">
                    Calcium
                </Text>
                <Text className="mr-1 flex-1 text-right text-xl">
                    {currServing.calcium == "N/A" ? "N/A" : `${currServing.calcium}mg`}
                </Text>
            </View>
            <View className="border-b-2 border-black"></View>
            <View className="flex-row justify-between">
                <Text className="ml-1 flex-3 text-lg">
                    Iron
                </Text>
                <Text className="mr-1 flex-1 text-right text-xl">
                    {currServing.iron == "N/A" ? "N/A" : `${currServing.iron}mg`}
                </Text>
            </View>
            <View className="border-b-4 border-black"></View>
        </View>
    );
};

export default Nutrition;