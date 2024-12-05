import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = ({ route }) => {
  const { assignments = [] } = route.params || {}; // Handle missing assignments
  const [notifications, setNotifications] = useState([]);
  const [selectedTab, setSelectedTab] = useState('alarm');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  // Function to calculate remaining time
  const calculateRemainingTime = (deadline) => {
    const currentTime = new Date();
    const deadlineTime = new Date(deadline);
    const timeDiff = deadlineTime - currentTime;
    const minutesRemaining = Math.floor(timeDiff / (1000 * 60));

    // Calculate days, hours, and minutes for better precision
    const days = Math.floor(minutesRemaining / (24 * 60));
    const hours = Math.floor((minutesRemaining % (24 * 60)) / 60);
    const minutes = minutesRemaining % 60;

    return { days, hours, minutes, isExpired: timeDiff < 0 }; // Expired check
  };

  // Function to generate notifications
  useEffect(() => {
    const generateNotifications = () => {
      if (assignments.length === 0) return; // If no assignments, return early

      const newNotifications = assignments.map((assignment, index) => {
        const taskTitle = assignment.title || 'Unknown Assignment';
        const videoName = assignment.videoName || 'Unknown Video';

        const taskDeadline = calculateRemainingTime(assignment.deadline);
        const videoDeadline = calculateRemainingTime(assignment.videoDeadline);

        return {
          id: assignment.id || `temp-id-${index}`,
          courseName: assignment.courseName || 'Unknown Course',
          taskTitle,
          videoName,
          taskDeadline,
          videoDeadline,
        };
      });

      setNotifications(newNotifications);
    };

    generateNotifications();
  }, [assignments]);

  // Handle navigation tab selection
  const handleTabPress = (tab) => {
    setSelectedTab(tab);
    if (tab === 'home') {
      navigation.navigate('HomeScreen');
    } else if (tab === 'profile') {
      navigation.navigate('ProfileScreen');
    }
  };

  // Function to render video notifications
  const renderVideoNotification = (item) => (
    <View style={styles.notificationCard}>
      <Text style={styles.courseName}>{item.courseName}</Text>
      {!item.videoDeadline.isExpired && (
        <Text style={styles.notificationText}>
          {item.videoName} 시청까지{' '}
          {item.videoDeadline.days > 0 ? `${item.videoDeadline.days}일 ` : ''}
          {item.videoDeadline.hours}시간 {item.videoDeadline.minutes}분
          남았습니다.
        </Text>
      )}
      {item.videoDeadline.isExpired && (
        <Text style={styles.notificationText}>
          {item.videoName} 시청 기한이 지났습니다.
        </Text>
      )}
    </View>
  );

  // Function to render task notifications
  const renderTaskNotification = (item) => (
    <View style={styles.notificationCard}>
      <Text style={styles.courseName}>{item.courseName}</Text>
      {!item.taskDeadline.isExpired && (
        <Text style={styles.notificationText}>
          {item.taskTitle} 과제 제출까지{' '}
          {item.taskDeadline.days > 0 ? `${item.taskDeadline.days}일 ` : ''}
          {item.taskDeadline.hours}시간 {item.taskDeadline.minutes}분
          남았습니다.
        </Text>
      )}
      {item.taskDeadline.isExpired && (
        <Text style={styles.notificationText}>
          {item.taskTitle} 과제 제출 기한이 지났습니다.
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.notificationContainer}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>알림 센터</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.alarmSetButton}
          >
            <Image
              source={require('../assets/alarm-set.png')} // alarm-set 이미지를 사용
              style={styles.alarmSetIcon}
            />
          </TouchableOpacity>
        </View>

        {/* 알림 항목들 */}
        {notifications.length === 0 ? (
          <Text style={styles.noAssignmentsText}>
            No assignments available.
          </Text>
        ) : (
          <>
            {/* Video Notifications Widget */}
            <Text style={styles.widgetTitle}>영상 시청 알림</Text>
            <FlatList
              data={notifications.filter((item) => item.videoDeadline)} // Filter for video notifications
              keyExtractor={(item) =>
                item.id?.toString() || item.index.toString()
              }
              renderItem={({ item }) => renderVideoNotification(item)}
            />

            {/* Task Notifications Widget */}
            <Text style={styles.widgetTitle}>과제 제출 알림</Text>
            <FlatList
              data={notifications.filter((item) => item.taskDeadline)} // Filter for task notifications
              keyExtractor={(item) =>
                item.id?.toString() || item.index.toString()
              }
              renderItem={({ item }) => renderTaskNotification(item)}
            />
          </>
        )}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  alarmSetButton: {
    position: 'absolute',
    right: 0,
  },
  alarmSetIcon: {
    width: 24,
    height: 24,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationText: {
    fontSize: 16,
    color: '#666',
    marginTop: 6,
  },
  noAssignmentsText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: 30,
    height: 30,
  },
});

export default NotificationScreen;
