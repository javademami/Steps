import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Dimensions } from 'react-native';
import * as Progress from 'react-native-progress'; // جایگزین react-native-chart-kit
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ route, navigation }) {
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [dailyDistances, setDailyDistances] = useState({});
  const [target, setTarget] = useState(route.params?.target || 1000);

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
      setIsPedometerAvailable(String(available));

      if (available) {
        const subscription = Pedometer.watchStepCount(result => {
          setStepCount(result.steps);
          saveDistance(result.steps);
        });

        return () => subscription.remove();
      }
    };

    getPermissions();
  }, []);

  const saveDistance = async (steps) => {
    const distance = (steps * 0.000762).toFixed(2);
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

  const progress = stepCount > target ? 1 : stepCount / target;
  const distance = (stepCount * 0.000762).toFixed(2);

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
      <Text style={styles.text}>مسافت طی شده: {distance} کیلومتر</Text>
      <Button
        title={stepCount > target ? "توقف" : "شروع"}
        onPress={() => {/* Toggle the pedometer or any other functionality */}}
      />
      
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
    fontSize: 18,
    marginVertical: 10,
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
  scrollContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
  },
  textdate: {
    fontSize: 18,
  },
});
