import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

export default function TargetsScreen({ navigation }) {
  const [target, setTarget] = useState(1000);
  const [height, setHeight] = useState(170); // Default height
  const [weight, setWeight] = useState(70);  // Default weight

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const savedHeight = await AsyncStorage.getItem('userHeight');
      const savedWeight = await AsyncStorage.getItem('userWeight');
      if (savedHeight) setHeight(parseInt(savedHeight, 10));
      if (savedWeight) setWeight(parseInt(savedWeight, 10));
    } catch (error) {
      console.error("Error loading user info", error);
    }
  };

  const saveUserInfo = async () => {
    try {
      await AsyncStorage.setItem('userHeight', height.toString());
      await AsyncStorage.setItem('userWeight', weight.toString());
      alert("اطلاعات با موفقیت ذخیره شد!");
    } catch (error) {
      console.error("Error saving user info", error);
    }
  };

  const handleTargetChange = (value) => {
    setTarget(parseInt(value, 10));
    navigation.navigate('HomeScreen', { target: parseInt(value, 10) });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>تارگت روزانه</Text>
      <Picker selectedValue={target.toString()} style={styles.picker} onValueChange={handleTargetChange}>
        {[1000, 2500, 5000, 7000, 9000, 12000, 15000, 20000, 25000, 30000].map(value => (
          <Picker.Item key={value} label={`${value} قدم`} value={value.toString()} />
        ))}
      </Picker>

      <Text style={styles.header}>قد (سانتی‌متر)</Text>
      <Picker selectedValue={height.toString()} style={styles.picker} onValueChange={(value) => setHeight(parseInt(value, 10))}>
        {Array.from({ length: 51 }, (_, i) => 150 + i).map(value => (
          <Picker.Item key={value} label={`${value}`} value={value.toString()} />
        ))}
      </Picker>

      <Text style={styles.header}>وزن (کیلوگرم)</Text>
      <Picker selectedValue={weight.toString()} style={styles.picker} onValueChange={(value) => setWeight(parseInt(value, 10))}>
        {Array.from({ length: 131 }, (_, i) => 50 + i).map(value => (
          <Picker.Item key={value} label={`${value}`} value={value.toString()} />
        ))}
      </Picker>

      <Button title="ذخیره اطلاعات" onPress={saveUserInfo} />
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
  header: {
    fontSize: 24,
    marginVertical: 10,
  },
  picker: {
    width: screenWidth - 40,
    height: 50,
    marginBottom: 20,
  },
});
