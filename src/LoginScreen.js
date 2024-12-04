import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Import Axios for HTTP requests

const firebaseConfig = {
  apiKey: "AIzaSyCAtbItawYDII4FhkNRVX90PGYs5OyG2nw",
  authDomain: "hannoti-50b2b.firebaseapp.com",
  projectId: "hannoti-50b2b",
  storageBucket: "hannoti-50b2b.firebasestorage.app",
  messagingSenderId: "563915267715",
  appId: "1:563915267715:web:93dc752cb86d7cab4a05b6",
  measurementId: "G-7CSDGXXJY9"
};

const LoginScreen = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load login data from AsyncStorage
  useEffect(() => {
    const loadLoginData = async () => {
      const savedUsername = await AsyncStorage.getItem('username');
      const savedPassword = await AsyncStorage.getItem('password');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      if (savedRememberMe === 'true') {
        setUsername(savedUsername || '');
        setPassword(savedPassword || '');
        setRememberMe(true);
      }
    };
    loadLoginData();
  }, []);

  // Handle login
  const handleLogin = async () => {
    try {
      // Firebase Cloud Functions endpoint 호출
      const response = await axios.post('https://loginwitheclass-bkvxpnghzq-du.a.run.app', { username, password });
      console.log("실행결과:", response.data)


      if (response.data.success) {
        if (rememberMe) {
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem('password', password);
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          await AsyncStorage.removeItem('username');
          await AsyncStorage.removeItem('password');
          await AsyncStorage.setItem('rememberMe', 'false');
        }
        onLoginSuccess();
      } else {
        setError(response.data.message || 'Unexpected error occurred. Please try again.');
        setPassword('');
      }
    } catch (error) {
      console.log(error);
      setError('Unexpected error occurred. Please try again.');
      setPassword('');
    }
  };


  return (
    <View style={styles.loginContainer}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <TextInput
        placeholder="학번"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="패스워드"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.passwordToggle}
        >
          <Image
            source={
              showPassword
                ? require('../assets/show-pass.png')
                : require('../assets/blind-pass.png')
            }
            style={styles.toggleIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={rememberMe}
          onValueChange={setRememberMe}
          color={rememberMe ? '#1d4ed8' : undefined}
        />
        <Text style={styles.checkboxText}>아이디/비밀번호 저장</Text>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f7f9fc',
  },
  logo: {
    width: '80%',
    height: 50,
    marginBottom: 40,
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  passwordToggle: {
    padding: 10,
  },
  toggleIcon: {
    width: 20,
    height: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  loginButton: {
    width: '80%',
    height: 45,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;