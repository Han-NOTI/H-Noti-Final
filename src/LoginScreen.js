import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCAtbItawYDII4FhkNRVX90PGYs5OyG2nw",
  authDomain: "hannoti-50b2b.firebaseapp.com",
  projectId: "hannoti-50b2b",
  storageBucket: "hannoti-50b2b.firebasestorage.app",
  messagingSenderId: "563915267715",
  appId: "1:563915267715:web:93dc752cb86d7cab4a05b6",
  measurementId: "G-7CSDGXXJY9"
};

export default function LoginScreen({ navigation }) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://loginwitheclass-bkvxpnghzq-du.a.run.app', {
        username,
        password,
      });
      const courses = response.data;
      navigation.navigate('Main', {
        screen: 'Home',
        params: { courses },
      });
    } catch (err) {
      console.error('로그인 실패:', err.response?.data || err.message);
      setError('로그인 실패. 사용자 정보를 확인해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 로고 */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* 사용자 입력 */}
      <TextInput
        placeholder="아이디"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        {/* 비밀번호 표시/숨기기 버튼 */}
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.passwordToggle}
        >
          <Image
            source={
              showPassword
                ? require('../assets/show-pass.png') // 비밀번호 표시 아이콘
                : require('../assets/blind-pass.png') // 비밀번호 숨기기 아이콘
            }
            style={styles.toggleIcon}
          />
        </TouchableOpacity>
      </View>

      {/* 에러 메시지 */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* 로그인 버튼 */}
      <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    padding: 20,
  },
  logo: {
    width: 150, // 로고 이미지 너비
    height: 50, // 로고 이미지 높이
    marginBottom: 40, // 아래 요소와 간격
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  passwordToggle: {
    padding: 10,
  },
  toggleIcon: {
    width: 20,
    height: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});