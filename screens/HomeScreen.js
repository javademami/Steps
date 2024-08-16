import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';

export default function HomeScreen({ navigation }) {
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [dailyDistances, setDailyDistances] = useState({});

  useEffect(() => {
    // بررسی اینکه آیا Pedometer در دسترس است
    Pedometer.isAvailableAsync().then(
      result => {
        setIsPedometerAvailable(String(result));
      },
      error => {
        setIsPedometerAvailable('false');
      }
    );

    // شروع ردیابی قدم‌ها
    const subscription = Pedometer.watchStepCount(result => {
      setStepCount(result.steps);
      saveDistance(result.steps);
    });

    // پاک‌سازی بعد از استفاده
    return () => subscription && subscription.remove();
  }, []);

  const saveDistance = async (steps) => {
    const distance = (steps * 0.000762).toFixed(2);
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    try {
      const existingData = await AsyncStorage.getItem('dailyDistances');
      const dailyDistances = existingData ? JSON.parse(existingData) : {};
      dailyDistances[date] = distance;
      await AsyncStorage.setItem('dailyDistances', JSON.stringify(dailyDistances));
      setDailyDistances(dailyDistances);
    } catch (error) {
      console.error("Error saving data", error);
    }
  };

  const loadDistances = async () => {
    try {
      const existingData = await AsyncStorage.getItem('dailyDistances');
      if (existingData) {
        setDailyDistances(JSON.parse(existingData));
      }
    } catch (error) {
      console.error("Error loading data", error);
    }
  };

  useEffect(() => {
    loadDistances();
  }, []);

  const distance = (stepCount * 0.000762).toFixed(2); // محاسبه مسافت طی شده بر اساس تعداد قدم‌ها

  return (
    <View style={styles.container}>
      <Text style={styles.text}>قدم‌شمار در دسترس: {isPedometerAvailable}</Text>
      <Text style={styles.text}>تعداد قدم‌ها: {stepCount}</Text>
      <Text style={styles.text}>مسافت طی شده: {distance} کیلومتر</Text>
      <Button title="مشاهده نقشه" onPress={() => navigation.navigate('MapTab')} />
      <ScrollView style={styles.scrollContainer}>
        {Object.keys(dailyDistances).map(date => (
          <Text key={date} style={styles.textdate}>
            {date}: {dailyDistances[date]} کیلومتر
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  scrollContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#ffffff',
    fontSize:18,
    padding:10,
    borderRadius:10,
    
    
  },
  textdate:{
    fontSize:18,
  }
});
