import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import * as Progress from 'react-native-progress';
import { Pedometer } from 'expo-sensors';
import { Picker } from '@react-native-picker/picker';

const screenWidth = Dimensions.get('window').width;

export default function TargetsScreen({ navigation }) {
  const [stepCount, setStepCount] = useState(0);
  const [target, setTarget] = useState(1000);
  const [targets] = useState([
    1000, 2500, 5000, 7000, 9000, 12000, 15000, 20000, 25000, 30000,
    40000, 50000, 60000, 70000, 80000, 90000, 100000,
  ]);

  useEffect(() => {
    const startPedometer = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (isAvailable) {
        const subscription = Pedometer.watchStepCount(result => {
          setStepCount(result.steps);
        });

        return () => subscription.remove();
      } else {
        console.log('Pedometer is not available on this device.');
      }
    };

    startPedometer();
  }, []);

  const handleTargetChange = (value) => {
    const selectedTarget = parseInt(value, 10);
    setTarget(selectedTarget);
    navigation.navigate('HomeScreen', { target: selectedTarget });
  };

  const progress = stepCount > target ? 1 : stepCount / target;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>تارگت روزانه</Text>
      <Picker
        selectedValue={target.toString()}
        style={styles.picker}
        onValueChange={handleTargetChange}
      >
        {targets.map((value) => (
          <Picker.Item key={value} label={`${value} قدم`} value={value.toString()} />
        ))}
      </Picker>

      <View style={styles.progressContainer}>
        <Progress.Circle
          size={220}
          progress={progress}
          showsText={true}
          formatText={() => `${stepCount} / ${target}`}
          textStyle={styles.overlayText}
          thickness={16}
          color={'#fb8c00'}
          unfilledColor={'#e0e0e0'}
          borderWidth={0}
        />
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
  header: {
    fontSize: 28,
    marginBottom: 20,
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  picker: {
    width: screenWidth - 40,
    height: 50,
    marginBottom: 20,
  },
});
