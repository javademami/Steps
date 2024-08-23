import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import TargetsScreen from '../screens/TargetsScreen';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; // تغییر مسیر به مکان درست فایل

const HomeStack = createStackNavigator();
const MapStack = createStackNavigator();
const ChallengesStack = createStackNavigator();
const TargetsStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const screenOptions = (route, navigation) => ({
    tabBarIcon: ({ color, size }) => {
      let iconName;
      if (route.name === 'HomeTab') {
        iconName = 'home';
      } else if (route.name === 'MapTab') {
        iconName = 'map';
      } else if (route.name === 'ChallengesTab') {
        iconName = 'trophy';
      } else if (route.name === 'TargetsTab') {
        iconName = 'cube-outline';
      }
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    headerStyle: {
      backgroundColor: isDarkMode ? '#333' : '#fff',
    },
    headerTintColor: isDarkMode ? '#fff' : '#000',
    headerTitleAlign: 'left',
    headerLeft: (props) => route.name !== 'HomeTab' && (
      <Ionicons 
        name="arrow-back" 
        size={24} 
        color={isDarkMode ? '#fff' : '#000'} 
        style={{ marginLeft: 15 }} 
        onPress={() => navigation.goBack()} 
      />
    ),
    headerRight: () => (
      <Ionicons 
        name={isDarkMode ? 'sunny' : 'moon'} 
        size={24} 
        color={isDarkMode ? '#fff' : '#000'} 
        style={{ marginRight: 15 }} 
        onPress={toggleTheme} 
      />
    ),
  });

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route, navigation }) => screenOptions(route, navigation)}>
        <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: '' }} />
        <Tab.Screen name="MapTab" component={MapStackNavigator} options={{ title: '' }} />
        <Tab.Screen name="ChallengesTab" component={ChallengesStackNavigator} options={{ title: '' }} />
        <Tab.Screen name="TargetsTab" component={TargetsStackNavigator} options={{ title: '' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
  </HomeStack.Navigator>
);

const MapStackNavigator = () => (
  <MapStack.Navigator screenOptions={{ headerShown: false }}>
    <MapStack.Screen name="MapScreen" component={MapScreen} />
  </MapStack.Navigator>
);

const ChallengesStackNavigator = () => (
  <ChallengesStack.Navigator screenOptions={{ headerShown: false }}>
    <ChallengesStack.Screen name="ChallengesScreen" component={ChallengesScreen} />
  </ChallengesStack.Navigator>
);

const TargetsStackNavigator = () => (
  <TargetsStack.Navigator screenOptions={{ headerShown: false }}>
    <TargetsStack.Screen name="TargetsScreen" component={TargetsScreen} />
  </TargetsStack.Navigator>
);

export default AppNavigator;
