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

    const dailyLogSnap = await getDoc(dailyLogRef);
    const currentDailyLog = dailyLogSnap.exists() ? dailyLogSnap.data() as DailyLog : null;

    let updatedFoods: FoodListItem[];
    let updatedMeal: Meal;

    if (currentDailyLog && currentDailyLog.meals[mealType]) {
      const existingFoods = currentDailyLog.meals[mealType].foods;
      updatedFoods = mergeDuplicateFoods([...existingFoods, ...foodList]);
    } else {
      updatedFoods = mergeDuplicateFoods(foodList);
    }

    updatedMeal = calculateMealTotals(updatedFoods);

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

// Update to track micro-nutrients
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

function calculateMealTotals(foods: FoodListItem[]): Meal {
  const totals: Meal = {
    //type: 'Breakfast', // This will be overwritten when saving
    foods: foods,
    meal_calories: 0,
    meal_fat: 0,
    meal_carbs: 0,
    meal_protein: 0,
    meal_sodium: 0,
    meal_fiber: 0,
    meal_sugar: 0,
    meal_cholesterol: 0,
    meal_saturated_fat: 0,
    meal_trans_fat: 0,
    meal_vitamin_a: 0,
    meal_vitamin_c: 0,
    meal_calcium: 0,
    meal_iron: 0,
  };

  foods.forEach(food => {
    totals.meal_calories += Number(food.calories);
    totals.meal_fat += Number(food.fat || 0);
    totals.meal_carbs += Number(food.carbohydrate || 0);
    totals.meal_protein += Number(food.protein || 0);
    totals.meal_sodium += Number(food.sodium || 0);
    totals.meal_fiber += Number(food.fiber || 0);
    totals.meal_sugar += Number(food.sugar || 0);
    totals.meal_cholesterol += Number(food.cholesterol || 0);
    totals.meal_saturated_fat += Number(food.saturated_fat || 0);
    totals.meal_trans_fat += Number(food.trans_fat || 0);
    totals.meal_vitamin_a += Number(food.vitamin_a || 0);
    totals.meal_vitamin_c += Number(food.vitamin_c || 0);
    totals.meal_calcium += Number(food.calcium || 0);
    totals.meal_iron += Number(food.iron || 0);
  });

  return totals;
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

export async function deleteFoodFromMeal(userId: string, date: string, mealType: MealType, foodId: string) {
  try {
    const dailyLogRef = doc(db, 'users', userId, 'dailyLogs', date);
    const dailyLogSnap = await getDoc(dailyLogRef);

    if (dailyLogSnap.exists()) {
      const currentDailyLog = dailyLogSnap.data() as DailyLog;

      if (currentDailyLog.meals[mealType]) {
        // Filter out the food item to be deleted
        const updatedFoods = currentDailyLog.meals[mealType].foods.filter(
          food => food.food_id !== foodId
        );

        // Recalculate the total calories for the meal
        const updatedCalories = updatedFoods.reduce(
          (sum, food) => sum + Number(food.calories), 0
        );

        // Update the meal in the database
        await updateDoc(dailyLogRef, {
          [`meals.${mealType}.foods`]: updatedFoods,
          [`meals.${mealType}.meal_calories`]: updatedCalories
        });

        console.log('Food item deleted successfully');
      } else {
        console.error('Meal not found in the daily log');
        throw new Error('Meal not found in the daily log');
      }
    } else {
      console.error('Daily log not found');
      throw new Error('Daily log not found');
    }
  } catch (error) {
    console.error('Error deleting food item:', error);
    throw error;
  }
}