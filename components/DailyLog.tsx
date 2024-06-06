// src/components/DailyLog.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Meal, { MealType } from './Meal';

export type DailyLogType = {
  date: string;
  meals: MealType[];
};

type DailyLogProps = {
  log: DailyLogType;
  onFoodItemPress?: (foodId: string) => void;
};

const DailyLog: React.FC<DailyLogProps> = ({ log, onFoodItemPress }) => {
  const totalCalories = log.meals.reduce((sum, meal) => 
    sum + meal.foodItems.reduce((mealSum, item) => 
      mealSum + (parseInt(item.serving?.calories || '0') || 0), 0), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{new Date(log.date).toDateString()}</Text>
      <ScrollView>
        {log.meals.map(meal => (
          <Meal key={meal.id} meal={meal} onFoodItemPress={onFoodItemPress} />
        ))}
      </ScrollView>
      <Text style={styles.total}>Total Daily Calories: {totalCalories}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  date: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  total: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
});

export default DailyLog;