// firestoreService.ts
import { db } from '../firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { FoodListItem, Meal, MealType, DailyLog } from './types';

export async function saveMeal(userId: string, mealType: MealType, foodList: FoodListItem[]) {
  try {
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    
    const meal: Meal = {
      type: mealType,
      foods: foodList,
      total_calories: foodList.reduce((sum, food) => sum + Number(food.calories), 0),
      // You can add other totals here if needed
    };

    const dailyLogRef = doc(db, 'users', userId, 'dailyLogs', date);
    
    // Use setDoc with merge option to update or create the document
    await setDoc(dailyLogRef, {
      date: date,
      meals: {
        [mealType]: meal
      },
      total_calories: meal.total_calories,
      // You can add other totals here if needed
    }, { merge: true });

    console.log('Meal saved successfully');
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
}