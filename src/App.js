import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './SplashScreen';
import LoginScreen from './LoginScreen';
import ManualScreen from './ManualScreen';
import HomeScreen from './HomeScreen';
import NotificationScreen from './NotificationScreen';
import ProfileScreen from './ProfileScreen';
import { Alert } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// 순환 색상 배열
const colorPalette = [
  '#d1e7ff',
  '#ffd1d1',
  '#d1ffd1',
  '#ffe6b3',
  '#fff3d1',
  '#f3d1ff',
  '#f0ffff',
];

const firebaseConfig = {
  apiKey: "AIzaSyCAtbItawYDII4FhkNRVX90PGYs5OyG2nw",
  authDomain: "hannoti-50b2b.firebaseapp.com",
  projectId: "hannoti-50b2b",
  storageBucket: "hannoti-50b2b.firebasestorage.app",
  messagingSenderId: "563915267715",
  appId: "1:563915267715:web:93dc752cb86d7cab4a05b6",
  measurementId: "G-7CSDGXXJY9"
};

const Stack = createStackNavigator();

export default function App() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);


  const [loaded, setLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showManual, setShowManual] = useState(true);

  if (!loaded) {
    return <SplashScreen onLoaded={() => setLoaded(true)} />;
  }

  if (!loggedIn) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          setLoggedIn(true);
        }}
      />
    );
  }

  if (showManual) {
    return <ManualScreen onComplete={() => setShowManual(false)} />;
  }

  const handleLogout = () => {
    setLoggedIn(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" options={{ headerShown: false }}>
          {(props) => (
            <HomeScreen
              {...props}
              subjects={initialSubjects}
              onSubjectClick={(subject) =>
                Alert.alert(`선택된 과목: ${subject.title}`, subject.details)
              }
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="NotificationScreen"
          component={NotificationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ProfileScreen" options={{ headerShown: false }}>
          {(props) => <ProfileScreen {...props} onLogout={handleLogout} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
