// history.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { fetchDailyLog } from '../firestoreService';
import { useAuth } from '../(auth)/AuthContext';
import { DailyLog } from '../types';

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
  };
}

interface MonthData {
  year: number;
  month: number;
}

const History = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const loadMonthData = useCallback(async (month: MonthData) => {
    if (!user) return;

    const startDate = new Date(month.year, month.month - 1, 1);
    const endDate = new Date(month.year, month.month, 0);

    const dateArray: Date[] = [];
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      dateArray.push(new Date(date));
    }

    const logs: (DailyLog | null)[] = await Promise.all(
      dateArray.map(date => 
        fetchDailyLog(user.uid, date.toISOString().split('T')[0])
      )
    );

    const newMarkedDates: MarkedDates = {};
    logs.forEach((log, index) => {
      if (log) {
        const date = dateArray[index].toISOString().split('T')[0];
        newMarkedDates[date] = {
          marked: true,
          dotColor: 'green',
        };
      }
    });

    setMarkedDates(prevMarkedDates => ({...prevMarkedDates, ...newMarkedDates}));
  }, [user]);

  const handleDayPress = (day: DateData) => {
    router.push({
      pathname: '/home',
      params: { date: day.dateString }
    });
  };

  useEffect(() => {
    const currentDate = new Date();
    loadMonthData({ year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 });
  }, [loadMonthData]);

  return (
    <View style={styles.container}>
      <Calendar
        onMonthChange={(month: MonthData) => loadMonthData(month)}
        onDayPress={handleDayPress}
        markedDates={markedDates}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 50,
  },
});

export default History;