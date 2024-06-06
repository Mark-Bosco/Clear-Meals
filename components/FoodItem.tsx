import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';

export type FoodItemType = {
  food_id: string;
  food_name: string;
  brand_name?: string;
  serving?: { 
    calories?: string;   
    protein: number;
    fat: number;
    carbs: number;
    cholesterol: number;
    sodium: number;
    fiber: number;
    vitamin_a: number;
    vitamin_c: number;
    potassium: number;
    calcium: number;
    iron: number;
    saturated_fat: number;};
};

type FoodItemProps = {
  item: FoodItemType;
  onSelect: (foodId: string) => void;
};

const FoodItem: React.FC<FoodItemProps> = ({ item, onSelect }) => (
  <Pressable onPress={() => onSelect(item.food_id)} style={styles.container}>
    <Text style={styles.name}>{item.food_name}</Text>
    <Text>{item.brand_name || 'Generic'}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { padding: 16, borderBottomWidth: 1, borderColor: 'lightgray' },
  name: { fontSize: 18, fontWeight: 'bold' },
});

export default FoodItem;