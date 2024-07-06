import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getFood } from "../../backend/api";
import Slider from '@react-native-community/slider';

interface NutritionData {
    serving_description: string;
    calories: string;
    fat: string;
    saturated_fat: string;
    cholesterol: string;
    sodium: string;
    carbohydrate: string;
    fiber: string;
    sugar: string;
    protein: string;
    vitamin_a: string;
    vitamin_c: string;
    calcium: string;
    iron: string;
}

interface FoodData {
    food_name: string;
    servings: {
        serving: NutritionData[];
    };
}
const NutritionLabel: React.FC<{ data: NutritionData; scale: number }> = ({ data, scale }) => {
    const scaledData: Record<string, number> = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, parseFloat(value) * scale])
    );

    const [servingSize, unit] = data.serving_description.split(' ').reduce((acc, curr, index, arr) => {
        if (index === arr.length - 1) return [acc[0], curr];
        return [`${acc[0]} ${curr}`, acc[1]];
    }, ['', '']);

    const scaledServingSize = parseFloat(servingSize) * scale;

    return (
        <View className="border border-black p-4 mb-5">
            <Text className="text-2xl text-center font-bold mb-1">Nutrition Facts</Text>
            <Text className="italic mb-2">Serving Size: {scaledServingSize.toFixed(1)} {unit}</Text>
            <View className="border-b border-black my-1" />
            <NutritionRow label="Calories" value={Math.round(scaledData.calories)} unit="" />
            <View className="border-b border-black my-1" />
            <NutritionRow label="Total Fat" value={scaledData.fat.toFixed(1)} unit="g" />
            <NutritionRow label="  Saturated Fat" value={scaledData.saturated_fat.toFixed(1)} unit="g" indent />
            <NutritionRow label="  Trans Fat" value="0" unit="g" indent />
            <NutritionRow label="Cholesterol" value={Math.round(scaledData.cholesterol)} unit="mg" />
            <NutritionRow label="Sodium" value={Math.round(scaledData.sodium)} unit="mg" />
            <NutritionRow label="Total Carbohydrate" value={scaledData.carbohydrate.toFixed(1)} unit="g" />
            <NutritionRow label="  Dietary Fiber" value={scaledData.fiber.toFixed(1)} unit="g" indent />
            <NutritionRow label="  Sugars" value={scaledData.sugar.toFixed(1)} unit="g" indent />
            <NutritionRow label="Protein" value={scaledData.protein.toFixed(1)} unit="g" />
            <View className="border-b border-black my-1" />
            <NutritionRow label="Vitamin A" value={Math.round(scaledData.vitamin_a)} unit="IU" />
            <NutritionRow label="Vitamin C" value={scaledData.vitamin_c.toFixed(1)} unit="mg" />
            <NutritionRow label="Calcium" value={Math.round(scaledData.calcium)} unit="mg" />
            <NutritionRow label="Iron" value={scaledData.iron.toFixed(1)} unit="mg" />
        </View>
    );
};

const NutritionRow: React.FC<{ label: string; value: string | number; unit: string; indent?: boolean }> = ({ label, value, unit, indent }) => (
    <View className={`flex-row justify-between my-0.5 ${indent ? 'pl-5' : ''}`}>
        <Text className="flex-3">{label}</Text>
        <Text className="flex-1 text-right">{value} {unit}</Text>
    </View>
);

const Nutrition: React.FC = () => {
    const { foodId } = useLocalSearchParams<{ foodId: string }>();
    const [data, setData] = useState<FoodData | null>(null);
    const [selectedServing, setSelectedServing] = useState(0);
    const [scale, setScale] = useState(1);
    const [manualScale, setManualScale] = useState('1');

    useEffect(() => {
        const fetchData = async () => {
            if (!foodId) return;
            try {
                const result = await getFood(foodId);
                setData(result.food);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [foodId]);

    const handleManualScaleChange = (value: string) => {
        setManualScale(value);
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
            setScale(numValue);
        }
    };

    if (!data) return <SafeAreaView><Text>Loading...</Text></SafeAreaView>;

    const servings = data.servings.serving;

    return (
        <SafeAreaView className="flex-1 bg-white p-4">
            <ScrollView>
                <Text className="text-2xl font-bold mb-4">{data.food_name}</Text>
                <NutritionLabel data={servings[selectedServing]} scale={scale} />
            </ScrollView>
            <View className="mt-5">
                <Text>Serving Type:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    {servings.map((serving, index) => (
                        <Pressable
                            key={index}
                            className={`mr-2 p-2 border border-gray-300 rounded ${selectedServing === index ? 'bg-blue-200' : ''}`}
                            onPress={() => setSelectedServing(index)}
                        >
                            <Text>{serving.serving_description}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
                <View className="flex-row items-center justify-between mb-2">
                    <Text>Scale: {scale.toFixed(2)}x</Text>
                    <View className="flex-row items-center">
                        <Text>Manual Scale: </Text>
                        <TextInput
                            className="border border-gray-300 rounded px-2 py-1 w-20"
                            keyboardType="numeric"
                            value={manualScale}
                            onChangeText={handleManualScaleChange}
                        />
                    </View>
                </View>
                <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0.5}
                    maximumValue={5}
                    step={0.1}
                    value={scale}
                    onValueChange={(value: number) => {
                        setScale(value);
                        setManualScale(value.toFixed(2));
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

export default Nutrition;