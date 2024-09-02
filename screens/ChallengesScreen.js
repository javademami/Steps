import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, Alert, Image } from 'react-native';
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
    const loadCompletedChallenges = async () => {
      try {
        const existingCompletedChallenges = await AsyncStorage.getItem('completedChallenges');
        if (existingCompletedChallenges) {
          setCompletedChallenges(JSON.parse(existingCompletedChallenges));
        }
      } catch (error) {
        console.error("Error loading completed challenges:", error);
      }
    };

    loadCompletedChallenges();
  }, []);

  useEffect(() => {
    const checkChallenges = async () => {
      try {
        let existingCompletedChallenges = await AsyncStorage.getItem('completedChallenges');
        existingCompletedChallenges = existingCompletedChallenges ? JSON.parse(existingCompletedChallenges) : [];

        const newCompletedChallenges = [...existingCompletedChallenges];

        challenges.forEach(async (challenge) => {
          if (totalSteps >= challenge.steps && !newCompletedChallenges.includes(challenge.id)) {
            newCompletedChallenges.push(challenge.id);

            await AsyncStorage.setItem('completedChallenges', JSON.stringify(newCompletedChallenges));

            setCompletedChallenges([...newCompletedChallenges]);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('تبریک!', `شما چالش "${challenge.title}" را کامل کردید!`);
          }
        });
      } catch (error) {
        console.error("Error checking challenges:", error);
      }
    };

    if (totalSteps > 0) {
      checkChallenges();
    }
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
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {/* اضافه کردن تصویر جام */}
        <Image
          source={require('../assets/cup.png')} // تصویر جام جدید
          style={styles.trophy}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>دستاوردها</Text> 
        <Text style={styles.angizeshi}>"دستاوردهای بزرگ از قدم‌های کوچک و پیوسته ساخته می‌شوند، هر قدمی که برمی‌داری، تو را یک قدم به رؤیاهایت نزدیک‌تر می‌کند."</Text>
      </View>

      <FlatList
        data={challenges}
        renderItem={renderChallenge}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.challengeList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius:10
    
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 0,
    backgroundColor: '#3DBCCB',
    height:320,
    paddingVertical:30,
    borderBottomEndRadius:30,
    borderBottomLeftRadius:30,
  },
  trophy: {
    width: 280,
    height: 160,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  challengeContainer: { 
    flex: 1, 
    alignItems: 'center', 
    margin: 10, 
    opacity: 0.3, 
    
  },
  medal: { 
    width: 120, 
    height: 120, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  stepsText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  stepsLabel: { 
    fontSize: 14, 
    color: '#fff', 
    marginTop: 5 
  },
  challengeTitle: { 
    marginTop: 10, 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  challengeDate: { 
    fontSize: 14, 
    color: '#666' 
  },
  challengeList: { 
    justifyContent: 'center', 
    paddingBottom: 20 ,
    
  },
  angizeshi: { 
    justifyContent: 'center', 
    color: '#fff' ,
    padding:10,
    fontSize:14,
    
  },
});
