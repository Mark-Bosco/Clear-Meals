// firestoreService.ts
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { FoodListItem, Meal, MealType, DailyLog } from './types';

function mergeDuplicateFoods(foodList: FoodListItem[]): FoodListItem[] {
  const mergedFoods: { [key: string]: FoodListItem } = {};

  foodList.forEach(food => {
    if (mergedFoods[food.food_id]) {
      // If the food already exists, sum all the nutrients
      Object.keys(food).forEach(key => {
        if (key !== 'food_id' && key !== 'food_name' && key !== 'brand_name') {
          mergedFoods[food.food_id][key] = (
            Number(mergedFoods[food.food_id][key]) + Number(food[key])
          ).toString();
        }
      });
    } else {
      // If it's a new food, add it to the merged foods
      mergedFoods[food.food_id] = { ...food };
    }
  });

  return Object.values(mergedFoods);
}

function calculateMealTotals(foods: FoodListItem[]): Meal {
  const totals: Meal = {
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
    totals.meal_calories += Number(food.calories || 0);
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

export async function saveMeal(userId: string, date: string, mealType: MealType, foodList: FoodListItem[]) {
  try {
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

export async function saveFood(userId: string, date: string, mealType: MealType, foodListItem: FoodListItem, foodIndex: string) {
  try {
    const dailyLogRef = doc(db, 'users', userId, 'dailyLogs', date);

    const dailyLogSnap = await getDoc(dailyLogRef);
    const currentDailyLog = dailyLogSnap.exists() ? dailyLogSnap.data() as DailyLog : null;

    if (currentDailyLog && currentDailyLog.meals[mealType]) {
      const updatedFoods = [...currentDailyLog.meals[mealType].foods];
      const index = parseInt(foodIndex);

      if (index !== -1 && index < updatedFoods.length) {
        updatedFoods[index] = foodListItem;
      } else {
        updatedFoods.push(foodListItem);
      }

      const updatedMeal = calculateMealTotals(updatedFoods);

      await updateDoc(dailyLogRef, {
        [`meals.${mealType}`]: updatedMeal
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

export async function deleteFoodFromMeal(userId: string, date: string, mealType: MealType, foodId: string) {
  try {
    const dailyLogRef = doc(db, 'users', userId, 'dailyLogs', date);
    const dailyLogSnap = await getDoc(dailyLogRef);

    if (dailyLogSnap.exists()) {
      const currentDailyLog = dailyLogSnap.data() as DailyLog;

      if (currentDailyLog.meals[mealType]) {
        const updatedFoods = currentDailyLog.meals[mealType].foods.filter(
          food => food.food_id !== foodId
        );

        const updatedMeal = calculateMealTotals(updatedFoods);

        await updateDoc(dailyLogRef, {
          [`meals.${mealType}`]: updatedMeal
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