import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TotalNutrients } from '@/types/types';

interface NutrientDisplayProps {
  totalNutrients: TotalNutrients | null;
}

interface NutrientItemProps {
  label: string;
  value: number;
  type: string;
}

const NutrientDisplay: React.FC<NutrientDisplayProps> = ({ totalNutrients }) => {
  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <NutrientItem label="Protein" value={totalNutrients?.protein ?? 0} type={'g'}/>
        <NutrientItem label="Fat" value={totalNutrients?.fat ?? 0} type={'g'} />
        <NutrientItem label="Carbs" value={totalNutrients?.carbs ?? 0} type={'g'}/>
        <NutrientItem label="Sodium" value={totalNutrients?.sodium ?? 0} type={'mg'}/>
      </View>
      <View style={styles.column}>
        <NutrientItem label="Chol" value={totalNutrients?.cholesterol ?? 0} type={'mg'}/>
        <NutrientItem label="Vit A" value={totalNutrients?.vitamin_a ?? 0} type={'mcg'}/>
        <NutrientItem label="Fiber" value={totalNutrients?.fiber ?? 0} type={'g'}/>
        <NutrientItem label="Sat Fat" value={totalNutrients?.saturated_fat ?? 0} type={'g'}/>
      </View>
      <View style={styles.column}>
        <NutrientItem label="Sugar" value={totalNutrients?.sugar ?? 0} type={'g'}/>
        <NutrientItem label="Vit C" value={totalNutrients?.vitamin_c ?? 0} type={'mcg'}/>
        <NutrientItem label="Calcium" value={totalNutrients?.calcium ?? 0} type={'mg'}/>
        <NutrientItem label="Iron" value={totalNutrients?.iron ?? 0} type={'mg'}/>
      </View>
    </View>
  );
};

const NutrientItem: React.FC<NutrientItemProps> = ({ label, value, type }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.valueContainer}>
      <Text style={styles.value}>{value}{type}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#15803d',
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
    backgroundColor: '#e7f2eb',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  value: {
    color: '#020c06',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default NutrientDisplay;