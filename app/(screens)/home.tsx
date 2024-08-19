import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../(auth)/AuthContext';
import { fetchDailyLog } from '../firestoreService';
import { DailyLog, Meal, MealType } from '../types';
import { format } from 'date-fns';

type MenuName = 'nutMenu' | 'mealMenu';

type VisibleMenus = {
  [K in MenuName]: boolean;
};

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleMenus, setVisibleMenus] = useState<VisibleMenus>({
    nutMenu: false,
    mealMenu: false
  });

  // Maybe merge food items and update database when loading in
  const loadDailyLog = useCallback(async () => {
    if (user && user.uid) {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const log = await fetchDailyLog(user.uid, today);
        setDailyLog(log);
      } catch (error) {
        console.error('Error loading daily log:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadDailyLog();
    }, [loadDailyLog])
  );

  const toggleMenu = (menuName: MenuName): void => {
    setVisibleMenus(prevState => ({
      ...prevState,
      [menuName]: !prevState[menuName]
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const totalCals = Object.values(dailyLog?.meals || {}).reduce((sum, meal) => {
    // Ensure calories are treated as numbers
    return sum + (meal.meal_calories || 0);
  }, 0);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white mt-10">
      <View className="px-4 py-2 flex-row justify-between items-center">
        <Pressable onPress={() => { }}>
          <Ionicons name="calendar-clear-outline" size={36} color="gray" />
        </Pressable>
        <Text className="text-3xl text-gray-500 font-semibold">{format(new Date(), "MMMM do")}</Text>
        <Pressable onPress={handleSignOut}>
          <Ionicons name="cog-outline" size={36} color="gray" />
        </Pressable>
      </View>

      {/* Total Calories */}
      <Pressable className="mx-4 my-2" onPress={() => toggleMenu('nutMenu')}>
        <Text className="text-6xl font-bold text-center">
          {totalCals}<Text className="font-normal text-gray-500"> Cals</Text>
        </Text>
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
              <Pressable
                key={index}
                className="flex-row justify-between items-center my-1 bg-gray-100 rounded-xl p-2 px-4"
                onPress={() => router.push({
                  pathname: '/(screens)/nutrition',
                  params: { foodId: food.food_id, calorieOverride: food.calories, mealType: mealType as MealType, foodIndex: index }
                })}
              >
                <Text className="text-2xl">{food.food_name}</Text>
                <Text className="text-xl text-gray-600 px-8">+ {food.calories}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Meal Menu */}
      {visibleMenus.mealMenu && (
        <View className="flex col bg-green-700 p-2">
          {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((mealType) => (
            <Link key={mealType} href={{ pathname: "/search", params: { mealType } }} asChild>
              <Pressable className="items-center bg-gray-100 p-2 mt-2 mx-2 rounded-xl">
                <Text className="text-4xl text-black font-bold">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}

      {/* Add Food Button */}
      {!visibleMenus.mealMenu && (
        <Pressable className="bg-green-700" onPress={() => toggleMenu('mealMenu')}>
          <Text className="text-white text-center font-bold text-4xl py-3">Add Food</Text>
        </Pressable>
      )}
    </View>
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