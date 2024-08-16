// screens/ChallengesScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChallengesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>چالش‌های روزانه</Text>
      <Text style={styles.challenge}>🚶‍♂️ 5000 قدم</Text>
      <Text style={styles.challenge}>🚶‍♂️ 10000 قدم</Text>
      <Text style={styles.challenge}>🚶‍♂️ 15000 قدم</Text>
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
});
