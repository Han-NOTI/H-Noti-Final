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
import { RadioButton } from 'react-native-paper';

const NotificationScreen = ({ lectures = [], assignments = [] }) => {
  const navigation = useNavigation();
  const [taskList, setTaskList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('3일 전'); // Default time is 3 days before
  const [notificationMessage, setNotificationMessage] = useState('');
  const [scheduledNotifications, setScheduledNotifications] = useState([]);


  const sendNotification = async (task) => {
    try {
      const title =
        task.type === 'lecture'
          ? `강의 - ${task.courseName}`
          : `과제 - ${task.courseName}`;
  
      const message =
        task.type === 'lecture'
          ? `${task.lecture_title} 시청까지 ${selectedTime}으로 예약 알림하였습니다.`
          : `${task.title} 제출까지 ${selectedTime}으로 예약 알림하였습니다.`;
  
      const deadlineTime = new Date(task.deadline).getTime();
      const notificationTime = calculateTimeBeforeNotification(selectedTime);
      const scheduledTime = new Date(deadlineTime - notificationTime); // Calculate the actual scheduled time
  
      // Check if enough time is remaining to schedule a notification
      if (deadlineTime - Date.now() > notificationTime) {
        const newNotificationId = `${task.type}-${task.courseName}-${task.deadline}`;
  
        // Only schedule if the notification is not already scheduled
        if (!scheduledNotifications.includes(newNotificationId)) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: title,
              body: message,
            },
            trigger: {
              date: scheduledTime,
            },
          });
  
          console.log(
            `${task.type === 'lecture' ? task.lecture_title : task.title} 알림 예약 완료. 예약 시간: ${scheduledTime.toLocaleString()}`
          );
          setNotificationMessage(
            `${task.type === 'lecture' ? task.lecture_title : task.title} 알림 예약 완료`
          );
  
          // Add to the list of scheduled notifications
          setScheduledNotifications([...scheduledNotifications, newNotificationId]);
        }
      } else {
        console.log('예약할 수 없습니다. 데드라인이 오늘보다 빠릅니다.');
        setNotificationMessage('예약할 수 없습니다. 데드라인이 오늘보다 빠릅니다.');
      }
    } catch (error) {
      console.error('Notification scheduling error:', error);
    }
  };

  const scheduleNotificationsForTasks = () => {
    taskList.forEach((task) => {
      sendNotification(task);
    });
  };

  // Calculate the time difference (in milliseconds) for the notification before the deadline
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
    // Call scheduleNotificationsForTasks when taskList or selectedTime changes
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

    // Add remaining time calculation
    const tasksWithTimeDiff = combinedTasks.map((task) => {
      const timeRemaining = calculateRemainingTimeInSeconds(task.deadline);
      return { ...task, timeRemaining };
    });

    tasksWithTimeDiff.sort((a, b) => a.timeRemaining - b.timeRemaining);

    setTaskList(tasksWithTimeDiff);
  }, [lectures, assignments]);

  const calculateRemainingTimeInSeconds = (deadline) => {
    const currentTime = new Date();
    let correctedDeadline = deadline;

    if (correctedDeadline && correctedDeadline.match(/^\d{2}-\d{2}/)) {
      const currentYear = new Date().getFullYear();
      correctedDeadline = `${currentYear}-${correctedDeadline}`;
    }

    if (correctedDeadline && correctedDeadline.includes(' ')) {
      correctedDeadline = correctedDeadline.replace(' ', 'T');
    }

    const deadlineTime = new Date(correctedDeadline).getTime();

    if (isNaN(deadlineTime)) {
      console.error('Invalid date format detected:', correctedDeadline);
      return 0;
    }

    const timeDiff = deadlineTime - currentTime.getTime();
    return timeDiff > 0 ? timeDiff : 0;
  };

  const calculateRemainingTime = (deadline) => {
    const timeDiff = calculateRemainingTimeInSeconds(deadline);
    const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (timeDiff > 0) {
      if (daysRemaining > 0) {
        return `${daysRemaining}일 ${hoursRemaining}시간 ${minutesRemaining}분 남았습니다.`;
      } else {
        return `${hoursRemaining}시간 ${minutesRemaining}분 남았습니다.`;
      }
    } else {
      return `기한이 지났습니다.`;
    }
  };

  const handleAlarmButtonPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleTimeSelection = (time) => {
    setSelectedTime(time);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>알림</Text>
        <TouchableOpacity onPress={handleAlarmButtonPress} style={styles.alarmSetButton}>
          <Image source={require('../assets/alarm-set.png')} style={styles.alarmSetIcon} />
        </TouchableOpacity>
      </View>

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
                  <Text style={styles.notificationTitle}>강의 - {item.courseName}</Text>
                  <Text style={styles.notificationDetails}>
                    {item.lecture_title} 시청까지 {calculateRemainingTime(item.deadline)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.notificationTitle}>과제 - {item.courseName}</Text>
                  <Text style={styles.notificationDetails}>
                    {item.title} 제출까지 {calculateRemainingTime(item.deadline)}
                  </Text>
                </>
              )}
            </View>
          )}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          contentContainerStyle={styles.notificationList}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>알람 설정</Text>

            <RadioButton.Group onValueChange={handleTimeSelection} value={selectedTime}>
              <RadioButton.Item label="3시간 전" value="3시간 전" />
              <RadioButton.Item label="6시간 전" value="6시간 전" />
              <RadioButton.Item label="12시간 전" value="12시간 전" />
              <RadioButton.Item label="1일 전" value="1일 전" />
              <RadioButton.Item label="3일 전" value="3일 전" />
            </RadioButton.Group>

            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    top: 10,
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


export default NotificationScreen;