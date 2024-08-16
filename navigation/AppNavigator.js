import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
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
      </Tab.Navigator>
    </NavigationContainer>
  );
}
