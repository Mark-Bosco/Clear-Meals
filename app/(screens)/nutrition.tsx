import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getFood } from "../../backend/api";

const ozToGrams = (oz: number) => oz * 28.34952;
const gramsToOz = (g: number) => g / 28.34952;

// High-level food details
interface SelectedFood {
    food_name: string;
    brand_name?: string;
    servings: {
        serving: NutritionFacts[];
    };
}

// Low-level food details (nutrional data)
interface NutritionFacts {
    serving_description: string;
    measurement_description: string;
    metric_serving_amount: string;
    metric_serving_unit: string;
    calories?: string;
    fat?: string;
    saturated_fat?: string;
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

const NutritionLabel: React.FC<{ nutritionFacts: NutritionFacts; scaleFactor: number; scaledServingSize: number; scaledCalories: number; }> = ({ nutritionFacts, scaleFactor, scaledServingSize, scaledCalories }) => {
    // Scale nutrition facts by scale factor (custom serving size)
    const scaledNutritionFacts: Record<string, number | undefined> = Object.fromEntries(
        Object.entries(nutritionFacts).map(([key, value]) => [key, value ? parseFloat(value) * scaleFactor : undefined])
    );

    // Format value to handle undefined and decimals
    const formatValue = (value: number | undefined, decimals: number = 1): string => {
        if (value === undefined) return 'N/A';
        return decimals === 0 ? Math.round(value).toString() : value.toFixed(decimals);
    };

    const formattedMetricServing = `(${formatValue(scaledNutritionFacts.metric_serving_amount, 0)} ${nutritionFacts.metric_serving_unit})`;
    const isMetricServing = nutritionFacts.measurement_description === nutritionFacts.metric_serving_unit;

    return (
        <View className="border border-black p-4 mb-5 bg-gray-100 rounded-md">
            <Text className="text-4xl text-left font-bold mb-1">Nutrition Facts</Text>
            <View className="border-b border-black my-1" />
            <NutritionRow
                label="Serving Size"
                value={`${scaledServingSize || ''} ${nutritionFacts.serving_description.split(' ')[1]?.replace(/,$/g, '')}`}
                unit={isMetricServing ? "" : formattedMetricServing}
                bold={true}
            />
            <View className="border-b border-black my-1" />
            <NutritionRow label="Calories" value={scaledCalories} unit="" bold={true} largerFont={true} />
            <View className="border-b border-black my-1" />
            <NutritionRow label="Total Fat" value={formatValue(scaledNutritionFacts.fat)} unit="g" bold={true} />
            <NutritionRow label="  Saturated Fat" value={formatValue(scaledNutritionFacts.saturated_fat)} unit="g" indent />
            <NutritionRow label="  Trans Fat" value="0" unit="g" indent />
            <NutritionRow label="Cholesterol" value={formatValue(scaledNutritionFacts.cholesterol, 0)} unit="mg" bold={true} />
            <NutritionRow label="Sodium" value={formatValue(scaledNutritionFacts.sodium, 0)} unit="mg" bold={true} />
            <NutritionRow label="Total Carbohydrate" value={formatValue(scaledNutritionFacts.carbohydrate)} unit="g" bold={true} />
            <NutritionRow label="  Dietary Fiber" value={formatValue(scaledNutritionFacts.fiber)} unit="g" indent />
            <NutritionRow label="  Sugars" value={formatValue(scaledNutritionFacts.sugar)} unit="g" indent />
            <NutritionRow label="Protein" value={formatValue(scaledNutritionFacts.protein)} unit="g" bold={true} />
            <View className="border-b border-black my-1" />
            <NutritionRow label="Vitamin A" value={formatValue(scaledNutritionFacts.vitamin_a, 0)} unit="mcg" />
            <NutritionRow label="Vitamin C" value={formatValue(scaledNutritionFacts.vitamin_c)} unit="mg" />
            <NutritionRow label="Calcium" value={formatValue(scaledNutritionFacts.calcium, 0)} unit="mg" />
            <NutritionRow label="Iron" value={formatValue(scaledNutritionFacts.iron)} unit="mg" />
            <View className="border-b border-black my-1" />
            <Text className="text-sm text-gray-500">Provided by FatSecret</Text>
        </View>
    );
};

const NutritionRow: React.FC<{
    label: string;
    value: string | number;
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

// Nutrition screen component
const Nutrition: React.FC = () => {
    // Get food ID from URL params
    const { foodId } = useLocalSearchParams<{ foodId: string }>();
    // Food item selected from search results
    const [selectedFood, setSelectedFood] = useState<SelectedFood | null>(null);
    // Selected serving type index
    const [selectedServingIndex, setSelectedServing] = useState(0);
    // Scale factor for serving size
    const [scaleFactor, setScaleFactor] = useState(1);
    // Scaled serving size
    const [scaledServingSize, setScaledServingSize] = useState('');
    // Base calories
    const [baseCalories, setBaseCalories] = useState('0');
    // Scaled calories
    const [scaledCalories, setScaledCalories] = useState('');
    // Reciprocal for fractions
    const [reciprocal, setReciprocal] = useState(1);
    // Flag for when a measurement is edited to start syncing
    const [sync, setSync] = useState(false);
    // Reset the calorie and serving size inputs back to default
    const [reset, setReset] = useState(false);

    // Fetch food data on mount, initalize scaled calories
    useEffect(() => {
        const fetchData = async () => {
            if (!foodId) return;
            try {
                const result = await getFood(foodId);
                let foodWithDefaultServings = createDefaultMetricServingSizes(result.food);
                setSelectedFood(foodWithDefaultServings);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [foodId]);


    const createDefaultMetricServingSizes = (food: SelectedFood) => {
        // Make a deep copy of the servings array to avoid direct state mutation
        let newServings = food.servings.serving.map(serving => ({ ...serving }));

        const firstServing = newServings[0];
        const metricAmount = parseFloat(firstServing.metric_serving_amount);
        // BUG HERE: metricUnit may not be defined *****************
        const metricUnit = firstServing.metric_serving_unit.toLowerCase();

        const hasOz = newServings.some(s => s.serving_description.split(' ')[1]?.replace(/,$/g, '') === 'oz');
        const hasGram = newServings.some(s => s.serving_description.split(' ')[1]?.replace(/,$/g, '') === 'g');


        if (metricUnit === 'oz' || metricUnit === 'g') {
            if (!hasOz) {
                // Add oz serving
                const ozAmount = metricUnit === 'oz' ? metricAmount : gramsToOz(metricAmount);
                const ozServing: NutritionFacts = {
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
                const gServing: NutritionFacts = {
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

    // Update default editable serving size and calories when selected serving changes
    useEffect(() => {
        if (selectedFood) {

            const serving = selectedFood.servings.serving[selectedServingIndex];
            const [initialServingSize] = serving.serving_description.split(' ');

            let newScaledServingSize: string = initialServingSize;
            let newReciprocal: number = 1 / parseFloat(initialServingSize);

            // If serving size is a fraction convert it to a decimal 
            if (initialServingSize.includes('/')) {
                const [numerator, denominator] = initialServingSize.split('/').map(Number);
                const decimal = (numerator / denominator).toFixed(1);

                newScaledServingSize = decimal;
                newReciprocal = (1 / parseFloat(decimal));
            }

            setBaseCalories(serving.calories || '0');
            setScaledServingSize(parseFloat(newScaledServingSize) > 0 ? newScaledServingSize : '0');
            setReciprocal(newReciprocal);
            setScaleFactor(1);

            if (sync && !reset) {
                handleCalorieChange(scaledCalories, newReciprocal);
            } else {
                setScaledCalories(serving.calories || '0');
                if (reset) {
                    setReset(false);
                    setSync(false);
                }
            }
        }
    }, [selectedFood, selectedServingIndex, reset]);

    // Update scale factor when manual serving size changes
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
    const handleCalorieChange = (value: string, newReciprocal?: number) => {
        setSync(true);

        const calories = parseFloat(value);

        const selectedServing = selectedFood?.servings.serving[selectedServingIndex];

        if (!isNaN(calories) && calories >= 0) {
            setScaledCalories(value);

            // Avoid division by zero
            const originalCalories = parseFloat(selectedServing?.calories || '0');

            if (originalCalories > 0) {
                // Determine scale factor
                const newScaleFactor = calories / originalCalories;

                setScaleFactor(newScaleFactor);

                // Use the new reciprocal if provided, otherwise use the current state
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


    // Loading state
    if (!selectedFood) return <SafeAreaView><Text>Loading...</Text></SafeAreaView>;

    // Get selected serving type
    const servings = selectedFood.servings.serving;

    const unit = servings[selectedServingIndex].serving_description.split(' ')[1]?.replace(/,$/g, '');

    return (
        <SafeAreaView className="flex-1 bg-white mt-10 p-4">
            <ScrollView>
                <Text className="text-5xl text-center font-bold">{selectedFood.food_name}</Text>
                <Text className="text-3xl text-center mb-6">{selectedFood.brand_name || "Generic"}</Text>
                <NutritionLabel
                    nutritionFacts={servings[selectedServingIndex]}
                    scaleFactor={scaleFactor}
                    scaledServingSize={parseFloat(scaledServingSize)}
                    scaledCalories={parseFloat(scaledCalories)}
                />
            </ScrollView>
            <View>
                <Text className='text-3xl font-bold'>Serving Type:</Text>
                <View className="border-b border-black my-2" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="">
                    {servings.map((serving, index) => (
                        <Pressable
                            key={index}
                            className={`mr-2 p-2 border border-gray-300 rounded ${selectedServingIndex === index ? 'bg-green-700' : 'bg-gray-500'}`}
                            onPress={() => setSelectedServing(index)}
                        >
                            <Text className='text-lg text-white'>{`${serving.serving_description.replace(/^\d+\/\d+|\d+\s*/, '').replace(/,$/g, '')}`}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
            <View>
                <View className="border-b border-black my-2" />
                <View className="flex-row items-center justify-center mb-2">
                    <View className="flex-row items-center">
                        <TextInput
                            className="border border-gray-300 text-xl rounded px-2 py-1"
                            keyboardType="numeric"
                            value={scaledServingSize}
                            onChangeText={handleServingSizeChange}
                        />
                        <Text className="ml-2 text-xl font-bold">{unit}</Text>
                    </View>
                    <View className="ml-10 flex-row items-center">
                        <TextInput
                            className="border border-gray-300 text-xl rounded px-2 py-1"
                            keyboardType="numeric"
                            value={scaledCalories}
                            onChangeText={handleCalorieChange}
                        />
                        <Text className="ml-2 text-xl font-bold">cal</Text>
                    </View>
                </View>
            </View>
            <View>
                <Pressable className="bg-green-700 p-2 rounded mt-2" onPress={() => setReset(true)}>
                    <Text className="text-white text-lg font-bold text-center">Reset</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default Nutrition;