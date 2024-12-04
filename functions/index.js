const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { loginWithEclass } = require('./LoginFunction');
const { getDetailedCourse } = require('./getDetailedCourse');
const { getUserData } = require('./getUserData');

// Helper functions
function setupCORS(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // 필요한 메소드 추가
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // 필요한 헤더 추가
}

function handleError(res, error) {
  logger.error('Error occurred:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

const region = 'asia-northeast3'; // 서울 리전 설정

exports.loginWithEclass = onRequest(
  {
    region, 
    enforceAppCheck: false,
    memory: "4GiB",
    timeoutSeconds: 120,
  },
  async (req, res) => {
    try {
      setupCORS(res);

      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
      }

      const { username, password } = req.body;
      const result = await loginWithEclass(username, password);

      if (result) {
        res.status(200).json({ success: true, data: result });
      } else {
        res.status(401).json({ error: 'Login failed' });
      }
    } catch (error) {
      handleError(res, error);
    }
  }
);

// Export the new function for detailed course information
exports.getDetailedCourse = onRequest(
  {
    region, 
    enforceAppCheck: false,
    memory: "4GiB",
    timeoutSeconds: 120,
  },
  async (req, res) => {
    try {
      setupCORS(res);

      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return;
      }

      const { courseId } = req.body; // assuming you're passing courseId in the body
      const result = await getDetailedCourse(courseId);

      if (result) {
        res.status(200).json({ success: true, data: result });
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error) {
      handleError(res, error);
    }
  }
);

// Export the new function for user data
exports.getUserData = onRequest(
  {
    region, 
    enforceAppCheck: false,
    memory: "4GiB",
    timeoutSeconds: 120,
  },
  async (req, res) => {
    try {
      setupCORS(res);

      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return;
      }

      const { username } = req.body;
      const result = await getUserData(username);

      if (result) {
        res.status(200).json({ success: true, data: result });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      handleError(res, error);
    }
  }
);