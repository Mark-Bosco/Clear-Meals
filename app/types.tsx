
// Represents a single global food item
// I don't think I need serving size/type
// I think I can just use calories to scale
export interface FoodItem {
    food_id: string;
    food_name: string;
    brand_name?: string;
    calories: string;
    fat?: string;
    saturated_fat?: string;
    trans_fat?: string;
    cholesterol?: string;
    sodium?: string;
    carbohydrates?: string;
    fiber?: string;
    sugar?: string;
    protein?: string;
    vitamin_a?: string;
    vitamin_c?: string;
    calcium?: string;
    iron?: string;
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