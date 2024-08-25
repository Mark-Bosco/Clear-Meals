import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Animated, StyleSheet } from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { deleteFoodFromMeal, fetchDailyLog } from '../../backend/firestore';
import { DailyLog, MealType, TotalNutrients } from '../../types/types';
import { format, parseISO } from 'date-fns';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import NutrientDisplay from '@/components/NutrientDisplay';

const MEAL_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNutrients, setShowNutrients] = useState(false);
  const [showMealMenu, setShowMealMenu] = useState(false);
  const { date } = useLocalSearchParams<{ date: string }>();
  const slideAnim = useRef(new Animated.Value(400)).current;

  const getCurrentLocalDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const loadDailyLog = useCallback(async () => {
    if (user && user.uid) {
      try {
        setLoading(true);
        const logDate = date || getCurrentLocalDate();
        const log = await fetchDailyLog(user.uid, logDate);
        setDailyLog(log);
      } catch (error) {
        console.error('Error loading daily log:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user, date]);

  useFocusEffect(
    useCallback(() => {
      loadDailyLog();
    }, [loadDailyLog])
  );

  const handleDeleteFood = async (mealType: MealType, foodId: string) => {
    if (user && dailyLog) {
      try {
        await deleteFoodFromMeal(user.uid, dailyLog.date, mealType, foodId);
        loadDailyLog();
      } catch (error) {
        console.error('Error deleting food item:', error);
        Alert.alert('Error', 'Failed to delete food item. Please try again.');
      }
    }
  };

  const renderRightActions = (mealType: MealType, foodId: string) => {
    return (
      <Pressable
        style={styles.deleteButton}
        onPress={() => handleDeleteFood(mealType, foodId)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    );
  };

  const toggleNutrients = () => setShowNutrients(!showNutrients);

  const toggleMealMenu = () => {
    setShowMealMenu(!showMealMenu);
    Animated.timing(slideAnim, {
      toValue: showMealMenu ? 400 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const totalCals = Object.values(dailyLog?.meals || {}).reduce((sum, meal) => {
    return sum + (meal.meal_calories || 0);
  }, 0);

  const calculateTotalNutrients = (): TotalNutrients | null => {
    if (!dailyLog) return null;

    const totals: TotalNutrients = {
      fat: 0, carbs: 0, protein: 0, sodium: 0, fiber: 0, sugar: 0,
      cholesterol: 0, saturated_fat: 0, trans_fat: 0, vitamin_a: 0,
      vitamin_c: 0, calcium: 0, iron: 0,
    };

    Object.values(dailyLog.meals).forEach((meal) => {
      totals.fat += meal.meal_fat || 0;
      totals.carbs += meal.meal_carbs || 0;
      totals.protein += meal.meal_protein || 0;
      totals.sodium += meal.meal_sodium || 0;
      totals.fiber += meal.meal_fiber || 0;
      totals.sugar += meal.meal_sugar || 0;
      totals.cholesterol += meal.meal_cholesterol || 0;
      totals.saturated_fat += meal.meal_saturated_fat || 0;
      totals.trans_fat += meal.meal_trans_fat || 0;
      totals.vitamin_a += meal.meal_vitamin_a || 0;
      totals.vitamin_c += meal.meal_vitamin_c || 0;
      totals.calcium += meal.meal_calcium || 0;
      totals.iron += meal.meal_iron || 0;
    });
    return totals;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push('/(screens)/history')}>
            <Ionicons name="calendar-clear-outline" size={36} color="gray" />
          </Pressable>
          <Text style={styles.dateText}>
            {format(parseISO(date || getCurrentLocalDate()), "MMMM do")}
          </Text>
          <Pressable onPress={() => router.push('/settings')}>
            <Ionicons name="cog-outline" size={36} color="gray" />
          </Pressable>
        </View>

        <Pressable style={styles.caloriesContainer} onPress={toggleNutrients}>
          <Text style={styles.caloriesText}>
            {totalCals}<Text style={styles.caloriesUnit}> Cals</Text>
          </Text>
          {showNutrients && (<NutrientDisplay totalNutrients={calculateTotalNutrients()} />)}
        </Pressable>

        <ScrollView style={styles.scrollView}>
          {MEAL_ORDER.map((mealType) => {
            const meal = dailyLog?.meals[mealType];
            if (!meal) return null;
            return (
              <View key={mealType} style={styles.mealContainer}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealType}>{mealType}</Text>
                  <Text style={styles.mealCalories}>
                    {meal.meal_calories} <Text style={styles.mealCaloriesUnit}>Cals</Text>
                  </Text>
                </View>
                {meal.foods.map((food, index) => (
                  <Swipeable key={index} renderRightActions={() => renderRightActions(mealType, food.food_id)}>
                    <Pressable
                      style={styles.foodItem}
                      onPress={() => router.push({
                        pathname: '/(screens)/nutrition',
                        params: { foodId: food.food_id, calorieOverride: food.calories, mealType: mealType, foodIndex: index, dateString: date }
                      })}
                    >
                      <Text style={styles.foodName} numberOfLines={1} ellipsizeMode="tail">{food.food_name}</Text>
                      <Text style={styles.foodCalories}>+ {food.calories}</Text>
                    </Pressable>
                  </Swipeable>
                ))}
              </View>
            );
          })}
        </ScrollView>

        <Animated.View
          style={[
            styles.mealMenuContainer,
            {
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.mealMenuContent}>
            <Pressable
              style={styles.closeMealMenuButton}
              onPress={toggleMealMenu}
            >
              <Text style={styles.closeMealMenuText}>Close</Text>
            </Pressable>
            {MEAL_ORDER.map((mealType) => (
              <Link key={mealType} href={{
                pathname: "/search",
                params: { mealType, dateString: date || getCurrentLocalDate() }
              }} asChild>
                <Pressable onPress={toggleMealMenu} style={styles.mealTypeButton}>
                  <Text style={styles.mealTypeButtonText}>{mealType}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </Animated.View>

        {!showMealMenu && (
          <Pressable style={styles.addFoodButton} onPress={toggleMealMenu}>
            <Text style={styles.addFoodButtonText}>Add Food</Text>
          </Pressable>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 26,
    color: 'rgb(107, 114, 128)',
    fontWeight: '500',
  },
  caloriesContainer: {
    marginHorizontal: 16,
    marginVertical: 0,
  },
  caloriesText: {
    fontSize: 54,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  caloriesUnit: {
    fontWeight: 'normal',
    color: 'rgb(107, 114, 128)',
  },
  scrollView: {
    flex: 1,
  },
  mealContainer: {
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: 'white',
    padding: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealType: {
    fontSize: 34,
    fontWeight: '600',
  },
  mealCalories: {
    fontSize: 28,
    fontWeight: '600',
    color: 'rgb(107, 114, 128)',
  },
  mealCaloriesUnit: {
    fontWeight: 'normal',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    backgroundColor: 'rgb(243, 244, 246)',
    borderRadius: 12,
    padding: 6,
    paddingHorizontal: 16,
  },
  foodName: {
    fontSize: 22,
    fontWeight: '400',
    flex: 1,
    marginRight: 8,
  },
  foodCalories: {
    fontSize: 20,
    fontWeight: '300',
    color: 'rgb(75, 85, 99)',
  },
  mealMenuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  mealMenuContent: {
    backgroundColor: 'rgb(21, 128, 61)',
    padding: 8,
  },
  closeMealMenuButton: {
    alignItems: 'center',
    backgroundColor: 'rgb(239, 68, 68)',
    padding: 8,
    marginBottom: 8,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  closeMealMenuText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  mealTypeButton: {
    alignItems: 'center',
    backgroundColor: 'rgb(243, 244, 246)',
    padding: 8,
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  mealTypeButtonText: {
    fontSize: 32,
    color: 'black',
    fontWeight: 'bold',
  },
  addFoodButton: {
    backgroundColor: 'rgb(21, 128, 61)',
  },
  addFoodButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 38,
    paddingVertical: 12,
  },
  deleteButton: {
    backgroundColor: '#bc2f2f',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 47,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;