import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Button, Alert, TextInput, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; // Import from expo-image-picker

const screenWidth = Dimensions.get('window').width;

export default function TargetsScreen({ navigation }) {
  const [target, setTarget] = useState(1000);
  const [height, setHeight] = useState(170); // Default height
  const [weight, setWeight] = useState(70);  // Default weight
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    loadUserInfo();
    loadTarget();  // Load target value when component mounts
  }, []);

  const loadUserInfo = async () => {
    try {
      const savedHeight = await AsyncStorage.getItem('userHeight');
      const savedWeight = await AsyncStorage.getItem('userWeight');
      const savedProfileImage = await AsyncStorage.getItem('profileImage');
      const savedUsername = await AsyncStorage.getItem('username');
      if (savedHeight) setHeight(parseInt(savedHeight, 10));
      if (savedWeight) setWeight(parseInt(savedWeight, 10));
      if (savedProfileImage) setProfileImage(savedProfileImage);
      if (savedUsername) setUsername(savedUsername);
    } catch (error) {
      console.error("Error loading user info", error);
    }
  };

  const loadTarget = async () => {
    try {
      const savedTarget = await AsyncStorage.getItem('dailyTarget');
      if (savedTarget) setTarget(parseInt(savedTarget, 10));
    } catch (error) {
      console.error("Error loading target", error);
    }
  };

  const saveUserInfo = async () => {
    try {
      await AsyncStorage.setItem('userHeight', height.toString());
      await AsyncStorage.setItem('userWeight', weight.toString());
      await AsyncStorage.setItem('dailyTarget', target.toString());  // Save target
      await AsyncStorage.setItem('profileImage', profileImage || '');
      await AsyncStorage.setItem('username', username);
      Alert.alert("اطلاعات با موفقیت ذخیره شد!");

      // Navigate to HomeScreen with updated target value
      navigation.navigate('HomeScreen', { target });
    } catch (error) {
      console.error("Error saving user info", error);
    }
  };

  const handleTargetChange = (value) => {
    setTarget(parseInt(value, 10));
  };

  const handleImagePicker = async () => {
    // Ask the user for permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch the image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.ax}>
            {profileImage && (
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      )}
      <Text style={styles.intro}>خوش آمدی</Text>
      <Text style={styles.welcome}>{username}</Text>
      </View>
       
      <Text style={styles.header}>آپلود عکس پروفایل</Text>
      <Button title="انتخاب عکس" onPress={handleImagePicker} color="#3DBCCB"/>
     
      <Text style={styles.header}>نام کاربری</Text>
      <TextInput
        style={styles.textInput}
        placeholder="نام خود را وارد کنید"
        value={username}
        onChangeText={setUsername}
      />
      <Text style={styles.header}>تارگت روزانه</Text>
      <Picker
        selectedValue={target.toString()}
        style={styles.picker}
        onValueChange={(value) => handleTargetChange(value)}
      >
        {[1000, 2500, 5000, 7000, 9000, 12000, 15000, 20000, 25000, 30000].map(value => (
          <Picker.Item key={value} label={`${value} قدم`} value={value.toString()} />
        ))}
      </Picker>

      <Text style={styles.header}>قد (سانتی‌متر)</Text>
      <Picker
        selectedValue={height.toString()}
        style={styles.picker}
        onValueChange={(value) => setHeight(parseInt(value, 10))}
      >
        {Array.from({ length: 51 }, (_, i) => 150 + i).map(value => (
          <Picker.Item key={value} label={`${value}`} value={value.toString()} />
        ))}
      </Picker>

      <Text style={styles.header}>وزن (کیلوگرم)</Text>
      <Picker
        selectedValue={weight.toString()}
        style={styles.picker}
        onValueChange={(value) => setWeight(parseInt(value, 10))}
      >
        {Array.from({ length: 131 }, (_, i) => 50 + i).map(value => (
          <Picker.Item key={value} label={`${value}`} value={value.toString()} />
        ))}
      </Picker>

      <View style={styles.buttonContainer}>
        <Button
          title="ذخیره"
          onPress={saveUserInfo}
          color="#3DBCCB"
          accessibilityLabel="ذخیره اطلاعات"
        />
      </View>
      <View style={styles.space}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  header: {
    fontSize: 24,
    marginVertical: 10,
    textAlign: 'center',
  },
  picker: {
    width: screenWidth - 40,
    height: 60,
    marginBottom: 20,
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: 20,
    width: screenWidth - 40,
  },
  profileImage: {
    width: 100, // Adjust width as needed
    height: 100, // Adjust height as needed
    borderRadius: 50, // Makes the image circular
    marginVertical: 10,
    borderColor: '#fff',
    borderWidth:1,
  },
  textInput: {
    width: screenWidth - 40,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  ax: {
    width:screenWidth,
    height:250,
    backgroundColor:'#3DBCCB',
    alignItems: 'center',
    paddingVertical:40,
    borderBottomEndRadius:30,
    borderBottomLeftRadius:30,
    
  },
  welcome:{
   color: '#fff',
   fontSize:20,
   fontWeight: 'bold',
  },
  intro:{
    color: '#fff',
    fontSize:14,
    
   },
   space:{
    height:40,
   }
  
});
