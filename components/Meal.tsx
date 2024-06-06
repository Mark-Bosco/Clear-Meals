// src/components/Meal.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import FoodItem, { FoodItemType } from './FoodItem';

export type MealType = {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foodItems: FoodItemType[];
};

type MealProps = {
  meal: MealType;
  onFoodItemPress?: (foodId: string) => void;
};

const Meal: React.FC<MealProps> = ({ meal, onFoodItemPress }) => {
  const totalCalories = meal.foodItems.reduce((sum, item) => 
    sum + (parseInt(item.serving?.calories || '0') || 0), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{meal.type}</Text>
      <FlatList
        data={meal.foodItems}
        renderItem={({ item }) => (
          <FoodItem item={item} onSelect={onFoodItemPress || (() => {})} />
        )}
        keyExtractor={item => item.food_id}
      />
      <Text style={styles.calories}>Total Calories: {totalCalories}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  calories: { fontWeight: 'bold', textAlign: 'right' },
});

export default Meal;