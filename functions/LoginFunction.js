const puppeteer = require('puppeteer');
const { getDetailedCourse } = require('./getDetailedCourse');
const { getUserData } = require('./getUserData');
const admin = require('firebase-admin');

// Firebase 초기화 (서비스 계정 키 필요)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json'))
  });
}

const db = admin.firestore();

async function loginWithEclass(username, password) {
  console.log("========================이클래스 로그인 함수 실행=====================================");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process',
      '--disable-web-security'
    ]
  });

  const page = await browser.newPage();

  // 'ko'로 브라우저의 언어를 설정
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ko'
  });


  try {
    console.log(`사용자 이름으로 로그인: ${username}`);
    await page.goto('https://learn.hansung.ac.kr/login/index.php');

    await page.waitForSelector('#input-username');
    await page.waitForSelector('#input-password');

    const usernameInput = await page.$('#input-username');
    const passwordInput = await page.$('#input-password');

    if (usernameInput && passwordInput) {
      await usernameInput.type(username);
      await passwordInput.type(password);
    } else {
      throw new Error("로그인 입력란을 찾을 수 없습니다");
    }

    const loginButton = await page.$('[name="loginbutton"]');
    if (loginButton) {
      await loginButton.click();
      await page.waitForNavigation();
    } else {
      throw new Error("로그인 버튼을 찾을 수 없습니다");
    }

    // 로그인 성공 후 특정 요소 검사 및 과목 정보 추출
    const loginResult = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const userDepartment = document.querySelector('li.user_department.hidden-xs')?.textContent.trim() || null;
      
      const courseElements = document.querySelectorAll('li.course_label_re_02');
      const courses = Array.from(courseElements).map(courseElement => {
        const title = courseElement.querySelector('.course-title h3')?.innerText || '';
        const professor = courseElement.querySelector('.prof')?.innerText || '';
        
        const classNumberMatch = title.match(/\[(\d+)\]/);
        const classNumber = classNumberMatch ? classNumberMatch[1] : '';
        
        return { 
          courseName: title.replace(/\[\d+\]/, '').trim(), 
          classNumber, 
          professor 
        };
      });
      
      
      return { 
        isLoggedIn: currentUrl.startsWith('https://learn.hansung.ac.kr/'), 
        userDepartment, 
        courses 
      };
    });
    

    // 'user-info-menu' 클래스의 요소를 클릭하여 사용자 메뉴 열기
    await page.click('.user-info-menu');

    // 하위 요소가 DOM에 추가될 때까지 대기
    await page.waitForSelector('.user-info-menu h4, .user-info-menu p', { visible: true });

    // 실제 이름 가져오기
    const real_name = await page.evaluate(() => {
      const h4 = document.querySelector('.user-info-menu h4');
      return h4 ? h4.textContent.trim() : null;
    });

    // 트랙명 가져오기
    const track_name = await page.evaluate(() => {
      const p = document.querySelector('.user-info-menu p');
      return p ? p.textContent.trim() : null;
    });

    console.log('실제 이름 Text:', real_name);
    console.log('트랙명 Text:', track_name);
    
    if (loginResult.isLoggedIn) {
      // Firestore에 사용자 학번, 이름, 트랙명 저장
      try {
        await db.collection('users').doc(username).set({
          student_num: username,
          user_name: real_name,
          track_name: track_name,
          loginTimestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`사용자 ${username}이 Firestore에 저장되었습니다.`);
      } catch (dbError) {
        console.error('Firestore 저장 중 오류:', dbError);
      }
    }

      const { courses } = loginResult;
      
      // 페이지 복제 후 병렬 동작 시작
      const detailPromises = courses.map((course) => {
        console.log(course.courseName, browser);
        return getDetailedCourse(browser, course.courseName, username);
      });

      // 모든 병렬 동작 완료 후 결과 반환
      const courseDetails = await Promise.all(detailPromises);

      // 결과 반환

      final_result = getUserData(username, real_name, track_name);
      console.log(final_result);
      return final_result;
    } catch (error) {
      await browser.close();
      console.error('Puppeteer 오류:', error);
      throw error;
    }
  }

module.exports = { loginWithEclass };