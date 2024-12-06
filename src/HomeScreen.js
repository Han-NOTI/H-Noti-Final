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
import axios from 'axios'; // axios import 추가
import AsyncStorage from '@react-native-async-storage/async-storage';

// 홈 화면
const HomeScreen = ({ lectures = [], assignments = [] }) => {
  const navigation = useNavigation();

  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(''); // 오류 상태 관리 추가
  const [lecturesState, setLecturesState] = useState(lectures); // 강의 상태
  const [assignmentsState, setAssignmentsState] = useState(assignments); // 과제 상태
  
  // useEffect 수정 (상태 변경 시 태스크 리스트 자동 업데이트)
  useEffect(() => {
    setTaskList(generateTaskList(lecturesState, assignmentsState));
  }, [lecturesState, assignmentsState]);
  
  const calculateRemainingTimeInSeconds = (deadline) => {
    const currentTime = new Date();
    let correctedDeadline = deadline;
    if (correctedDeadline && correctedDeadline.match(/^\d{2}-\d{2}/)) {
      const currentYear = new Date().getFullYear();
      correctedDeadline = `${currentYear}-${correctedDeadline}`;
    }
    if (correctedDeadline && correctedDeadline.includes(' ')) {
      correctedDeadline = correctedDeadline.replace(' ', 'T') + 'Z';
    }
    const deadlineTime = new Date(correctedDeadline).getTime();
    if (isNaN(deadlineTime)) {
      return Infinity;
    }
    const timeDiff = deadlineTime - currentTime.getTime();
    return timeDiff;
  };

  // generateTaskList 수정
  const generateTaskList = (lecturesData, assignmentsData) => {
    const flattenedLectures = lecturesData.flat();
    const combinedTasks = [
      ...flattenedLectures.map((lecture) => ({
        ...lecture,
        type: 'lecture',
        timeRemaining: calculateRemainingTimeInSeconds(lecture.deadline),
      })),
      ...assignmentsData.map((assignment) => ({
        ...assignment,
        type: 'assignment',
        timeRemaining: calculateRemainingTimeInSeconds(assignment.deadline),
      })),
    ];
    combinedTasks.sort((a, b) => a.timeRemaining - b.timeRemaining);
    return combinedTasks;
  };


  const handleRemoveTask = (task) => {
    setTaskList((prevTaskList) => prevTaskList.filter((item) => item !== task));
  };

  // 새로고침 함수: API를 호출하여 데이터 갱신
  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    const username = await AsyncStorage.getItem('username');
    const password = await AsyncStorage.getItem('password');
    try {
      const response = await axios.post(
        'https://loginwitheclass-bkvxpnghzq-du.a.run.app',
        { username, password }
      );
      if (response.data.success) {
        const userLectures = response.data.data.lectures || [];
        const userAssignments = response.data.data.assignments || [];
  
        // 상태 갱신
        setLecturesState(userLectures);
        setAssignmentsState(userAssignments);
  
        // 새로운 태스크 리스트 생성
        setTaskList(generateTaskList(userLectures, userAssignments));
      } else {
        setError(response.data.message || '데이터 갱신 실패. 다시 시도해주세요.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Image
            source={require('../assets/refresh.png')}
            style={styles.refreshIcon}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>불러오는 중...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : taskList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>현재 처리할 할 일이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={taskList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.taskCard}
              onPress={() => handleRemoveTask(item)}
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
                  <Text style={styles.taskStatus}>상태: 결석</Text>
                  <Text style={styles.taskDeadLine}>
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
                  <Text style={styles.taskStatus}>상태: {item.status}</Text>
                  <Text style={styles.taskDeadLine}>
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
    marginBottom: 8,
  },
  taskDeadLine: {
    fontSize: 14,
    color: 'blue',
    marginBottom: 4,
  },
  taskStatus: {
    fontSize: 14,
    color: 'red',
    marginBottom: 8,
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
  errorText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
    marginTop: 320,
  },
  navigationBar: {
    position: 'absolute', // 위치를 고정
    bottom: 0, // 화면 하단에 고정
    width: '100%', // 화면 너비 전체 사용
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