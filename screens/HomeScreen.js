import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import * as Progress from 'react-native-progress';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ route }) {
  const [stepCount, setStepCount] = useState(0);
  const [dailyDistances, setDailyDistances] = useState({});
  const [target, setTarget] = useState(route.params?.target || 1000);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [calories, setCalories] = useState(0);
  const [challenges, setChallenges] = useState([]);
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

  useEffect(() => {
    if (route.params?.target) {
      setTarget(route.params.target);
    }
  }, [route.params?.target]);

  const updateStepCount = async (steps) => {
    let prevSteps = await AsyncStorage.getItem('stepCount');
    prevSteps = prevSteps ? parseInt(prevSteps, 10) : 0;
    const updatedSteps = steps + prevSteps;
    setStepCount(updatedSteps);
    await AsyncStorage.setItem('stepCount', updatedSteps.toString());

    saveDistance(updatedSteps);
    calculateCalories(updatedSteps);
    updateChallengeProgress(updatedSteps);
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

  const loadChallenges = async () => {
    try {
      const challengesData = await AsyncStorage.getItem('challenges');
      return challengesData ? JSON.parse(challengesData) : [];
    } catch (error) {
      console.error("Error loading challenges", error);
    }
  };

  const saveChallenges = async (challenges) => {
    try {
      await AsyncStorage.setItem('challenges', JSON.stringify(challenges));
    } catch (error) {
      console.error("Error saving challenges", error);
    }
  };

  const updateChallengeProgress = async (steps) => {
    try {
      let challenges = await loadChallenges();

      challenges = challenges.map(challenge => {
        if (steps >= challenge.steps && !challenge.completed) {
          challenge.completed = true;
        }
        return challenge;
      });

      await saveChallenges(challenges);

      const achieved = challenges.filter(challenge => challenge.completed);
      setAchievedChallenges(achieved);
    } catch (error) {
      console.error("Error updating challenge progress", error);
    }
  };

  useEffect(() => {
    const loadInitialChallenges = async () => {
      const storedChallenges = await loadChallenges();
      if (storedChallenges.length > 0) {
        setChallenges(storedChallenges);
      } else {
        const initialChallenges = [
          { id: 1, title: 'فاصله از مبل', steps: 3000, completed: false },
          { id: 2, title: 'تناسب اندام', steps: 7000, completed: false },
          { id: 3, title: 'روز سلامت', steps: 10000, completed: false },
          { id: 4, title: 'روز لاغری', steps: 14000, completed: false },
          { id: 5, title: 'کوهنورد', steps: 20000, completed: false },
          { id: 6, title: 'کاوشگر', steps: 30000, completed: false },
          { id: 7, title: 'قهرمان', steps: 40000, completed: false },
          { id: 8, title: 'پیروز', steps: 60000, completed: false },
        ];
        setChallenges(initialChallenges);
        await saveChallenges(initialChallenges);
      }
    };

    loadInitialChallenges();
  }, []);

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    return `${day} ${month}`;
  };

  // Update this function to get data for the last 5 days
  const getLast5DaysData = () => {
    const dates = [];
    const distances = [];
    const today = new Date();

    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];
      dates.push(formattedDate);
      distances.push(dailyDistances[formattedDate] ? parseFloat(dailyDistances[formattedDate]) : 0);
    }

    return { labels: dates.map(date => getFormattedDate(date)), datasets: [{ data: distances }] };
  };

  const chartData = getLast5DaysData();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressContainer}>
        <Progress.Circle
          size={220}
          progress={stepCount > target ? 1 : stepCount / target}
          showsText={true}
          formatText={() => `${stepCount} قدم`}
          textStyle={styles.overlayText}
          thickness={16}
          color={'#3DBCCB'}
          unfilledColor={'#e0e0e0'}
          borderWidth={0}
        />
        <View style={styles.stepCountOverlay}>
          <Text>/{target}</Text>
        </View>
      </View>

      <View style={styles.reportContainer}>
        <View style={styles.reportColumn}>
          <Ionicons name="footsteps-outline" size={24} color="#fff" />
          <Text style={styles.reportValue}>{(stepCount * 0.000762).toFixed(2)}</Text>
          <Text style={styles.reportLabel}>کیلومتر</Text>
        </View>
        <View style={styles.reportColumn}>
          <Ionicons name="alarm-outline" size={24} color="#fff" />
          <Text style={styles.reportValue}>{timeSpent}</Text>
          <Text style={styles.reportLabel}>دقیقه</Text>
        </View>
        <View style={styles.reportColumn}>
          <Ionicons name="flame-outline" size={24} color="#fff" />
          <Text style={styles.reportValue}>{calories}</Text>
          <Text style={styles.reportLabel}>کالری</Text>
        </View>
      </View>

      {/* Display daily distances */}
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
              color={'#3DBCCB'}
            />
          </View>
        ))}
      </ScrollView>

      {/* Display completed challenges */}
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.challengeScrollContainer}>
        {achievedChallenges.length > 0 ? (
          achievedChallenges.map(challenge => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeContent}>
                <Ionicons name="medal-outline" size={24} color="#3DBCCB" />
                
              </View>
              <View style={styles.challengeTextContainer}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeSteps}>{challenge.steps} قدم</Text>
                <Text style={styles.challengeTarget}>وضعیت: تکمیل شد</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noChallengesText}>هنوز چالشی تکمیل نشده</Text>
        )}
      </ScrollView>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={screenWidth-40}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundGradientFrom: '#3DBCCB',
            backgroundGradientFromOpacity: 1,
            backgroundGradientTo: '#3DBCCB',
            backgroundGradientToOpacity: 1,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // رنگ میله‌ها سفید
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // رنگ متن سفید
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              fontWeight: 'bold', // کلفت کردن متن تاریخ
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            backgroundColor: '#3DBCCB', // رنگ پس‌زمینه نمودار
          }}
        />
      </View>

      <View style={styles.space}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
    position: 'relative',
  },
  stepCountOverlay: {
    position: 'absolute',
    top: '65%',
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
    backgroundColor:'#3DBCCB',
    borderRadius:10,
    padding:10,
    width: '100%',
  },
  reportColumn: {
    alignItems: 'center',
  },
  reportValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  reportLabel: {
    fontSize: 16,
    color: '#fff',
  },
  scrollContainer: {
    marginTop: 10,
    width: '100%',
  },
  challengeScrollContainer: {
    marginTop: 10,
    width: '100%',
  },
  card: {
    width: 160,
    height: 140,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3DBCCB',
    textAlign: 'center',
  },
  cardDistance: {
    fontSize: 14,
   
    color: '#004d40',
  },
  challengeCard: {
    width: 160,
    height: 140,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // فاصله بین آیکن و تعداد قدم
  },
  challengeSteps: {
    fontSize: 12,
    backgroundColor: '#3DBCCB',
    borderRadius: 10,
    
    
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical:3,
  },
  challengeTextContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3DBCCB',
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
  chartContainer: {
    marginTop: 20,
  },
  space: {
    height: 30,
  },
});
