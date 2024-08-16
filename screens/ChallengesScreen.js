import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pedometer } from 'expo-sensors';

export default function ChallengesScreen() {
  const [stepCount, setStepCount] = useState(0);
  const [challenges, setChallenges] = useState([
    { goal: 5000, completed: false },
    { goal: 10000, completed: false },
    { goal: 15000, completed: false },
  ]);

  useEffect(() => {
    const startPedometer = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (isAvailable) {
        const subscription = Pedometer.watchStepCount(result => {
          setStepCount(result.steps);
          updateChallenges(result.steps);
        });

        return () => subscription.remove();
      } else {
        console.log('Pedometer is not available on this device.');
      }
    };

    startPedometer();
  }, []);

  const updateChallenges = (steps) => {
    setChallenges(challenges.map(challenge => ({
      ...challenge,
      completed: steps >= challenge.goal,
    })));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>چالش‌های روزانه</Text>
      {challenges.map((challenge, index) => (
        <Text
          key={index}
          style={[
            styles.challenge,
            challenge.completed ? styles.completed : null
          ]}
        >
          🚶‍♂️ {challenge.goal} قدم {challenge.completed ? "✅" : ""}
        </Text>
      ))}
      <Text style={styles.stepCount}>تعداد قدم‌های شما: {stepCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    marginBottom: 20,
  },
  challenge: {
    fontSize: 20,
    marginVertical: 10,
  },
  completed: {
    color: 'green',
    textDecorationLine: 'line-through',
  },
  stepCount: {
    marginTop: 20,
    fontSize: 18,
  },
});
