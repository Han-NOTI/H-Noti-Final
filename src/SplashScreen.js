import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// 시작 로딩 화면
const SplashScreen = ({ onLoaded }) => {
  setTimeout(() => {
    onLoaded();
  }, 3000); // 3초 후 로딩 완료

  return (
    <View style={styles.splashScreen}>
      <Image source={require('../assets/bell.png')} style={styles.logoImage} />
      <Text style={styles.logoText}>한성 NOTI</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc', // 배경색 설정
  },
  logoImage: {
    width: 100, // 이미지 너비
    height: 100, // 이미지 높이
    marginBottom: 20, // 텍스트와의 간격
  },
  logoText: {
    fontSize: 40, // 텍스트 크기
    fontWeight: 'bold',
    color: '#1d4ed8', // 텍스트 색상
  },
});

export default SplashScreen;
