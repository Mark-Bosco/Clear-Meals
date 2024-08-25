import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Serving } from "../types/types";

const NutritionLabel: React.FC<{ currServing: Serving; }> = ({ currServing }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Nutrition Facts
            </Text>
            <View style={styles.divider}></View>
            <View style={styles.row}>
                <Text style={styles.servingSizeLabel}>
                    Serving Size
                </Text>
                <View style={styles.servingSizeValueContainer}>
                    <Text style={styles.servingSizeValue}>
                        {currServing.amount} {currServing.unit}
                    </Text>
                    <Text style={styles.servingSizeMetric}>
                        {currServing.unit === "g" || currServing.unit === "oz" ? ""
                            : `(${currServing.metric_serving_amount}${currServing.metric_serving_unit})`}
                    </Text>
                </View>
            </View>
            <View style={styles.thickDivider}></View>
            <View style={styles.row}>
                <Text style={styles.caloriesLabel}>
                    Calories
                </Text>
                <Text style={styles.caloriesValue}>
                    {currServing.calories}
                </Text>
            </View>
            <View style={styles.mediumDivider}></View>
            <NutrientRow label="Total Fat" value={currServing.fat ?? ''} unit="g" isBold={true} />
            <View style={styles.divider}></View>
            <NutrientRow label="Saturated Fat" value={currServing.saturated_fat ?? ''} unit="g" indented={true} />
            <View style={styles.divider}></View>
            <NutrientRow label="Cholesterol" value={currServing.cholesterol ?? ''} unit="mg" isBold={true} />
            <View style={styles.divider}></View>
            <NutrientRow label="Sodium" value={currServing.sodium ?? ''} unit="mg" isBold={true} />
            <View style={styles.divider}></View>
            <NutrientRow label="Total Carbohydrate" value={currServing.carbohydrate ?? ''} unit="g" isBold={true} />
            <View style={styles.divider}></View>
            <NutrientRow label="Dietary Fiber" value={currServing.fiber ?? ''} unit="g" indented={true} />
            <View style={styles.divider}></View>
            <NutrientRow label="Total Sugars" value={currServing.sugar ?? ''} unit="g" indented={true} />
            <View style={styles.divider}></View>
            <NutrientRow label="Protein" value={currServing.protein ?? ''} unit="g" isBold={true} />
            <View style={styles.thickDivider}></View>
            <NutrientRow label="Vitamin A" value={currServing.vitamin_a ?? ''} unit="mcg" />
            <View style={styles.divider}></View>
            <NutrientRow label="Vitamin C" value={currServing.vitamin_c ?? ''} unit="mcg" />
            <View style={styles.divider}></View>
            <NutrientRow label="Calcium" value={currServing.calcium ?? ''} unit="mg" />
            <View style={styles.divider}></View>
            <NutrientRow label="Iron" value={currServing.iron ?? ''} unit="mg" />
            <View style={styles.mediumDivider}></View>
        </View>
    );
};

const NutrientRow: React.FC<{ label: string; value: string; unit: string; isBold?: boolean; indented?: boolean }> =
    ({ label, value, unit, isBold = false, indented = false }) => (
        <View style={styles.row}>
            <Text style={[
                styles.nutrientLabel,
                isBold && styles.boldText,
                indented && styles.indentedText
            ]}>
                {label}
            </Text>
            <Text style={[styles.nutrientValue, isBold && styles.boldText]}>
                {value === "N/A" ? "N/A" : `${value}${unit}`}
            </Text>
        </View>
    );

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderColor: 'black',
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#F3F4F6',
    },
    title: {
        marginLeft: 4,
        fontSize: 24,
        textAlign: 'left',
        fontWeight: '800',
    },
    divider: {
        borderBottomWidth: 2,
        borderBottomColor: 'black',
    },
    thickDivider: {
        borderBottomWidth: 8,
        borderBottomColor: 'black',
    },
    mediumDivider: {
        borderBottomWidth: 4,
        borderBottomColor: 'black',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 4,
    },
    servingSizeLabel: {
        marginLeft: 4,
        flex: 1,
        fontWeight: '600',
        fontSize: 20,
    },
    servingSizeValueContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flexWrap: 'wrap', // Allow wrapping if needed
    },
    servingSizeValue: {
        marginRight: 4,
        textAlign: 'right',
        fontWeight: '600',
        fontSize: 20,
    },
    servingSizeMetric: {
        marginRight: 4,
        textAlign: 'right',
        fontWeight: '600',
        fontSize: 20,
    },
    caloriesLabel: {
        marginLeft: 4,
        flex: 3,
        fontWeight: '800',
        fontSize: 24,
    },
    caloriesValue: {
        marginRight: 4,
        flex: 1,
        textAlign: 'right',
        fontWeight: '800',
        fontSize: 24,
    },
    nutrientLabel: {
        marginLeft: 4,
        flex: 3,
        fontSize: 18,
    },
    nutrientValue: {
        marginRight: 4,
        flex: 1,
        textAlign: 'right',
        fontSize: 20,
    },
    boldText: {
        fontWeight: '700',
    },
    indentedText: {
        marginLeft: 32,
    },
});

export default NutritionLabel;