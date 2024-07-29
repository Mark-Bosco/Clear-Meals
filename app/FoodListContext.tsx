// FoodListContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { FoodListItem } from './types';

interface FoodListContextType {
  foodList: FoodListItem[];
  addFood: (food: FoodListItem) => void;
  removeFood: (index: number) => void;
  clearList: () => void;
  replaceFood: (index: number, updatedFood: FoodListItem) => void; // New function
}

const FoodListContext = createContext<FoodListContextType | undefined>(undefined);

export const FoodListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [foodList, setFoodList] = useState<FoodListItem[]>([]);

  // Merge same foods
  const addFood = (food: FoodListItem) => {
    setFoodList((prevList) => [...prevList, food]);
  };

  const removeFood = (index: number) => {
    setFoodList((prevList) => prevList.filter((_, i) => i !== index));
  };

  const clearList = () => {
    setFoodList([]);
  };

  // New replace function
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