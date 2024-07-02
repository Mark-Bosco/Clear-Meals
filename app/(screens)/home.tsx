import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../(auth)/AuthContext';

type FoodItem = {
  name: string;
  calories: number;
};

type MealSection = {
  name: string;
  totalCalories: number;
  items: FoodItem[];
};

type MenuName = 'nutMenu' | 'mealMenu';

type VisibleMenus = {
  [K in MenuName]: boolean;
};

const meals: MealSection[] = [
  { name: 'Breakfast', totalCalories: 380, items: [{ name: 'Eggs', calories: 100 }, { name: 'Milk', calories: 280 }] },
  { name: 'Lunch', totalCalories: 640, items: [{ name: 'Sandwich', calories: 500 }, { name: 'Steak Strips', calories: 140 }] },
  { name: 'Dinner', totalCalories: 940, items: [{ name: 'Steak', calories: 400 }, { name: 'Corn', calories: 140 }, { name: 'Potatoes', calories: 300 }, { name: 'A1 Sauce', calories: 100 }] },
  { name: 'Snack', totalCalories: 500, items: [{ name: 'Ice Cream', calories: 500 }] },
];

const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [visibleMenus, setVisibleMenus] = useState<VisibleMenus>({
    nutMenu: false,
    mealMenu: false
  });

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

  return (
    <View className="flex-1 bg-white pt-10">
      <View className="px-4 py-2 flex-row justify-between items-center">
        <Pressable onPress={() => { }}>
          <Ionicons name="calendar-clear-outline" size={36} color="gray" />
        </Pressable>
        <Text className="text-3xl text-gray-500 font-semibold" onPress={() => { }}>June, 1st</Text>
        <Pressable onPress={handleSignOut}>
          <Ionicons name="cog-outline" size={36} color="gray" />
        </Pressable>
      </View>

      {/* Total Calories */}
      <Pressable className="mx-4 my-2" onPress={() => toggleMenu('nutMenu')}>
        <Text className="text-6xl font-bold text-center">{totalCalories}<Text className="font-normal text-gray-500"> Cals</Text></Text>
        <Text className="text-3xl text-gray-500 font-semibold">Debug: {user?.email}</Text>
      </Pressable>

      {/* Hidden Nurtients */}
      {visibleMenus.nutMenu && (
        <View
          className="flex-row p-2 bg-white rounded-xl mx-4 mb-3"
          style={[
            styles.nutMenuContainer,
            Platform.OS === 'ios' ? styles.shadowIOS : styles.shadowAndroid
          ]}
        >
          <View className="flex-column flex-1 items-left p-2">
            <Text className="font-semibold text-2xl">Protein: <Text className="font-normal text-gray-500">1000mg</Text></Text>
            <Text className="font-semibold text-2xl">Fat: <Text className="font-normal text-gray-500">1000mg</Text></Text>
            <Text className="font-semibold text-2xl">Carbs: <Text className="font-normal text-gray-600">1000mg</Text></Text>
            <Text className="font-semibold text-2xl">Chol: <Text className="font-normal text-gray-500">1000mg</Text></Text>
            <Text className="font-semibold text-2xl">Sodium: <Text className="font-normal text-gray-500">1000mg</Text></Text>
            <Text className="font-semibold text-2xl">Fiber: <Text className="font-normal text-gray-500">1000mg</Text></Text>
          </View>
          <View className="flex-column flex-1 items-left p-2">
            <Text className="font-semibold text-2xl">Vit A: <Text className="font-normal text-gray-500">1000mg</Text></Text>
            <Text className="font-semibold text-2xl">Vit C: <Text className="font-normal text-gray-500">1000mg</Text></Text>
            <Text className="font-semibold text-2xl">Potas: <Text className="font-normal text-gray-500">1000mg</Text></Text>
            <Text className="font-semibold text-2xl">Calcium: <Text className="font-normal text-gray-500">1000mg</Text></Text>
            <Text className="font-semibold text-2xl">Iron: <Text className="font-normal text-gray-500">1000mg</Text></Text>
            <Text className="font-semibold text-2xl">Sat Fat: <Text className="font-normal text-gray-500">1000mg</Text></Text>
          </View>
        </View>
      )}

      {/* Meals */}
      <ScrollView className="flex-1">
        {meals.map((meal, index) => (
          <View key={index} className="mx-4 my-2 rounded-xl bg-white p-2">
            <View className='flex-row justify-between items-center mb-2'>
              <Text className="text-4xl font-semibold">{meal.name}</Text>
              <Text className="text-3xl font-semibold text-gray-500">{meal.totalCalories} <Text className="font-normal">Cals</Text></Text>
            </View>
            {meal.items.map((item, idx) => (
              <Pressable
                key={idx}
                className="flex-row justify-between items-center my-1 bg-gray-100 rounded-xl p-2 px-4"
                onPress={() => console.log(`Clicked on ${item.name}`)}
              >
                <Text className="text-2xl">{item.name}</Text>
                <Text className="text-xl text-gray-600 px-8">+ {item.calories}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Meal Menu */}
      {visibleMenus.mealMenu && (
        <View className="flex col bg-green-700 p-2">
          <Link href="/search" asChild>
            <Pressable className="items-center bg-gray-100 p-2 mt-2 mx-2 rounded-xl">
              <Text className="text-4xl text-black font-bold">Breakfast</Text>
            </Pressable>
          </Link>
          <Pressable className="items-center bg-gray-100 p-2 mt-4 mx-2 rounded-xl" onPress={() => toggleMenu('mealMenu')}>
            <Text className="text-4xl text-black font-bold">Lunch</Text>
          </Pressable>
          <Pressable className="items-center bg-gray-100 p-2 mt-4 mx-2 rounded-xl" onPress={() => toggleMenu('mealMenu')}>
            <Text className="text-4xl text-black font-bold">Dinner</Text>
          </Pressable>
          <Pressable className="items-center bg-gray-100 p-2 mt-4 mb-2 mx-2 rounded-xl" onPress={() => toggleMenu('mealMenu')}>
            <Text className="text-4xl text-black font-bold">Snack</Text>
          </Pressable>
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