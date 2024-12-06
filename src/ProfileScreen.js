import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 프로필 화면
const ProfileScreen = ({ onLogout, username, real_name, track_name }) => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('profile');

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
    if (tab === 'home') {
      navigation.navigate('HomeScreen');
    } else if (tab === 'alarm') {
      navigation.navigate('NotificationScreen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>프로필</Text>
        <View style={styles.infoContainer}>
          {/* 이름 표시 */}
          <View style={styles.infoRow}>
            <Image
              source={require('../assets/user-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.infoLabel}>이름</Text>
            <Text style={styles.infoText}>{real_name}</Text>
          </View>
          {/* 학번 표시 */}
          <View style={styles.infoRow}>
            <Image
              source={require('../assets/id-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.infoLabel}>학번</Text>
            <Text style={styles.infoText}>{username}</Text>
          </View>
          {/* 소속 표시 */}
          <View style={styles.infoRow}>
            <Image
              source={require('../assets/school-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.infoLabel}>소속</Text>
            <Text style={styles.infoText}>{track_name}</Text>
          </View>
        </View>
        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* 하단 네비게이션 바 */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          onPress={() => handleTabPress('home')}
          style={styles.navButton}
        >
          <Image
            source={
              selectedTab === 'home'
                ? require('../assets/home-1.png')
                : require('../assets/home-2.png')
            }
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabPress('alarm')}
          style={styles.navButton}
        >
          <Image
            source={
              selectedTab === 'alarm'
                ? require('../assets/alarm-1.png')
                : require('../assets/alarm-2.png')
            }
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabPress('profile')}
          style={styles.navButton}
        >
          <Image
            source={
              selectedTab === 'profile'
                ? require('../assets/profile-1.png')
                : require('../assets/profile-2.png')
            }
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    width: 35,
    height: 35,
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#0C71B1',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 50,
    alignSelf: 'center',
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  navigationBar: {
    position: 'absolute', // 위치를 고정
    bottom: 0, // 화면 하단에 고정
    width: '100%', // 화면 너비 전체 사용
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    borderTopWidth: 3,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    left: 0,
    right: 0,
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    width: 70,
    height: 30,
  },
});

export default ProfileScreen;
