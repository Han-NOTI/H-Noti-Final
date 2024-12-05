import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// 로그인 화면
const LoginScreen = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

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

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://loginwitheclass-bkvxpnghzq-du.a.run.app',
        { username, password }
      );
      // 서버 응답 전체 출력
      console.log('Full Response:', response.data);

      if (response.data.success) {
        const userAssignments = response.data.data.assignments || [];
        const userLectures = response.data.data.lectures || [];
        const userUsername = response.data.data.username;
        const userRealName = response.data.data.real_name;
        const userTrackName = response.data.data.track_name;

        if (rememberMe) {
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem('password', password);
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          await AsyncStorage.removeItem('username');
          await AsyncStorage.removeItem('password');
          await AsyncStorage.setItem('rememberMe', 'false');
        }

        onLoginSuccess(
          userAssignments,
          userLectures,
          userUsername,
          userRealName,
          userTrackName
        );
      } else {
        setError(response.data.message || '로그인 실패. 다시 시도해주세요.');
        setPassword('');
      }
    } catch (error) {
      console.error('Login Error:', error);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      setPassword('');
    } finally {
      setLoading(false);
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
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="패스워드"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          autoCapitalize="none"
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
      <TouchableOpacity
        style={[styles.loginButton, loading && styles.loginButtonLoading]} // Apply additional style when loading
        onPress={handleLogin}
        disabled={loading} // Disable button while loading
      >
        <Text style={styles.loginButtonText}>
          {loading ? '강의 정보 불러오는 중...' : '로그인'}{' '}
          {/* Change button text while loading */}
        </Text>
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
    resizeMode: 'contain',
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
    resizeMode: 'contain',
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
  loginButtonLoading: {
    backgroundColor: '#ccc', // Gray background when loading
  },
});

export default LoginScreen;
