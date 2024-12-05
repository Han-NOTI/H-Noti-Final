import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 홈 화면
const HomeScreen = ({ lectures = [], assignments = [] }) => {
  const navigation = useNavigation();

  const [taskList, setTaskList] = useState([]);

  // 남은 시간을 초 단위로 계산하는 함수
  const calculateRemainingTimeInSeconds = (deadline) => {
    const currentTime = new Date();
    let correctedDeadline = deadline;

    // 연도가 누락된 경우 현재 연도를 추가
    if (correctedDeadline && correctedDeadline.match(/^\d{2}-\d{2}/)) {
      const currentYear = new Date().getFullYear();
      correctedDeadline = `${currentYear}-${correctedDeadline}`;
    }

    // ISO 8601 형식으로 강제 변환
    if (correctedDeadline && correctedDeadline.includes(' ')) {
      correctedDeadline = correctedDeadline.replace(' ', 'T') + 'Z';
    }

    const deadlineTime = new Date(correctedDeadline).getTime();

    if (isNaN(deadlineTime)) {
      console.error('Invalid date format:', correctedDeadline);
      return Infinity; // 오류가 있는 경우 무한대로 설정
    }

    const timeDiff = deadlineTime - currentTime.getTime();

    return timeDiff; // 초 단위로 반환
  };

  // lectures와 assignments 데이터를 통합하여 taskList 생성 및 정렬
  const generateTaskList = () => {
    const flattenedLectures = lectures.flat(); // 중첩 배열 평탄화

    const combinedTasks = [
      ...flattenedLectures.map((lecture) => ({
        ...lecture,
        type: 'lecture',
        timeRemaining: calculateRemainingTimeInSeconds(lecture.deadline),
      })),
      ...assignments.map((assignment) => ({
        ...assignment,
        type: 'assignment',
        timeRemaining: calculateRemainingTimeInSeconds(assignment.deadline),
      })),
    ];

    // 남은 시간을 기준으로 오름차순 정렬
    combinedTasks.sort((a, b) => a.timeRemaining - b.timeRemaining);

    return combinedTasks;
  };

  useEffect(() => {
    setTaskList(generateTaskList()); // 초기 taskList 설정
  }, [lectures, assignments]);

  // 특정 task를 제거하는 함수
  const handleRemoveTask = (task) => {
    setTaskList((prevTaskList) => prevTaskList.filter((item) => item !== task));
  };

  // 새로고침 함수: 원본 데이터를 사용해 taskList를 재생성
  const handleRefresh = () => {
    setTaskList(generateTaskList()); // 원본 데이터를 기반으로 taskList 재생성
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Image
            source={require('../assets/refresh.png')}
            style={styles.refreshIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {taskList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>현재 처리할 할 일이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={taskList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.taskCard}
              onPress={() => handleRemoveTask(item)} // 터치 시 task 제거
            >
              {item.type === 'lecture' ? (
                <>
                  <Text style={styles.taskTitle}>영상 - {item.courseName}</Text>
                  <Text style={styles.taskDetails}>
                    강의 제목: {item.lecture_title}
                  </Text>
                  <Text style={styles.taskDetails}>
                    강의 길이: {item.lecture_length}
                  </Text>
                  <Text style={styles.taskDetails}>상태: 결석</Text>
                  <Text style={styles.taskDetails}>
                    마감 기한: {item.deadline}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.taskTitle}>과제 - {item.courseName}</Text>
                  <Text style={styles.taskDetails}>
                    과제 제목: {item.title}
                  </Text>
                  <Text style={styles.taskDetails}>주차: {item.week}</Text>
                  <Text style={styles.taskDetails}>상태: {item.status}</Text>
                  <Text style={styles.taskDetails}>
                    마감 기한: {item.deadline}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          contentContainerStyle={styles.taskList}
        />
      )}

      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('HomeScreen')}
          style={styles.navButton}
        >
          <Image
            source={require('../assets/home-1.png')}
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
            source={require('../assets/alarm-2.png')}
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
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
    paddingTop: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  refreshButton: {
    position: 'absolute',
    right: 0,
    padding: 16,
  },
  refreshIcon: {
    width: 25,
    height: 25,
  },
  taskList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  taskDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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

export default HomeScreen;
