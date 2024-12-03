import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = () => {
  const [selectedTab, setSelectedTab] = useState('alarm');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
    if (tab === 'home') {
      navigation.navigate('HomeScreen');
    } else if (tab === 'profile') {
      navigation.navigate('ProfileScreen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.notificationContainer}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>알림 센터</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.alarmSetButton}>
            <Image
              source={require('../assets/alarm-set.png')} // alarm-set 이미지를 사용
              style={styles.alarmSetIcon}
            />
          </TouchableOpacity>
        </View>
        {/* 알림 항목들 */}
        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>
            웹프레임워크1 영상 시청까지 5시간 남았습니다.
          </Text>
        </View>
        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>
            고급모바일프로그래밍 과제 제출까지 6시간 남았습니다.
          </Text>
        </View>

        {/* 시간 설정 모달 */}
        <Modal visible={modalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>알림 시간 설정</Text>
              {['3시간 전', '6시간 전', '12시간 전', '1일 전', '3일 전'].map(
                (time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => setModalVisible(false)}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalText}>{time}</Text>
                  </TouchableOpacity>
                )
              )}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

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
    backgroundColor: '#f9f9f9',
  },
  notificationContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row', // 가로 배치
    justifyContent: 'space-between', // 제목과 버튼을 양쪽 끝에 배치
    alignItems: 'center', // 세로 중앙 정렬
    paddingTop: 20, // 상단 여백
    paddingHorizontal: 16, // 좌우 여백
    paddingBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center', // 텍스트 중앙 정렬
    flex: 1, // 제목을 화면 중앙에 배치
  },
  alarmSetButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmSetIcon: {
    width: 24,
    height: 24,
  },
  notificationItem: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#1d4ed8',
    fontSize: 16,
    fontWeight: 'bold',
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
    bottom: 35,
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

export default NotificationScreen;
