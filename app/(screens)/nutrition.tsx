import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Pressable, TextInput, NativeSyntheticEvent, TextInputSubmitEditingEventData } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getFood } from "../../backend/api";
import { Food, FoodListItem, MealType, Serving } from "../../types/types";
import { useFoodList } from '../../contexts/FoodListContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveFood } from '../../backend/firestore';
import NutritionLabel from '../../components/NutritionLabel'

const ozToGrams = (oz: number) => oz * 28.34952;
const gramsToOz = (g: number) => g / 28.34952;

// Nutrition screen component
const Nutrition: React.FC = () => {
    // Food ID from URL params
    const { foodId } = useLocalSearchParams<{ foodId: string }>();
    // Calorie override used for loading edited food list items
    const { calorieOverride } = useLocalSearchParams<{ calorieOverride: string }>();
    const { foodIndex } = useLocalSearchParams<{ foodIndex: string }>();
    const { mealType } = useLocalSearchParams<{ mealType: MealType }>();
    const { dateString } = useLocalSearchParams<{ dateString: string }>();
    const date = ((dateString ? new Date(dateString) : new Date())).toISOString().split('T')[0]; // Convert the date to a string
    const { user } = useAuth();
    const [override, setOverride] = useState(false);

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
    const { addFood, replaceFood } = useFoodList();
    // Disable save button while editing serving size or calories
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Create default metric serving sizes, if they don't exist, for the selected food item
    const addMetricServings = (food: Food) => {
        // Make a deep copy of the servings array to avoid direct state mutation
        let newServings = food.servings.serving.map(serving => ({ ...serving }));

        const firstServing = newServings[0];

        // Bug fix for missing metric
        let metricAmount;
        if (firstServing.metric_serving_amount) {
            metricAmount = parseFloat(firstServing.metric_serving_amount);
        } else {
            return {
                ...food,
                servings: { serving: newServings }
            };
        }

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
                if (calorieOverride)
                    setOverride(true)
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
            metric_serving_amount: serving.metric_serving_amount ? (parseFloat(serving.metric_serving_amount) * scaleFactor).toFixed(1) : 'N/A',
            metric_serving_unit: serving.metric_serving_unit || 'N/A',
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
            // Apply calorie override if editing a list item
            if (calorieOverride && override) {
                loadServing(servingIndex, parseInt(calorieOverride), true);
                setOverride(false)
                setSync(true);
            } else {
                loadServing(servingIndex, 1, false);
                setSync(false);
            }
            setReset(false);
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

    const handleSave = async () => {
        if (isSaving)
            return;

        setIsSaving(true);

        if (food && currServing && user) {
            const foodListItem: FoodListItem = {
                food_id: food.food_id,
                food_name: food.food_name,
                brand_name: food.brand_name || "Generic",
                calories: currServing.calories,
                fat: currServing.fat ?? 'N/A',
                saturated_fat: currServing.saturated_fat || 'N/A',
                trans_fat: currServing.trans_fat || 'N/A',
                cholesterol: currServing.cholesterol || 'N/A',
                sodium: currServing.sodium || 'N/A',
                carbohydrate: currServing.carbohydrate || 'N/A',
                fiber: currServing.fiber || 'N/A',
                sugar: currServing.sugar || 'N/A',
                protein: currServing.protein || 'N/A',
                vitamin_a: currServing.vitamin_a || 'N/A',
                vitamin_c: currServing.vitamin_c || 'N/A',
                calcium: currServing.calcium || 'N/A',
                iron: currServing.iron || 'N/A',
            };

            // If updating a saved food item
            if (mealType) {
                try {
                    await saveFood(user.uid, date, mealType, foodListItem, foodIndex || '-1');
                } catch (error) {
                    console.log(mealType);
                    console.log(user.uid);
                    console.log(date);
                    console.log(foodListItem);
                    console.log(foodIndex);
                    console.error('Error updating food item in the meal:', error);
                }

                // If updating a food search list item
            } else if (foodIndex) {
                replaceFood(parseInt(foodIndex), foodListItem);

                // If adding a food item to a search list
            } else {
                addFood(foodListItem);
            }
        }
        setIsSaving(false);
        router.back();
    };


    // Early return if food or currServing is null
    if (!food || !currServing) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.foodName}>{food.food_name}</Text>
                <Text style={styles.brandName}>{food.brand_name || "Generic"}</Text>
                <NutritionLabel
                    currServing={currServing}
                />
            </ScrollView>
            <View>
                <View style={styles.servingTypeContainer}>
                    <Text style={styles.servingTypeText}>Serving Type:</Text>
                    <Pressable onPress={() => setReset(true)}
                        style={({ pressed }) => [
                            styles.resetButton,
                            pressed && styles.pressedButton
                        ]}
                    >
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </Pressable>
                </View>
                <View style={styles.divider} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servingScrollView}>
                    {food.servings.serving.map((serving, index) => (
                        <Pressable
                            key={index}
                            style={[
                                styles.servingButton,
                                servingIndex === index ? styles.activeServingButton : styles.inactiveServingButton
                            ]}
                            onPress={() => setServingIndex(index)}
                        >
                            <Text style={styles.servingButtonText}>{`${serving.serving_description.replace(/^\d+.\d+|\d+\s*/, '')}`}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
            <View style={styles.divider} />
            <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.input}
                            textAlign="center"
                            onFocus={() => setIsEditing(true)}
                            onBlur={() => setIsEditing(false)}
                            keyboardType="numeric"
                            defaultValue={currServing.amount}
                            onSubmitEditing={(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) =>
                                handleServingSizeChange(e.nativeEvent.text)}
                        />
                        <Text style={styles.inputLabel}>{currServing.unit}</Text>
                    </View>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.input}
                            textAlign="center"
                            onFocus={() => setIsEditing(true)}
                            onBlur={() => setIsEditing(false)}
                            keyboardType="numeric"
                            defaultValue={currServing.calories}
                            onSubmitEditing={(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) =>
                                handleCalorieChange(e.nativeEvent.text)}
                        />
                        <Text style={styles.inputLabel}>cal</Text>
                    </View>
                    <View style={styles.saveButtonContainer}>
                        <Pressable
                            onPress={handleSave}
                            disabled={isEditing}
                            style={({ pressed }) => [
                                styles.saveButton,
                                isEditing && styles.pressedButton,
                                pressed && styles.pressedButton
                            ]}>
                            <Text style={styles.saveButtonText}>
                                Save
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 48,
        padding: 16,
    },
    loadingText: {
        fontSize: 24,
        textAlign: 'center',
    },
    foodName: {
        fontSize: 36,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    brandName: {
        fontSize: 26,
        fontWeight: '300',
        textAlign: 'center',
        marginBottom: 24,
    },
    servingTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    servingTypeText: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingVertical: 4,
    },
    resetButton: {
        backgroundColor: '#bc2f2f',
        borderRadius: 4,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    resetButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        marginVertical: 8,
    },
    servingScrollView: {
        flexDirection: 'row',
    },
    servingButton: {
        marginRight: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 4,
    },
    activeServingButton: {
        backgroundColor: '#15803D',
    },
    inactiveServingButton: {
        backgroundColor: '#6B7280',
    },
    servingButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    inputContainer: {
        backgroundColor: '#15803D',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        backgroundColor: 'white',
        fontSize: 26,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        textAlign: 'center',
        width: 75,
    },
    inputLabel: {
        fontSize: 20,
        marginLeft: 6,
        marginRight: 8,
        color: 'white',
        fontWeight: 'bold',
    },
    saveButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 4,
        overflow: 'hidden',
    },
    saveButton: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    pressedButton: {
        opacity: .6
    },
    saveButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0c4c24',
    },
});

export default Nutrition;