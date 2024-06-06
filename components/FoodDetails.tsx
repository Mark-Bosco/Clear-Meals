// src/components/FoodDetailsCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export type NutritionInfo = {
  servingSize: string;
  calories: number;
  totalFat: number;
  saturatedFat: number;
  transFat?: number;
  polyunsaturatedFat?: number;
  monounsaturatedFat?: number;
  cholesterol: number;
  sodium: number;
  totalCarbohydrate: number;
  dietaryFiber: number;
  sugars: number;
  protein: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
};

type FoodDetailsCardProps = {
  foodName: string;
  brand: string;
  nutritionInfo: NutritionInfo;
  onServingChange: (delta: -1 | 1) => void;
  onEditMeasurement: () => void;
  currentServing: number;
};

const FoodDetailsCard: React.FC<FoodDetailsCardProps> = ({
  foodName,
  brand,
  nutritionInfo,
  onServingChange,
  onEditMeasurement,
  currentServing,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{foodName}</Text>
      <Text style={styles.brand}>{brand}</Text>

      <Text style={styles.subTitle}>Nutrition Info</Text>
      <ScrollView style={styles.nutritionInfo}>
        <Text style={styles.calorie}>Calories {nutritionInfo.calories}</Text>
        
        <View style={styles.row}>
          <Text>Total Fat {nutritionInfo.totalFat}g</Text>
          <Text>{Math.round((nutritionInfo.totalFat / 65) * 100)}%</Text>
        </View>
        <Text style={styles.subItem}>Saturated Fat {nutritionInfo.saturatedFat}g</Text>
        {nutritionInfo.transFat && <Text style={styles.subItem}>Trans Fat {nutritionInfo.transFat}g</Text>}
        {nutritionInfo.polyunsaturatedFat && <Text style={styles.subItem}>Polyunsaturated Fat {nutritionInfo.polyunsaturatedFat}g</Text>}
        {nutritionInfo.monounsaturatedFat && <Text style={styles.subItem}>Monounsaturated Fat {nutritionInfo.monounsaturatedFat}g</Text>}
        
        <View style={styles.row}>
          <Text>Cholesterol {nutritionInfo.cholesterol}mg</Text>
          <Text>{Math.round((nutritionInfo.cholesterol / 300) * 100)}%</Text>
        </View>
        
        <View style={styles.row}>
          <Text>Sodium {nutritionInfo.sodium}mg</Text>
          <Text>{Math.round((nutritionInfo.sodium / 2300) * 100)}%</Text>
        </View>
        
        <View style={styles.row}>
          <Text>Total Carbohydrate {nutritionInfo.totalCarbohydrate}g</Text>
          <Text>{Math.round((nutritionInfo.totalCarbohydrate / 300) * 100)}%</Text>
        </View>
        <Text style={styles.subItem}>Dietary Fiber {nutritionInfo.dietaryFiber}g</Text>
        <Text style={styles.subItem}>Sugars {nutritionInfo.sugars}g</Text>
        
        <Text>Protein {nutritionInfo.protein}g</Text>
        
        {nutritionInfo.vitaminD && <Text>Vitamin D {nutritionInfo.vitaminD}mcg</Text>}
        {nutritionInfo.calcium && <Text>Calcium {nutritionInfo.calcium}mg</Text>}
        {nutritionInfo.iron && <Text>Iron {nutritionInfo.iron}mg</Text>}
        {nutritionInfo.potassium && <Text>Potassium {nutritionInfo.potassium}mg</Text>}
      </ScrollView>

      <View style={styles.servingContainer}>
        <TouchableOpacity onPress={() => onServingChange(-1)}>
          <Text style={styles.servingButton}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity onLongPress={onEditMeasurement} style={styles.servingInfo}>
          <Text style={styles.servingText}>{currentServing} serving ({nutritionInfo.servingSize})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onServingChange(1)}>
          <Text style={styles.servingButton}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Hold down the button to edit measurement</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold' },
  brand: { fontSize: 18, color: 'gray', marginBottom: 16 },
  subTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  nutritionInfo: { maxHeight: 300, marginBottom: 16 },
  calorie: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  subItem: { marginLeft: 16, marginBottom: 4 },
  servingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4A7A5C',
    borderRadius: 25,
    padding: 8,
  },
  servingButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 16,
  },
  servingInfo: {
    flex: 1,
    alignItems: 'center',
  },
  servingText: {
    fontSize: 18,
    color: 'white',
  },
  hint: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default FoodDetailsCard;