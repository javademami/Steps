import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import TargetsScreen from '../screens/TargetsScreen'; // اضافه کردن صفحه تارگت‌ها
import { Ionicons } from '@expo/vector-icons';

// ایجاد Navigator برای صفحه Home
const HomeStack = createStackNavigator();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ headerShown: false }} // حذف عنوان بالای صفحه
      />
    </HomeStack.Navigator>
  );
}

// ایجاد Navigator برای صفحه Map
const MapStack = createStackNavigator();
function MapStackNavigator() {
  return (
    <MapStack.Navigator>
      <MapStack.Screen 
        name="MapScreen" 
        component={MapScreen} 
        options={{ headerShown: false }} // حذف عنوان بالای صفحه
      />
    </MapStack.Navigator>
  );
}

// ایجاد Navigator برای صفحه Challenges
const ChallengesStack = createStackNavigator();
function ChallengesStackNavigator() {
  return (
    <ChallengesStack.Navigator>
      <ChallengesStack.Screen 
        name="ChallengesScreen" 
        component={ChallengesScreen} 
        options={{ headerShown: false }} // حذف عنوان بالای صفحه
      />
    </ChallengesStack.Navigator>
  );
}

// ایجاد Navigator برای صفحه Targets
const TargetsStack = createStackNavigator();
function TargetsStackNavigator() {
  return (
    <TargetsStack.Navigator>
      <TargetsStack.Screen 
        name="TargetsScreen" 
        component={TargetsScreen} 
        options={{ headerShown: false }} // حذف عنوان بالای صفحه
      />
    </TargetsStack.Navigator>
  );
}

// ایجاد Bottom Tab Navigator
const Tab = createBottomTabNavigator();
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'HomeTab') {
              iconName = 'home';
            } else if (route.name === 'MapTab') {
              iconName = 'map';
            } else if (route.name === 'ChallengesTab') {
              iconName = 'trophy';
            } else if (route.name === 'TargetsTab') {
              iconName = 'cube-outline'; // استفاده از آیکون معتبر
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeStackNavigator} 
          options={{ title: 'صفحه اصلی' }} 
        />
        <Tab.Screen 
          name="MapTab" 
          component={MapStackNavigator} 
          options={{ title: 'نقشه' }} 
        />
        <Tab.Screen 
          name="ChallengesTab" 
          component={ChallengesStackNavigator} 
          options={{ title: 'چالش‌ها' }} 
        />
        <Tab.Screen 
          name="TargetsTab" 
          component={TargetsStackNavigator} 
          options={{ title: 'تارگت‌ها' }} // اضافه کردن عنوان صفحه تارگت‌ها
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
