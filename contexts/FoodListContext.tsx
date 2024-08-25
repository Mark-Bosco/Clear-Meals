// FoodListContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { FoodListItem } from '../types/types';

interface FoodListContextType {
  foodList: FoodListItem[];
  addFood: (food: FoodListItem) => void;
  removeFood: (index: number) => void;
  clearList: () => void;
  replaceFood: (index: number, updatedFood: FoodListItem) => void;
}

const FoodListContext = createContext<FoodListContextType | undefined>(undefined);

export const FoodListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [foodList, setFoodList] = useState<FoodListItem[]>([]);

  const addFood = (food: FoodListItem) => {
    setFoodList((prevList) => {
      const existingFoodIndex = prevList.findIndex(item => item.food_id === food.food_id);
      
      if (existingFoodIndex !== -1) {
        // If the food already exists, update its calories
        const updatedList = [...prevList];
        updatedList[existingFoodIndex] = {
          ...updatedList[existingFoodIndex],
          calories: (Number(updatedList[existingFoodIndex].calories) + Number(food.calories)).toString()
        };
        return updatedList;
      } else {
        // If it's a new food, add it to the list
        return [...prevList, food];
      }
    });
  };

  const removeFood = (index: number) => {
    setFoodList((prevList) => prevList.filter((_, i) => i !== index));
  };

  const clearList = () => {
    setFoodList([]);
  };

  const replaceFood = (index: number, updatedFood: FoodListItem) => {
    setFoodList((prevList) => {
      const newList = [...prevList];
      newList[index] = updatedFood;
      return newList;
    });
  };

  return (
    <FoodListContext.Provider value={{ foodList, addFood, removeFood, clearList, replaceFood }}>
      {children}
    </FoodListContext.Provider>
  );
};

export const useFoodList = () => {
  const context = useContext(FoodListContext);
  if (context === undefined) {
    throw new Error('useFoodList must be used within a FoodListProvider');
  }
  return context;
};