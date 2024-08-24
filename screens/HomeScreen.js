import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
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
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [calories, setCalories] = useState(0);
  const [challenges, setChallenges] = useState([
    { id: 1, name: 'Challenge 1', targetSteps: 5000 },
    { id: 2, name: 'Challenge 2', targetSteps: 10000 },
    { id: 3, name: 'Challenge 3', targetSteps: 15000 },
  ]);
  const [achievedChallenges, setAchievedChallenges] = useState([]);

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
        setStartTime(new Date());
        return () => subscription.remove();
      }
    };

    getPermissions();
  }, []);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = (now - startTime) / 1000 / 60;
        setTimeSpent(diff.toFixed(1));
      }, 1000);

      return () => clearInterval(interval);
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

  const calculateCalories = (steps) => {
    const burnedCalories = (steps / 1000) * 50;
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

  useEffect(() => {
    const achievedChallenges = challenges.filter(challenge => stepCount >= challenge.targetSteps);
    setAchievedChallenges(achievedChallenges);
    console.log('Achieved challenges:', achievedChallenges);
  }, [stepCount, challenges]);

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

      {/* نمایش چالش‌های دست یافته */}
      {/* نمایش مسافت‌های روزانه */}
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
      <View style={styles.challengesContainer}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
          {achievedChallenges.length > 0 ? (
            achievedChallenges.map(challenge => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeContent}>
                  <Text style={styles.challengeSteps}>{stepCount}</Text>
                </View>
                <View style={styles.challengeTextContainer}>
                  <Text style={styles.challengeTitle}>{challenge.name}</Text>
                  <Text style={styles.challengeTarget}>Target: {challenge.targetSteps} steps</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noChallengesText}></Text>
          )}
        </ScrollView>
      </View>

      
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
    height: 140,
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
    fontWeight: 'bold',
  },
  cardDistance: {
    fontSize: 14,
    marginBottom: 5,
  },
  challengesContainer: {
    width: '100%',
    marginBottom: 20,
  },
  challengeCard: {
    width: 160,
    height: 140,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#e0f7fa',
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#00bcd4',
    borderWidth: 1,
  },
  challengeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeSteps: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00796b',
  },
  challengeTextContainer: {
    flex: 2,
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
  challengeTarget: {
    fontSize: 14,
    color: '#004d40',
  },
  noChallengesText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
});
