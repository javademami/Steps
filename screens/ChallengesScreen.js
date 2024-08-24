import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const challenges = [
  { id: 1, title: 'فاصله از مبل', steps: 3000 },
  { id: 2, title: 'تناسب اندام', steps: 7000 },
  { id: 3, title: 'روز سلامت', steps: 10000 },
  { id: 4, title: 'روز لاغری', steps: 14000 },
  { id: 5, title: 'کوهنورد', steps: 20000 },
  { id: 6, title: 'کاوشگر', steps: 30000 },
  { id: 7, title: 'قهرمان', steps: 40000 },
  { id: 8, title: 'پیروز', steps: 60000 },
];

export default function ChallengesScreen({ route }) {
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const totalSteps = route.params?.totalSteps || 0;

  useEffect(() => {
    const checkChallenges = async () => {
      let existingCompletedChallenges = await AsyncStorage.getItem('completedChallenges');
      existingCompletedChallenges = existingCompletedChallenges ? JSON.parse(existingCompletedChallenges) : [];

      challenges.forEach(async (challenge) => {
        if (totalSteps >= challenge.steps && !existingCompletedChallenges.includes(challenge.id)) {
          // چالش تکمیل شده است
          existingCompletedChallenges.push(challenge.id);
          await AsyncStorage.setItem('completedChallenges', JSON.stringify(existingCompletedChallenges));
          setCompletedChallenges(existingCompletedChallenges);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('تبریک!', `شما چالش "${challenge.title}" را کامل کردید!`);
        }
      });
    };

    checkChallenges();
  }, [totalSteps]);

  const renderChallenge = ({ item }) => {
    const isCompleted = completedChallenges.includes(item.id);

    return (
      <View style={[styles.challengeContainer, { opacity: isCompleted ? 1 : 0.3 }]}>
        <ImageBackground
          source={require('../assets/SilverMedal.png')}
          style={styles.medal}
          resizeMode="contain"
        >
          <Text style={styles.stepsText}>{item.steps}</Text>
          <Text style={styles.stepsLabel}>قدم</Text>
        </ImageBackground>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.challengeDate}>
          {isCompleted ? 'تاریخ دستیابی: امروز' : 'تاریخ دستیابی'}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={challenges}
      renderItem={renderChallenge}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2} // نمایش دو چالش در هر ردیف
      contentContainerStyle={styles.challengeList}
    />
  );
}

const styles = StyleSheet.create({
  challengeContainer: {
    flex: 1,
    alignItems: 'center',
    margin: 10,
    opacity: 0.3,
  },
  medal: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepsLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  challengeTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  challengeDate: {
    fontSize: 14,
    color: '#666',
  },
  challengeList: {
    justifyContent: 'center',
    paddingBottom: 20,
  },
});
