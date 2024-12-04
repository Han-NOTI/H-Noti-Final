const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
const dayjs = require('dayjs'); // 날짜 비교를 위해 dayjs 라이브러리를 사용할 수 있습니다.

// 서비스 계정 초기화
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
let assignments = [];

// 하드코딩된 현재 주차와 데드라인
let weekNumber = '14';
let deadLine = '12-08 23:59:59';

async function getDetailedCourse(browser, courseName, username) {
  let page;
  try {
    if (courseName.endsWith('NEW')) {
      courseName = courseName.slice(0, -3).trim();
    }

    console.log(`Processing course ${courseName}`);

    page = await browser.newPage();
    await page.goto('https://learn.hansung.ac.kr');

    await page.evaluate((courseName) => {
      const courseElements = Array.from(document.querySelectorAll('.course-title h3'));
      const matchingCourse = courseElements.find(element => element.textContent.trim().includes(courseName));
        
      if (matchingCourse) {
          matchingCourse.click(); // 일치하는 코스 요소 클릭
      } else {
          console.log(`No course found containing: ${courseName}`);
      }
    }, courseName);

    await page.waitForNavigation();

    await page.evaluate(() => {
      const submenuProgressElement = document.querySelector('.submenu-progress');
      if (submenuProgressElement) {
        submenuProgressElement.click();
      }
    });

    await page.waitForNavigation();

    console.log(`Lecture page ${courseName} loaded`, page.url());

    // 첫 번째 스크래핑 작업

    const lectures = await page.evaluate((weekNumber) => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const result = [];

      for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].querySelector('td.text-center');
        if (cell && cell.textContent.trim() === weekNumber) {
          const rowspan = parseInt(cell.getAttribute('rowspan')) || 1;
          for (let j = 0; j < rowspan; j++) {
            result.push(rows[i + j].outerHTML);
          }
          break;
        }
      }
      return result;
    }, weekNumber);


    // '과제' 텍스트를 가진 <a> 요소를 클릭
    const linkFound = await page.evaluate(() => {
      const assignmentLink = Array.from(document.querySelectorAll('ul.add_activities li a'))
        .find(link => link.textContent.trim() === '과제');
      if (assignmentLink) {
        assignmentLink.click();
        return true;
      } else {
        console.log('Assignment link not found');
        return false;
      }
    });
    
    // 페이지 이동을 기다림 링크가 있을 때만 수행
    if (linkFound) {
      await page.waitForNavigation();
      console.log('Assignment page loaded', page.url());
    
      // 두 번째 스크래핑 작업
      assignments = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr[class=""], tr.lastrow'));
        console.log('Assignment ========================= Rows:', rows);
        const result = [];
    
        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll('td'));
          const rowData = [];
    
          for (const cell of cells) {
            const text = cell.textContent.trim();
            rowData.push(text);
          }
    
          result.push(rowData);
        }
    
        return result;
      });
    
      // 이후 assignments 사용
    } else {
      console.log('Skipping further actions as assignment link was not found.');
    }
  
    /// 첫 번째, 두 번째 추출 이후 DB(firestore)에 저장하는 과정
    // 1. 강의 정보 저장
    for (const rowHtml of lectures) { 
    
      const $ = cheerio.load(rowHtml); // Cheerio 인스턴스를 생성 
      const $lecture = $('tr', rowHtml); // 직접 로드된 HTML을 선택
      
    
      if (!$lecture.length) { 
        console.log('No tr found in row:', $lecture);
        continue; 
      }
      console.log('Row:', $lecture.html());

      // Check last td
      const lastTd = $lecture.find('td').last();
      if (lastTd.text().trim() !== 'X') {
        console.log('Invalid last td:', lastTd, lastTd.text().trim());
        continue;
      }
      
      // Extract lecture title and length
      const lectureTitle = $lecture.find('td.text-left').text().trim();
      const time = $lecture.find('td.text-center.hidden-xs.hidden-sm').text().trim();

      const lectureInfo = {
        lecture_title: lectureTitle,
        lecture_length: time,
        deadline: deadLine,
        courseName: courseName
      };

      console.log(`Lecture info`, lectureInfo);

      try {
        const userRef = db.collection('users').doc(username);
        await userRef.update({
          lectures: admin.firestore.FieldValue.arrayUnion(lectureInfo)
        });
        console.log(`강의 정보가 사용자 ${username}의 문서에 추가되었습니다.`);
      } catch (error) {
        console.error('Firestore에 강의 정보 추가 중 오류 발생', error);
      }
    }


    // 2. 과제 정보 저장
    for (const assignment of assignments) {
      const dateStr = assignment[2]; // 마감 날짜가 있는 인덱스
      const submissionStatus = assignment[3]; // 제출 상태가 있는 인덱스
      const lastField = assignment[4]; // 마지막 필드
    
      console.log('==========================',dateStr, submissionStatus, lastField);

      // 현재 날짜
      const currentDate = dayjs();
    
      // 마감 날짜를 dayjs 객체로 파싱
      const deadlineDate = dayjs(dateStr, 'YYYY-MM-DD HH:mm');
    
      // 조건: 마지막 요소가 '-'이고, 제출 상태가 '미제출'이며, 마감 날짜가 현재 날짜 이후
      if (lastField === '-' && submissionStatus === '미제출' && deadlineDate.isAfter(currentDate)) {
        console.log('Valid assignment for DB:', assignment);
    
        // 저장할 데이터 구성
        const assignmentInfo = {
          courseName: courseName,
          week: assignment[0],
          title: assignment[1],
          deadline: dateStr,
          status: submissionStatus
        };
        console.log('Assignment info:', assignmentInfo);

        try {
          const userRef = db.collection('users').doc(username);
          await userRef.update({
            assignments: admin.firestore.FieldValue.arrayUnion(assignmentInfo)
          });
          console.log(`Assignment info added to user ${username}'s document.`);
        } catch (error) {
          console.error('Error adding assignment info to Firestore', error);
        }
      } else {
        console.log('Assignment does not meet criteria:', assignment);
      }
    }



    return;

  } catch (error) {
    console.error(`Error processing course ${courseName}`, error);
    return null;
  } finally {
    if (page) {
      await page.close();
    }
  }
}

module.exports = {
  getDetailedCourse
};