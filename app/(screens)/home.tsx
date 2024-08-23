import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../(auth)/AuthContext';
import { deleteFoodFromMeal, fetchDailyLog } from '../firestoreService';
import { DailyLog, Meal, MealType } from '../types';
import { format } from 'date-fns';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNutrients, setShowNutrients] = useState(false);
  const [showMealMenu, setShowMealMenu] = useState(false);
  const { date } = useLocalSearchParams<{ date: string }>();


  const loadDailyLog = useCallback(async () => {
    if (user && user.uid) {
      try {
        setLoading(true);
        const logDate = date || new Date().toISOString().split('T')[0];
        const log = await fetchDailyLog(user.uid, logDate);
        setDailyLog(log);
      } catch (error) {
        console.error('Error loading daily log:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user, date]);


  // Refresh daily log when naviagting to home screen
  useFocusEffect(
    useCallback(() => {
      setShowMealMenu(false);
      loadDailyLog();
    }, [loadDailyLog])
  );

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteFood = async (mealType: MealType, foodId: string) => {
    if (user && dailyLog) {
      try {
        await deleteFoodFromMeal(user.uid, dailyLog.date, mealType, foodId);
        // Refresh the daily log after deletion
        loadDailyLog();
      } catch (error) {
        console.error('Error deleting food item:', error);
        Alert.alert('Error', 'Failed to delete food item. Please try again.');
      }
    }
  };

  const renderRightActions = (mealType: MealType, foodId: string) => {
    return (
      <Pressable
        className="bg-red-500 justify-center items-center w-20 h-15 rounded-xl ml-2"
        onPress={() => handleDeleteFood(mealType, foodId)}
      >
        <Text className="text-white font-bold">Delete</Text>
      </Pressable>
    );
  };

  const toggleNutrients = () => {
    setShowNutrients(!showNutrients);
  };

  const toggleMealMenu = () => {
    setShowMealMenu(!showMealMenu);
  };

  const totalCals = Object.values(dailyLog?.meals || {}).reduce((sum, meal) => {
    // Ensure calories are treated as numbers
    return sum + (meal.meal_calories || 0);
  }, 0);

  const calculateTotalNutrients = () => {
    if (!dailyLog) return null;

    const totals = {
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
      sodium: 0,
      fiber: 0,
      sugar: 0,
      cholesterol: 0,
      saturated_fat: 0,
      trans_fat: 0,
      vitamin_a: 0,
      vitamin_c: 0,
      calcium: 0,
      iron: 0,
    };

    Object.values(dailyLog.meals).forEach((meal) => {
      totals.calories += meal.meal_calories || 0;
      totals.fat += meal.meal_fat || 0;
      totals.carbs += meal.meal_carbs || 0;
      totals.protein += meal.meal_protein || 0;
      totals.sodium += meal.meal_sodium || 0;
      totals.fiber += meal.meal_fiber || 0;
      totals.sugar += meal.meal_sugar || 0;
      totals.cholesterol += meal.meal_cholesterol || 0;
      totals.saturated_fat += meal.meal_saturated_fat || 0;
      totals.trans_fat += meal.meal_trans_fat || 0;
      totals.vitamin_a += meal.meal_vitamin_a || 0;
      totals.vitamin_c += meal.meal_vitamin_c || 0;
      totals.calcium += meal.meal_calcium || 0;
      totals.iron += meal.meal_iron || 0;
    });

    return totals;
  };

  const totalNutrients = calculateTotalNutrients();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white mt-10">
        <View className="px-4 py-2 flex-row justify-between items-center">
          <Pressable onPress={() => router.push('/history')}>
            <Ionicons name="calendar-clear-outline" size={36} color="gray" />
          </Pressable>
          <Text className="text-3xl text-gray-500 font-semibold">
            {format(date ? new Date(date) : new Date(), "MMMM do")}
          </Text>
          <Pressable onPress={() => router.push('/settings')}>
            <Ionicons name="cog-outline" size={36} color="gray" />
          </Pressable>
        </View>

        {/* Total Calories */}
        <Pressable className="mx-4 my-2" onPress={toggleNutrients}>
          <Text className="text-6xl font-bold text-center">
            {totalCals}<Text className="font-normal text-gray-500"> Cals</Text>
          </Text>
          {showNutrients && (
            <View className="mt-2">
              <Text className="text-xl">Fat: {totalNutrients?.fat}g</Text>
              <Text className="text-xl">Carbs: {totalNutrients?.carbs}g</Text>
              <Text className="text-xl">Protein: {totalNutrients?.protein}g</Text>
              <Text className="text-xl">Sodium: {totalNutrients?.sodium}mg</Text>
              <Text className="text-xl">Fiber: {totalNutrients?.fiber}g</Text>
              <Text className="text-xl">Sugar: {totalNutrients?.sugar}g</Text>
              <Text className="text-xl">Cholesterol: {totalNutrients?.cholesterol}mg</Text>
              <Text className="text-xl">Saturated Fat: {totalNutrients?.saturated_fat}g</Text>
              <Text className="text-xl">Trans Fat: {totalNutrients?.trans_fat}g</Text>
              <Text className="text-xl">Vitamin A: {totalNutrients?.vitamin_a}mcg</Text>
              <Text className="text-xl">Vitamin C: {totalNutrients?.vitamin_c}mg</Text>
              <Text className="text-xl">Calcium: {totalNutrients?.calcium}mg</Text>
              <Text className="text-xl">Iron: {totalNutrients?.iron}mg</Text>
            </View>
          )}
        </Pressable>

        {/* Meals */}
        <ScrollView className="flex-1">
          {Object.entries(dailyLog?.meals || {}).map(([mealType, meal]: [string, Meal]) => (
            <View key={mealType} className="mx-4 my-2 rounded-xl bg-white p-2">
              <View className='flex-row justify-between items-center mb-2'>
                <Text className="text-4xl font-semibold">{mealType}</Text>
                <Text className="text-3xl font-semibold text-gray-500">
                  {meal.meal_calories} <Text className="font-normal">Cals</Text>
                </Text>
              </View>
              {meal.foods.map((food, index) => (
                <Swipeable key={index} renderRightActions={() => renderRightActions(mealType as MealType, food.food_id)}>
                  <Pressable
                    key={index}
                    className="flex-row justify-between items-center my-1 bg-gray-100 rounded-xl p-2 px-4"
                    onPress={() => router.push({
                      pathname: '/(screens)/nutrition',
                      params: { foodId: food.food_id, calorieOverride: food.calories, mealType: mealType as MealType, foodIndex: index, dateString: date }
                    })}
                  >
                    <Text className="text-2xl">{food.food_name}</Text>
                    <Text className="text-xl text-gray-600 px-8">+ {food.calories}</Text>
                  </Pressable>
                </Swipeable>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Meal Menu */}
        {showMealMenu && (
          <View className="flex col bg-green-700 p-2">
            {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((mealType) => (
              <Link key={mealType} href={{
                pathname: "/search",
                params: { mealType, dateString: date }
              }} asChild>
                <Pressable className="items-center bg-gray-100 p-2 mt-2 mx-2 rounded-xl">
                  <Text className="text-4xl text-black font-bold">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        )}

        {/* Add Food Button */}
        {!showMealMenu && (
          <Pressable className="bg-green-700" onPress={toggleMealMenu}>
            <Text className="text-white text-center font-bold text-4xl py-3">Add Food</Text>
          </Pressable>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

export default Home;

const styles = StyleSheet.create({
  nutMenuContainer: {
    borderRadius: 8,
  },
  shadowIOS: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  shadowAndroid: {
    elevation: 6,
  },
});