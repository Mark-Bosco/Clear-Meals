import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, TextInput, NativeSyntheticEvent, TextInputSubmitEditingEventData } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getFood } from "../../backend/api";
import { FoodItem } from '../types';

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

interface Serving extends FoodItem {
    metric_serving_amount: string;
    metric_serving_unit: string;
    serving_description: string;
    measurement_description: string;
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

    // Scale factor for serving size
    const [scaleFactor, setScaleFactor] = useState(1);
    // Reciprocal to ensure proper scaling
    const [reciprocal, setReciprocal] = useState(1);

    // Scaled serving size
    const [scaledServingSize, setScaledServingSize] = useState('');
    // Scaled calories
    const [scaledCalories, setScaledCalories] = useState('');

    // Flag for when a measurement is edited to start syncing
    const [sync, setSync] = useState(false);
    // Reset the calorie and serving size inputs back to default
    const [reset, setReset] = useState(false);

    // Fetch food data
    // Add default metric serving sizes
    // Load default serving
    // Update current serving when calories or serving size changes

    // Fetch food data on mount and create default metric serving sizes
    useEffect(() => {
        const fetchData = async () => {
            if (!foodId) return;
            try {
                const servings = await getFood(foodId);
                let updatedServings = addMetricServings(servings.food);
                setFood(updatedServings);
                // Set the current serving to the first serving in the array
                loadServing(0);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [foodId]);


    // Create default metric serving sizes, if they don't exist, for the selected food item
    const addMetricServings = (food: Food) => {
        // Make a deep copy of the servings array to avoid direct state mutation
        let newServings = food.servings.serving.map(serving => ({ ...serving }));

        const firstServing = newServings[0];
        const metricAmount = parseFloat(firstServing.metric_serving_amount);

        if (!(firstServing.metric_serving_unit)) {
            throw new Error('Missing metric serving unit for food item');
        }

        const metricUnit = firstServing.metric_serving_unit.toLowerCase();

        const hasOz = newServings.some(s => s.serving_description.split(' ')[1]?.replace(/,$/g, '') === 'oz');
        const hasGram = newServings.some(s => s.serving_description.split(' ')[1]?.replace(/,$/g, '') === 'g');


        if (metricUnit === 'oz' || metricUnit === 'g') {
            if (!hasOz) {
                // Add oz serving
                const ozAmount = metricUnit === 'oz' ? metricAmount : gramsToOz(metricAmount);
                const ozServing: Serving = {
                    ...firstServing,
                    serving_description: `${ozAmount.toFixed(2)} oz`,
                    measurement_description: 'oz',
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
                    measurement_description: 'g',
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

    // Loading state
    if (!food) return <SafeAreaView><Text>Loading...</Text></SafeAreaView>;

    // Load a serving to display
    const loadServing = (index: number) => {
        const serving = food.servings.serving[index];
        const currServing: Serving = {
            food_id: food.food_id,
            food_name: food.food_name,
            brand_name: food.brand_name,
            measurement_description: serving.measurement_description,
            serving_description: serving.serving_description,
            metric_serving_amount: serving.metric_serving_amount,
            metric_serving_unit: serving.metric_serving_unit,
            calories: (parseFloat(serving.calories) * scaleFactor).toString(),
            fat: (parseFloat(serving.fat ?? 'N/A') * scaleFactor).toString(),
            carbohydrates: (parseFloat(serving.carbohydrates ?? 'N/A') * scaleFactor).toString(),
            protein: (parseFloat(serving.protein ?? 'N/A') * scaleFactor).toString(),
            saturated_fat: (parseFloat(serving.saturated_fat ?? 'N/A') * scaleFactor).toString(),
            trans_fat: (parseFloat(serving.trans_fat ?? 'N/A') * scaleFactor).toString(),
            cholesterol: (parseFloat(serving.cholesterol ?? 'N/A') * scaleFactor).toString(),
            sodium: (parseFloat(serving.sodium ?? 'N/A') * scaleFactor).toString(),
            fiber: (parseFloat(serving.fiber ?? 'N/A') * scaleFactor).toString(),
            sugar: (parseFloat(serving.sugar ?? 'N/A') * scaleFactor).toString(),
            vitamin_a: (parseFloat(serving.vitamin_a ?? 'N/A') * scaleFactor).toString(),
            vitamin_c: (parseFloat(serving.vitamin_c ?? 'N/A') * scaleFactor).toString(),
            iron: (parseFloat(serving.iron ?? 'N/A') * scaleFactor).toString(),
            calcium: (parseFloat(serving.calcium ?? 'N/A') * scaleFactor).toString(),
        }
        setCurrServing(currServing);
    }

    // Update calories when selected serving type changes or reset
    useEffect(() => {
        const newServing = food.servings.serving[servingIndex];
        const newServingSize = newServing.serving_description.split(' ')[0];

        let newScaledServingSize: string = newServingSize;
        let newReciprocal: number = 1 / parseFloat(newServingSize);

        // If serving size is a fraction convert it to a decimal 
        if (newServingSize.includes('/')) {
            const [numerator, denominator] = newServingSize.split('/').map(Number);
            const decimalServingSize = (numerator / denominator).toFixed(1);

            newScaledServingSize = decimalServingSize;
            newReciprocal = (1 / parseFloat(decimalServingSize));
        }

        setScaledServingSize(parseFloat(newScaledServingSize) > 0 ? newScaledServingSize : '0');
        setReciprocal(newReciprocal);
        setScaleFactor(1);

        if (sync && !reset) {
            handleCalorieChange(scaledCalories, newReciprocal);
        } else {
            setScaledCalories(newServing.calories || '0');
            setReset(false);
            setSync(false);
        }

    }, [servingIndex, reset]);


    // Calculate scale factor when serving size changes
    const handleServingSizeChange = (value: string) => {
        setSync(true);
        const factor = parseFloat(value);

        if (!isNaN(factor) && factor >= 0) {
            const newScaleFactor = factor * reciprocal;
            // Update serving size number in input box
            setScaledServingSize(value);
            // Update scale factor
            setScaleFactor(newScaleFactor);
            // Update calories input
            const baseCalories = food.servings.serving[servingIndex].calories || '0';
            setScaledCalories((newScaleFactor * parseFloat(baseCalories)).toFixed(0));

        } else if (value === '.') {
            setScaledServingSize('0.');
            setScaleFactor(0);
            setScaledCalories('0');
        } else if (value === '') {
            setScaledServingSize('');
            setScaleFactor(0);
            setScaledCalories('0');
        } else {
            // Invalid input, revert to previous valid state
            setScaledServingSize(prevSize => prevSize);
        }

    };

    // Calculate scale factor when calories changes
    const handleCalorieChange = (value: string, newReciprocal?: number) => {
        setSync(true);
        const calories = parseFloat(value);

        if (!isNaN(calories) && calories >= 0) {
            setScaledCalories(value);
            // Avoid division by zero
            const baseCalories = parseInt(food.servings.serving[servingIndex].calories || '0');
            if (baseCalories > 0) {
                // Determine scale factor
                const newScaleFactor = calories / baseCalories;
                setScaleFactor(newScaleFactor);
                // Use the new reciprocal for sync
                const currentReciprocal = newReciprocal !== undefined ? newReciprocal : reciprocal;
                // Update serving size input
                const newScaledServingSize = (newScaleFactor / currentReciprocal).toFixed(2);
                setScaledServingSize(newScaledServingSize);
            }

        } else if (value === '.') {
            setScaledCalories(value);
            setScaleFactor(0);
            setScaledServingSize('0');
        } else if (value === '') {
            setScaledCalories('');
            setScaleFactor(0);
            setScaledServingSize('0');
        } else {
            setScaledCalories(prevCalories => {
                return prevCalories;
            });
        }


    };

    const handleSave = () => {
        // Save the new serving size and calories
    };


    if (!currServing) return <SafeAreaView><Text>Loading...</Text></SafeAreaView>;

    const unit = food.servings.serving[servingIndex].serving_description.split(' ')[1]?.replace(/,$/g, '');

    return (
        <SafeAreaView className="flex-1 bg-white mt-10 p-4">
            <ScrollView>
                <Text className="text-5xl text-center font-bold">{currServing.food_name}</Text>
                <Text className="text-3xl text-center mb-6">{currServing.brand_name || "Generic"}</Text>
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
                            <Text className='text-2xl font-bold text-white'>{`${serving.serving_description.replace(/^\d+.\d+|\d+\s*/, '').replace(/,$/g, '')}`}</Text>
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
                            defaultValue={scaledServingSize}
                            onSubmitEditing={(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) =>
                                handleServingSizeChange(e.nativeEvent.text)}
                        />
                        <Text className="ml-2 text-2xl text-white font-bold">{unit}</Text>
                    </View>
                    <View className="ml-10 flex-row items-center">
                        <TextInput
                            className="bg-white text-2xl rounded px-2 py-1"
                            keyboardType="numeric"
                            defaultValue={scaledCalories}
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
        <View>
            {/* Display nutrition information here */}
            <Text>Calories: {currServing.calories}</Text>
            <Text>Fat: {currServing.fat}g</Text>
            <Text>Carbs: {currServing.carbohydrates}g</Text>
            <Text>Protein: {currServing.protein}g</Text>
            {/* Add more nutritional information as needed */}
        </View>
    );
};

export default Nutrition;