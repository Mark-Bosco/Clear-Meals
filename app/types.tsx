export interface FoodListItem {
  food_id: string;
  food_name: string;
  brand_name: string;
  calories: string;
}

export interface Food {
  food_id: string;
  food_name: string;
  brand_name: string;
  servings: {
    serving: Serving[];
  };
}

export interface Serving {
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  serving_description: string;
  amount: string;
  unit: string;
  calories: string;
  fat?: string;
  saturated_fat?: string;
  trans_fat?: string;
  cholesterol?: string;
  sodium?: string;
  carbohydrate?: string;
  fiber?: string;
  sugar?: string;
  protein?: string;
  vitamin_a?: string;
  vitamin_c?: string;
  calcium?: string;
  iron?: string;
}

// Represents a meal type (e.g., breakfast, lunch, dinner, snack)
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

// Represents a single meal, which is a collection of food items
export interface Meal {
  type: MealType;
  foods: FoodListItem[];
  meal_calories: number;
  meal_fat?: number;
  meal_carbs?: number;
  meal_protein?: number;
  meal_sodium?: number;
}

// Represents a daily log, which includes all meals for a specific date
export interface DailyLog {
  date: string; // ISO string format
  meals: {
    [key in MealType]: Meal;
  };
}

// Represents a user's profile
export interface UserProfile {
  id: string;
  // name: string;
  email: string;
  // goal_calories?: number;
}