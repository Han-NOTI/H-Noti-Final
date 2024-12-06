import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { RadioButton } from 'react-native-paper'; // react-native-paper에서 RadioButton 사용
import PushNotification from 'react-native-push-notification';

// notificationId를 사용하여 중복 알림을 방지
let notificationId = 0;

const NotificationScreen = ({ lectures = [], assignments = [] }) => {
  const navigation = useNavigation();
  const [taskList, setTaskList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('3일 전');

  const sendNotification = async (task) => {
    try {
      const title =
        task.type === 'lecture'
          ? `강의 - ${task.courseName}`
          : `과제 - ${task.courseName}`;

      const message =
        task.type === 'lecture'
          ? `${task.lecture_title} 시청까지 ${calculateRemainingTime(
              task.deadline
            )}`
          : `${task.title} 제출까지 ${calculateRemainingTime(task.deadline)}`;

      const deadlineTime = new Date(task.deadline).getTime();
      const timeRemaining = deadlineTime - Date.now();

      const notificationTime = calculateTimeBeforeNotification(selectedTime);

      if (timeRemaining < notificationTime) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: title,
            body: message,
          },
          trigger: {
            date: new Date(deadlineTime - notificationTime),
          },
        });
      } else {
        console.log('알림 예약 시간이 아직 충분히 남았습니다.');
      }
    } catch (error) {
      console.error('Notification scheduling error:', error);
    }
  };
  
  const scheduleNotificationsForTasks = () => {
    const notificationTime = calculateTimeBeforeNotification(selectedTime);

    taskList.forEach((task) => {
      const timeRemaining = calculateRemainingTimeInSeconds(task.deadline);

      if (timeRemaining <= notificationTime) {
        sendNotification(task);
      }
    });
  };
  
  

  // 알림 예약 시 선택된 시간에 따라 미리 알림 시간 계산
  const calculateTimeBeforeNotification = (time) => {
    switch (time) {
      case '3시간 전':
        return 3 * 60 * 60 * 1000;
      case '6시간 전':
        return 6 * 60 * 60 * 1000;
      case '12시간 전':
        return 12 * 60 * 60 * 1000;
      case '1일 전':
        return 24 * 60 * 60 * 1000;
      case '3일 전':
        return 3 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  useEffect(() => {
    // taskList가 변경될 때마다 알림을 다시 예약
    scheduleNotificationsForTasks();
  }, [selectedTime, taskList]);

  useEffect(() => {
    const flattenedLectures = lectures.flat();
    const combinedTasks = [
      ...flattenedLectures.map((lecture) => ({
        ...lecture,
        type: 'lecture',
      })),
      ...assignments.map((assignment) => ({
        ...assignment,
        type: 'assignment',
      })),
    ];


    // 남은 시간을 계산하고 이를 기준으로 정렬 (시간이 적게 남은 것부터)
    const tasksWithTimeDiff = combinedTasks.map((task) => {
      const timeRemaining = calculateRemainingTimeInSeconds(task.deadline);
      return { ...task, timeRemaining };
    });

    // timeRemaining 기준으로 오름차순 정렬
    tasksWithTimeDiff.sort((a, b) => a.timeRemaining - b.timeRemaining);

    setTaskList(tasksWithTimeDiff);
  }, [lectures, assignments]);

  // calculateRemainingTimeInSeconds: 남은 시간을 초 단위로 계산하여 반환
  const calculateRemainingTimeInSeconds = (deadline) => {
    const currentTime = new Date();
  
    let correctedDeadline = deadline;
  
    // 연도가 누락된 경우 현재 연도를 추가
    if (correctedDeadline && correctedDeadline.match(/^\d{2}-\d{2}/)) {
      const currentYear = new Date().getFullYear();
      correctedDeadline = `${currentYear}-${correctedDeadline}`; // 'MM-DD HH:mm:ss' → 'YYYY-MM-DD HH:mm:ss'
    }
  
    // ISO 8601 형식으로 변환하여 시간대를 로컬로 맞추기
    if (correctedDeadline && correctedDeadline.includes(' ')) {
      correctedDeadline = correctedDeadline.replace(' ', 'T'); // 'MM-DD HH:mm:ss' → 'YYYY-MM-DDTHH:mm:ss'
    }
  
    // 날짜가 유효한지 체크
    const deadlineTime = new Date(correctedDeadline).getTime();
  
    if (isNaN(deadlineTime)) {
      console.error('Invalid date format detected:', correctedDeadline);
      return 0; // 잘못된 날짜는 0 반환
    }
  
    const timeDiff = deadlineTime - currentTime.getTime();
    return timeDiff > 0 ? timeDiff : 0; // 마감시간이 지났으면 0 반환
  };
  
  
  
  const calculateRemainingTime = (deadline) => {
    const timeDiff = calculateRemainingTimeInSeconds(deadline);
  
    const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // 하루 단위로 남은 시간 계산
    const hoursRemaining = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // 남은 시간 내에서 시간 단위 계산
    const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)); // 남은 시간 내에서 분 단위 계산
  
    if (timeDiff > 0) {
      if (daysRemaining > 0) {
        return `${daysRemaining}일 ${hoursRemaining}시간 ${minutesRemaining}분 남았습니다.`; // 1일 이상의 차이가 있을 때
      } else {
        return `${hoursRemaining}시간 ${minutesRemaining}분 남았습니다.`; // 하루 이하의 차이가 있을 때
      }
    } else {
      return `기한이 지났습니다.`; // 마감 시간이 지난 경우
    }
  };
  
  

  const handleAlarmButtonPress = () => {
    setModalVisible(true); // 알람 설정 모달 열기
  };

  const handleCloseModal = () => {
    setModalVisible(false); // 모달 닫기
  };

  const handleTimeSelection = (time) => {
    setSelectedTime(time); // 선택한 시간 상태 업데이트
    setModalVisible(false); // 모달 닫기
  };
  
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>알림</Text>
        {/* 알람 설정 버튼 추가 */}
        <TouchableOpacity
          onPress={handleAlarmButtonPress}
          style={styles.alarmSetButton}
        >
          <Image
            source={require('../assets/alarm-set.png')} // 알람 설정 아이콘 이미지
            style={styles.alarmSetIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {taskList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>현재 알림이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={taskList}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              {item.type === 'lecture' ? (
                <>
                  <Text style={styles.notificationTitle}>
                    강의 - {item.courseName}
                  </Text>
                  <Text style={styles.notificationDetails}>
                    {item.lecture_title} 시청까지{' '}
                    {calculateRemainingTime(item.deadline)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.notificationTitle}>
                    과제 - {item.courseName}
                  </Text>
                  <Text style={styles.notificationDetails}>
                    {item.title} 제출까지{' '}
                    {calculateRemainingTime(item.deadline)}
                  </Text>
                </>
              )}
            </View>
          )}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          contentContainerStyle={styles.notificationList}
        />
      )}

      {/* 알람 설정 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>알람 설정</Text>

            {/* 라디오 버튼 그룹 */}
            <RadioButton.Group
              onValueChange={handleTimeSelection}
              value={selectedTime}
            >
              <RadioButton.Item label="3시간 전" value="3시간 전" />
              <RadioButton.Item label="6시간 전" value="6시간 전" />
              <RadioButton.Item label="12시간 전" value="12시간 전" />
              <RadioButton.Item label="1일 전" value="1일 전" />
              <RadioButton.Item label="3일 전" value="3일 전" />
            </RadioButton.Group>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('HomeScreen')}
          style={styles.navButton}
        >
          <Image
            source={require('../assets/home-2.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('NotificationScreen', {
              lectures: lectures,
              assignments: assignments,
            })
          }
          style={styles.navButton}
        >
          <Image
            source={require('../assets/alarm-1.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileScreen')}
          style={styles.navButton}
        >
          <Image
            source={require('../assets/profile-2.png')}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // 중앙 정렬
    position: 'relative', // 상대 위치 설정
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center', // 텍스트 중앙 정렬
    flex: 1, // 제목을 화면 중앙에 배치
  },
  alarmSetButton: {
    position: 'absolute',
    right: 0,
    padding: 16,
    marginTop: 20,
  },
  alarmSetIcon: {
    width: 30,
    height: 30,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationDetails: {
    fontSize: 16,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  modalOverlay: {
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
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

export default NotificationScreen;
