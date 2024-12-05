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

const HomeScreen = ({ lectures = [], assignments = [] }) => {
  const navigation = useNavigation();

  // 통합된 taskList를 관리하기 위한 상태
  const [taskList, setTaskList] = useState([]);

  // lectures와 assignments 데이터를 통합하여 taskList 생성
  useEffect(() => {
    const combinedTasks = [
      ...lectures.map((lecture) => ({
        ...lecture,
        type: 'lecture',
      })),
      ...assignments.map((assignment) => ({
        ...assignment,
        type: 'assignment',
      })),
    ];
    setTaskList(combinedTasks);
  }, [lectures, assignments]);

  // 특정 task를 삭제하는 핸들러
  const handleRemoveTask = (task) => {
    setTaskList((prevTaskList) => prevTaskList.filter((item) => item !== task));
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    const refreshedTasks = [
      ...lectures.map((lecture) => ({
        ...lecture,
        type: 'lecture',
      })),
      ...assignments.map((assignment) => ({
        ...assignment,
        type: 'assignment',
      })),
    ];
    setTaskList(refreshedTasks);
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
              onPress={() => handleRemoveTask(item)}
              style={styles.taskCard}
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
                  <Text style={styles.taskDetails}>
                    마감 기한: {item.deadline}
                  </Text>
                  <Text style={styles.taskDetails}>상태: {item.status}</Text>
                  <Text style={styles.taskDetails}>주차: {item.week}</Text>
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
          onPress={() => navigation.navigate('NotificationScreen')}
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
    justifyContent: 'center', // 중앙 정렬
    marginBottom: 20,
    position: 'relative', // 상대 위치 설정
    paddingTop: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center', // 텍스트 중앙 정렬
    flex: 1, // 제목을 화면 중앙에 배치
  },
  refreshButton: {
    position: 'absolute',
    right: 0, // 오른쪽에 배치
    padding: 16,
    marginTop: 20,
  },
  refreshIcon: {
    width: 24,
    height: 24,
    marginTop: 15,
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
