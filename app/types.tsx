
// Represents a single global food item
export interface FoodItem {
    food_id: string;
    food_name: string;
    brand_name?: string;
    serving_size: string;
    serving_unit: string;
    calories: number;
    fat?: number;
    saturated_fat?: number;
    trans_fat?: number;
    cholesterol?: number;
    sodium?: number;
    carbohydrates?: number;
    fiber?: number;
    sugar?: number;
    protein?: number;
    vitamin_a?: number;
    vitamin_c?: number;
    calcium?: number;
    iron?: number;
  }
  
  // Represents a meal type (e.g., breakfast, lunch, dinner, snack)
  export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
  
  // Represents a single meal, which is a collection of food items
  export interface Meal {
    type: MealType;
    foods: FoodItem[];
    total_calories: number;
    total_fat?: number;
    total_carbs?: number;
    total_protein?: number;
    total_sodium?: number;
  }
  
  // Represents a daily log, which includes all meals for a specific date
  export interface DailyLog {
    date: string; // ISO string format
    meals: {
      [key in MealType]: Meal;
    };
    total_calories: number;
    total_fat?: number;
    total_carbs?: number;
    total_protein?: number;
    total_sodium?: number;
  }
  
  // Represents a user's profile
  export interface UserProfile {
    id: string;
    // name: string;
    email: string;
    // goal_calories?: number;
  }