// firestoreService.ts
import { db } from '../firebase';
import { collection, doc, setDoc, Timestamp, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { FoodListItem, Meal, MealType, DailyLog } from './types';

export async function saveMeal(userId: string, mealType: MealType, foodList: FoodListItem[]) {
  try {
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const dailyLogRef = doc(db, 'users', userId, 'dailyLogs', date);

    // First, get the current daily log
    const dailyLogSnap = await getDoc(dailyLogRef);
    const currentDailyLog = dailyLogSnap.exists() ? dailyLogSnap.data() as DailyLog : null;

    // Calculate new calories
    const newCalories = foodList.reduce((sum, food) => sum + Number(food.calories), 0);

    if (currentDailyLog && currentDailyLog.meals[mealType]) {
      // If the meal already exists, update it
      await updateDoc(dailyLogRef, {
        [`meals.${mealType}.foods`]: arrayUnion(...foodList),
        [`meals.${mealType}.meal_calories`]: currentDailyLog.meals[mealType].meal_calories + newCalories
      });
    } else {
      // If the meal doesn't exist, create a new one
      const meal: Meal = {
        type: mealType,
        foods: foodList,
        meal_calories: newCalories,
      };

      await setDoc(dailyLogRef, {
        date: date,
        meals: {
          [mealType]: meal
        },
      }, { merge: true });
    }

    console.log('Meal saved successfully');
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
}

export async function fetchDailyLog(userId: string, date: string): Promise<DailyLog | null> {
  try {
    const dailyLogRef = doc(db, 'users', userId, 'dailyLogs', date);
    const dailyLogSnap = await getDoc(dailyLogRef);

    if (dailyLogSnap.exists()) {
      return dailyLogSnap.data() as DailyLog;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching daily log:', error);
    throw error;
  }
}