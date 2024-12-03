import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({ subjects = [] }) => {
  const [subjectList, setSubjectList] = useState(subjects);
  const [selectedTab, setSelectedTab] = useState('home');
  const navigation = useNavigation();

  const handleSubjectClick = (subject) => {
    Alert.alert('과목 선택', `${subject.title}의 수행할 업무가 출력됩니다.`);
    setSubjectList((prevSubjects) =>
      prevSubjects.filter((item) => item.title !== subject.title)
    );
  };

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
    if (tab === 'alarm') {
      navigation.navigate('NotificationScreen');
    } else if (tab === 'profile') {
      navigation.navigate('ProfileScreen');
    }
  };

  const handleRefresh = () => {
    setSubjectList(subjects);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
          >
            <Image
              source={require('../assets/refresh.png')}
              style={styles.refreshIcon}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={subjectList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSubjectClick(item)}
              style={[styles.subjectCard, { backgroundColor: item.color }]}
            >
              <Text style={styles.subjectTitle}>{item.title}</Text>
              <Text style={styles.subjectDetails}>{item.details}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.subjectList}
        />
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative', // 상대 위치를 사용하여 자식 요소를 배치
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, // 제목이 중앙에 위치하도록 설정
  },
  refreshButton: {
    position: 'absolute', // 절대 위치로 설정
    right: 0, // 오른쪽에 배치
  },
  refreshIcon: {
    width: 24,
    height: 24,
  },
  subjectList: {
    paddingBottom: 80,
  },
  subjectCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subjectDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 3,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  navButton: {
    alignItems: 'center',
  },
  navIcon: {
    width: 70,
    height: 30,
  },
});

export default HomeScreen;
