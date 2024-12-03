const admin = require('firebase-admin');

// Firebase 초기화 (서비스 계정 키 필요)
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require('./serviceAccountKey.json'))
    });
  }

const db = admin.firestore();
console.log(db);

async function getUserData(username) {
    try {
      const userRef = db.collection('users').doc(username);
      const userDoc = await userRef.get();
      console.log(userRef);
        
      if (!userDoc.exists) {
        throw new Error(`User ${username} does not exist.`);
      }
  
      const userData = userDoc.data();
      console.log(userData);
      
      // assignments와 lectures를 분리
      const assignments = userData.assignments || [];
      const lectures = userData.lectures || [];
      console.log(assignments, lectures);
  
      // lectures를 courseName이 같은 것끼리 그룹으로 묶기
      const lecturesByCourseName = lectures.reduce((acc, lecture) => {
        const courseName = lecture.courseName;
        if (!acc[courseName]) {
          acc[courseName] = [];
        }
        acc[courseName].push(lecture);
        return acc;
      }, {});
  
      // 2차원 배열로 변환
      const lecturesArray = Object.values(lecturesByCourseName);
      console.log(lecturesArray);
  
      // 결과 반환
      return {
        username,
        assignments,
        lectures: lecturesArray
      };
  
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error('Failed to fetch user data.');
    }
  }
  
module.exports = { getUserData };