import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, TextInput, NativeSyntheticEvent, TextInputSubmitEditingEventData } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getFood } from "../../backend/api";
import { raw } from 'express';

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
    measurement_description: string;
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

    // Fetch food data on mount and create default metric serving sizes
    useEffect(() => {
        const fetchData = async () => {
            if (!foodId) return;
            try {
                const servings = await getFood(foodId);
                let updatedServings = addMetricServings(servings.food);
                setFood(updatedServings);
                // Set the default serving index to the first serving in the list
                // Thought this should trigger the useEffect to update the currServing state???
                setServingIndex(0);
                // Set the default serving to the first serving in the list
                setCurrServing(updatedServings.servings.serving[0]);
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
            measurement_description: serving.measurement_description,
            serving_description: `${(parseFloat(serving.serving_description.split(' ')[0]) * scaleFactor).toFixed(2)} ${serving.serving_description.split(' ')[1]}`,
            metric_serving_amount: (parseFloat(serving.metric_serving_amount) * scaleFactor).toString(),
            metric_serving_unit: serving.metric_serving_unit,
            calories: (parseFloat(serving.calories) * scaleFactor).toFixed(0),
            fat: (parseFloat(serving.fat ?? '0') * scaleFactor).toFixed(1),
            carbohydrate: (parseFloat(serving.carbohydrate ?? '0') * scaleFactor).toFixed(1),
            protein: (parseFloat(serving.protein ?? '0') * scaleFactor).toFixed(1),
            saturated_fat: (parseFloat(serving.saturated_fat ?? '0') * scaleFactor).toFixed(1),
            trans_fat: (parseFloat(serving.trans_fat ?? '0') * scaleFactor).toFixed(1),
            cholesterol: (parseFloat(serving.cholesterol ?? '0') * scaleFactor).toFixed(1),
            sodium: (parseFloat(serving.sodium ?? '0') * scaleFactor).toFixed(1),
            fiber: (parseFloat(serving.fiber ?? '0') * scaleFactor).toFixed(1),
            sugar: (parseFloat(serving.sugar ?? '0') * scaleFactor).toFixed(1),
            vitamin_a: (parseFloat(serving.vitamin_a ?? '0') * scaleFactor).toFixed(1),
            vitamin_c: (parseFloat(serving.vitamin_c ?? '0') * scaleFactor).toFixed(1),
            iron: (parseFloat(serving.iron ?? '0') * scaleFactor).toFixed(1),
            calcium: (parseFloat(serving.calcium ?? '0') * scaleFactor).toFixed(1),
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

    const unit = food.servings.serving[servingIndex].serving_description.split(' ')[1]?.replace(/,$/g, '');

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
                            defaultValue={currServing.serving_description.split(' ')[0]}
                            onSubmitEditing={(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) =>
                                handleServingSizeChange(e.nativeEvent.text)}
                        />
                        <Text className="ml-2 text-2xl text-white font-bold">{unit}</Text>
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

const NutritionRow: React.FC<{
    label: string;
    value: string | undefined | number;
    unit: string;
    indent?: boolean;
    bold?: boolean;
    largerFont?: boolean;
}> = ({ label, value, unit, indent, bold = false, largerFont = false }) => (
    <View className={`flex-row justify-between my-0.5 ${indent ? 'pl-5' : ''}`}>
        <Text className={`flex-3 ${bold ? 'font-bold' : ''} ${largerFont ? 'text-2xl' : ''}`}>
            {label}
        </Text>
        <Text className={`flex-1 text-right ${bold ? 'font-bold' : ''} ${largerFont ? 'text-2xl' : ''}`}>
            {value} {unit}
        </Text>
    </View>
);

const NutritionLabel: React.FC<{ currServing: Serving; }> = ({ currServing }) => {

    const formattedMetricServing = `(${(currServing.metric_serving_amount, 0)} ${currServing.metric_serving_unit})`;
    const isMetricServing = currServing.measurement_description === currServing.metric_serving_unit;

    return (
        <View className="border border-black p-4 mb-5 bg-gray-100 rounded-md">
            <Text className="text-4xl text-left font-bold mb-1">Nutrition Facts</Text>
            <View className="border-b border-black my-1" />
            <NutritionRow
                label="Serving Size"
                value={`${currServing.serving_description.split(' ')[0] || ''} ${currServing.serving_description.split(' ')[1]?.replace(/,$/g, '')}`}
                unit={isMetricServing ? "" : formattedMetricServing}
                bold={true}
            />
            <View className="border-b border-black my-1" />
            <NutritionRow label="Calories" value={currServing.calories} unit="" bold={true} largerFont={true} />
            <View className="border-b border-black my-1" />
            <NutritionRow label="Total Fat" value={(currServing.fat)} unit="g" bold={true} />
            <NutritionRow label="  Saturated Fat" value={(currServing.saturated_fat)} unit="g" indent />
            <NutritionRow label="  Trans Fat" value="0" unit="g" indent />
            <NutritionRow label="Cholesterol" value={(currServing.cholesterol, 0)} unit="mg" bold={true} />
            <NutritionRow label="Sodium" value={(currServing.sodium, 0)} unit="mg" bold={true} />
            <NutritionRow label="Total Carbohydrate" value={(currServing.carbohydrate)} unit="g" bold={true} />
            <NutritionRow label="  Dietary Fiber" value={(currServing.fiber)} unit="g" indent />
            <NutritionRow label="  Sugars" value={(currServing.sugar)} unit="g" indent />
            <NutritionRow label="Protein" value={(currServing.protein)} unit="g" bold={true} />
            <View className="border-b border-black my-1" />
            <NutritionRow label="Vitamin A" value={(currServing.vitamin_a, 0)} unit="mcg" />
            <NutritionRow label="Vitamin C" value={(currServing.vitamin_c)} unit="mg" />
            <NutritionRow label="Calcium" value={(currServing.calcium, 0)} unit="mg" />
            <NutritionRow label="Iron" value={(currServing.iron)} unit="mg" />
            <View className="border-b border-black my-1" />
            <Text className="text-sm text-gray-500">Provided by FatSecret</Text>
        </View>
    );
};

export default Nutrition;