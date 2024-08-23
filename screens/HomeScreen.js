import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList } from 'react-native';
import * as Progress from 'react-native-progress';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ route, navigation }) {
  const [stepCount, setStepCount] = useState(0);
  const [dailyDistances, setDailyDistances] = useState({});
  const [target, setTarget] = useState(route.params?.target || 1000);
  const [startTime, setStartTime] = useState(null); // زمان شروع
  const [timeSpent, setTimeSpent] = useState(0); // زمان سپری‌شده
  const [calories, setCalories] = useState(0);

  useEffect(() => {
    const getPermissions = async () => {
      if (Device.isDevice) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('مجوز فعالیت فیزیکی و موقعیت مکانی مورد نیاز است.');
          return;
        }
      }
      startPedometer();
    };

    const startPedometer = async () => {
      const available = await Pedometer.isAvailableAsync();
      if (available) {
        const subscription = Pedometer.watchStepCount(result => {
          updateStepCount(result.steps);
        });
        setStartTime(new Date()); // ذخیره زمان شروع
        return () => subscription.remove();
      }
    };

    getPermissions();
  }, []);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = (now - startTime) / 1000 / 60; // محاسبه زمان سپری‌شده به دقیقه
        setTimeSpent(diff.toFixed(1));
      }, 1000); // هر ثانیه زمان را به‌روز می‌کند

      return () => clearInterval(interval); // پاک‌سازی تایمر
    }
  }, [startTime]);

  const updateStepCount = async (steps) => {
    let prevSteps = await AsyncStorage.getItem('stepCount');
    prevSteps = prevSteps ? parseInt(prevSteps, 10) : 0;
    const updatedSteps = steps + prevSteps;
    setStepCount(updatedSteps);
    await AsyncStorage.setItem('stepCount', updatedSteps.toString());

    saveDistance(updatedSteps);
    calculateCalories(updatedSteps);
  };

  const saveDistance = async (steps) => {
    const distance = (steps * 0.000762).toFixed(2); // محاسبه مسافت
    const date = new Date().toISOString().split('T')[0];
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

  const calculateCalories = (steps) => {
    const burnedCalories = (steps / 1000) * 50; // فرض بر 50 کالری برای هر 1000 قدم
    setCalories(burnedCalories.toFixed(1));
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

  useEffect(() => {
    if (route.params?.target) {
      setTarget(route.params.target);
    }
  }, [route.params?.target]);

  const formatMonth = (month) => {
    return month.slice(0, 3).toUpperCase();
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = formatMonth(date.toLocaleString('default', { month: 'long' }));
    return `${day} ${month}`;
  };

  const progress = stepCount > target ? 1 : stepCount / target;
  const distance = (stepCount * 0.000762).toFixed(2); // فرضیه 0.000762 کیلومتر به ازای هر قدم

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Progress.Circle
          size={220}
          progress={progress}
          showsText={true}
          formatText={() => `${stepCount} قدم`}
          textStyle={styles.overlayText}
          thickness={16}
          color={'#fb8c00'}
          unfilledColor={'#e0e0e0'}
          borderWidth={0}
        />
        <View style={styles.stepCountOverlay}>
          <Text>/{target}</Text>
        </View>
      </View>

      {/* قسمت گزارش سه ستونه */}
      <View style={styles.reportContainer}>
        <View style={styles.reportColumn}>
          <Text style={styles.reportValue}>{distance}</Text>
          <Text style={styles.reportLabel}>کیلومتر</Text>
        </View>
        <View style={styles.reportColumn}>
          <Text style={styles.reportValue}>{timeSpent}</Text>
          <Text style={styles.reportLabel}>دقیقه</Text>
        </View>
        <View style={styles.reportColumn}>
          <Text style={styles.reportValue}>{calories}</Text>
          <Text style={styles.reportLabel}>کالری</Text>
        </View>
      </View>

      {/* کارت‌های اسلایدر به صورت هوریزنتال */}
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        {Object.keys(dailyDistances).map((date) => (
          <View key={date} style={styles.card}>
            <Text style={styles.cardDate}>{getFormattedDate(date)}</Text>
            <Text style={styles.cardDistance}>{dailyDistances[date]} km</Text>
            <Progress.Circle
              size={50}
              progress={parseFloat(dailyDistances[date]) / target}
              showsText={false}
              thickness={6}
              color={'#fb8c00'}
            />
          </View>
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
    backgroundColor: (props) => props.isDarkMode ? '#000' : '#fff',
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
    color: (props) => props.isDarkMode ? '#fff' : '#000',
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
    position: 'relative',
    
  },
  stepCountOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -20 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  reportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    width: '100%',
  },
  reportColumn: {
    alignItems: 'center',
  },
  reportValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  reportLabel: {
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    marginTop: 20,
  },
  card: {
    width: 100,
    height:140,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDate: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight:   'bold',
  },
  cardDistance: {
    fontSize: 14,
    marginBottom: 5,
  },
});
