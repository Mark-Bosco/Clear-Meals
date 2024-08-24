import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TotalNutrients } from '@/app/types';

interface NutrientDisplayProps {
  totalNutrients: TotalNutrients | null;
}

interface NutrientItemProps {
  label: string;
  value: number;
}

const NutrientDisplay: React.FC<NutrientDisplayProps> = ({ totalNutrients }) => {
  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <NutrientItem label="Protein" value={totalNutrients?.protein ?? 0} />
        <NutrientItem label="Fat" value={totalNutrients?.fat ?? 0} />
        <NutrientItem label="Carbs" value={totalNutrients?.carbs ?? 0} />
        <NutrientItem label="Sodium" value={totalNutrients?.sodium ?? 0} />
      </View>
      <View style={styles.column}>
        <NutrientItem label="Chol" value={totalNutrients?.cholesterol ?? 0} />
        <NutrientItem label="Vit A" value={totalNutrients?.vitamin_a ?? 0} />
        <NutrientItem label="Fiber" value={totalNutrients?.fiber ?? 0} />
        <NutrientItem label="Sat Fat" value={totalNutrients?.saturated_fat ?? 0} />
      </View>
      <View style={styles.column}>
        <NutrientItem label="Sugar" value={totalNutrients?.sugar ?? 0} />
        <NutrientItem label="Vit C" value={totalNutrients?.vitamin_c ?? 0} />
        <NutrientItem label="Calcium" value={totalNutrients?.calcium ?? 0} />
        <NutrientItem label="Iron" value={totalNutrients?.iron ?? 0} />
      </View>
    </View>
  );
};

const NutrientItem: React.FC<NutrientItemProps> = ({ label, value }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.valueContainer}>
      <Text style={styles.value}>{value}mg</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#15803D',
    borderRadius: 10,
    padding: 10,
  },
  column: {
    flex: 1,
    marginHorizontal: 3,
  },
  itemContainer: {
    marginVertical: 2,
  },
  label: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  valueContainer: {
    backgroundColor: '#F5E6D3',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  value: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NutrientDisplay;