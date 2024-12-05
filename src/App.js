import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './SplashScreen';
import LoginScreen from './LoginScreen';
import ManualScreen from './ManualScreen';
import HomeScreen from './HomeScreen';
import NotificationScreen from './NotificationScreen';
import ProfileScreen from './ProfileScreen';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const firebaseConfig = {
  apiKey: 'AIzaSyCAtbItawYDII4FhkNRVX90PGYs5OyG2nw',
  authDomain: 'hannoti-50b2b.firebaseapp.com',
  projectId: 'hannoti-50b2b',
  storageBucket: 'hannoti-50b2b.firebasestorage.app',
  messagingSenderId: '563915267715',
  appId: '1:563915267715:web:93dc752cb86d7cab4a05b6',
  measurementId: 'G-7CSDGXXJY9',
};

const Stack = createStackNavigator();

// ✅ 알림 권한 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const [loaded, setLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showManual, setShowManual] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [username, setUsername] = useState('');
  const [realName, setRealName] = useState('');
  const [trackName, setTrackName] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const savedLoggedIn = await AsyncStorage.getItem('loggedIn');
      if (savedLoggedIn === 'true') {
        const userAssignments = JSON.parse(
          await AsyncStorage.getItem('assignments')
        );
        const userLectures = JSON.parse(await AsyncStorage.getItem('lectures'));
        const userUsername = await AsyncStorage.getItem('username');
        const userRealName = await AsyncStorage.getItem('realName');
        const userTrackName = await AsyncStorage.getItem('trackName');

        setLoggedIn(true);
        setAssignments(userAssignments || []);
        setLectures(userLectures || []);
        setUsername(userUsername || '');
        setRealName(userRealName || '');
        setTrackName(userTrackName || '');
      }
    };

    checkSession();
  }, []);

  if (!loaded) {
    return <SplashScreen onLoaded={() => setLoaded(true)} />;
  }

  if (!loggedIn) {
    return (
      <LoginScreen
        onLoginSuccess={(
          userAssignments,
          userLectures,
          userUsername,
          userRealName,
          userTrackName
        ) => {
          setLoggedIn(true);
          AsyncStorage.setItem('loggedIn', 'true');
          AsyncStorage.setItem('assignments', JSON.stringify(userAssignments));
          AsyncStorage.setItem('lectures', JSON.stringify(userLectures));
          AsyncStorage.setItem('username', userUsername);
          AsyncStorage.setItem('realName', userRealName);
          AsyncStorage.setItem('trackName', userTrackName);
          setAssignments(userAssignments);
          setLectures(userLectures);
          setUsername(userUsername);
          setRealName(userRealName);
          setTrackName(userTrackName);
        }}
      />
    );
  }

  if (showManual) {
    return <ManualScreen onComplete={() => setShowManual(false)} />;
  }

  const handleLogout = () => {
    setLoggedIn(false);
    AsyncStorage.setItem('loggedIn', 'false');
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" options={{ headerShown: false }}>
          {(props) => (
            <HomeScreen
              {...props}
              lectures={lectures}
              assignments={assignments}
            />
          )}
        </Stack.Screen>
        {/* 수정된 부분 */}
        <Stack.Screen
          name="NotificationScreen"
          options={{ headerShown: false }}
        >
          {(props) => (
            <NotificationScreen
              {...props}
              lectures={lectures}
              assignments={assignments}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ProfileScreen" options={{ headerShown: false }}>
          {(props) => (
            <ProfileScreen
              {...props}
              username={username}
              real_name={realName}
              track_name={trackName}
              onLogout={handleLogout}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
