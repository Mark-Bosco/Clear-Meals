// firestoreService.ts
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { FoodListItem, Meal, MealType, DailyLog } from './types';

function mergeDuplicateFoods(foodList: FoodListItem[]): FoodListItem[] {
  const mergedFoods: { [key: string]: FoodListItem } = {};

  foodList.forEach(food => {
    if (mergedFoods[food.food_id]) {
      // If the food already exists, sum the calories
      mergedFoods[food.food_id].calories = (
        Number(mergedFoods[food.food_id].calories) + Number(food.calories)
      ).toString();
    } else {
      // If it's a new food, add it to the merged foods
      mergedFoods[food.food_id] = { ...food };
    }
  });

  return Object.values(mergedFoods);
}

export async function saveMeal(userId: string, mealType: MealType, foodList: FoodListItem[]) {
  try {
    const date = new Date().toISOString().split('T')[0];
    const dailyLogRef = doc(db, 'users', userId, 'dailyLogs', date);

    // Get the current daily log
    const dailyLogSnap = await getDoc(dailyLogRef);
    const currentDailyLog = dailyLogSnap.exists() ? dailyLogSnap.data() as DailyLog : null;

    let updatedFoods: FoodListItem[];
    let updatedCalories: number;

    if (currentDailyLog && currentDailyLog.meals[mealType]) {
      // If the meal already exists, merge the new foods with existing ones
      const existingFoods = currentDailyLog.meals[mealType].foods;
      updatedFoods = mergeDuplicateFoods([...existingFoods, ...foodList]);
      updatedCalories = updatedFoods.reduce((sum, food) => sum + Number(food.calories), 0);
    } else {
      // If the meal doesn't exist, just merge the new foods
      updatedFoods = mergeDuplicateFoods(foodList);
      updatedCalories = updatedFoods.reduce((sum, food) => sum + Number(food.calories), 0);
    }

    const updatedMeal: Meal = {
      type: mealType,
      foods: updatedFoods,
      meal_calories: updatedCalories,
    };

    // Update or create the meal
    await setDoc(dailyLogRef, {
      date: date,
      meals: {
        [mealType]: updatedMeal
      },
    }, { merge: true });

    console.log('Meal saved successfully');
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
}

export async function saveFood(userId: string, mealType: MealType, foodListItem: FoodListItem, foodIndexS: string) {
  try {
    const date = new Date().toISOString().split('T')[0];
    const dailyLogRef = doc(db, 'users', userId, 'dailyLogs', date);
    const foodIndex = parseInt(foodIndexS);

    // Get the current daily log
    const dailyLogSnap = await getDoc(dailyLogRef);
    const currentDailyLog = dailyLogSnap.exists() ? dailyLogSnap.data() as DailyLog : null;

    if (currentDailyLog && currentDailyLog.meals[mealType]) {

      if (foodIndex != -1) {
        // Update the existing food item
        currentDailyLog.meals[mealType].foods[foodIndex] = foodListItem;
      } else {
        // If the food item doesn't exist, log an error
        console.error('Invalid food index');
      }

      // Recalculate the total calories for the meal
      const updatedCalories = currentDailyLog.meals[mealType].foods.reduce(
        (sum, food) => sum + Number(food.calories), 0
      );

      // Update the meal in the database
      await updateDoc(dailyLogRef, {
        [`meals.${mealType}.foods`]: currentDailyLog.meals[mealType].foods,
        [`meals.${mealType}.meal_calories`]: updatedCalories
      });

      console.log('Food item updated successfully');
    } else {
      console.error('Meal not found in the daily log');
      throw new Error('Meal not found in the daily log');
    }
  } catch (error) {
    console.error('Error updating food item:', error);
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