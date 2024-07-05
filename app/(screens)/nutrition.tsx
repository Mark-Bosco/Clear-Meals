import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getFood } from "../../backend/api";

const Nutrition: React.FC = () => {
    const { foodId } = useLocalSearchParams<{ foodId: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!foodId) {
                setError("Food ID is missing");
                setLoading(false);
                return;
            }

            try {
                const result = await getFood(foodId);
                setData(result);
            } catch (err) {
                setError("Failed to fetch food data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [foodId]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text>{error}</Text>
            </SafeAreaView>
        );
    }

    const jsonString = JSON.stringify(data, null, 2);

    return (
        <ScrollView className="flex-1 bg-white">
            <Text>Raw JSON Data:</Text>
            <View style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 5 }}>
                <Text style={{ fontFamily: 'monospace' }}>{jsonString}</Text>
            </View>
        </ScrollView>
    );
};

export default Nutrition;