import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Pedometer } from 'expo-sensors';

export default function HomeScreen({ navigation }) {
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');

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
    });

    // پاک‌سازی بعد از استفاده
    return () => subscription && subscription.remove();
  }, []);

  const distance = (stepCount * 0.000762).toFixed(2); // محاسبه مسافت طی شده بر اساس تعداد قدم‌ها

  return (
    <View style={styles.container}>
      <Text style={styles.text}>قدم‌شمار در دسترس: {isPedometerAvailable}</Text>
      <Text style={styles.text}>تعداد قدم‌ها: {stepCount}</Text>
      <Text style={styles.text}>مسافت طی شده: {distance} کیلومتر</Text>
      <Button title="مشاهده نقشه" onPress={() => navigation.navigate('Map')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
});
