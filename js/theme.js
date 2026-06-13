/**
 * js/theme.js v4 - 통합 감정 테마 시스템 (사진 캐싱 버전)
 *
 * 핵심 수정:
 *  · 한 세션 안에서는 같은 감정이면 같은 사진 사용 (매번 랜덤 X)
 *  · storage 이벤트 리스너 제거 (의도치 않은 재호출 방지)
 *  · 페이지 이동/새로고침해도 사진이 흔들리지 않음
 *  · 탭을 닫았다 다시 열면 → 새 세션이므로 새 사진
 */

const EMOTION_PHOTOS = {
  happy: [
    'https://images.unsplash.com/photo-1530908295418-a12e326966ba?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=70',
  ],
  joyful: [
    'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1530908295418-a12e326966ba?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=70',
  ],
  excited: [
    'https://images.unsplash.com/photo-1530908295418-a12e326966ba?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1920&q=70',
  ],
  energetic: [
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1530908295418-a12e326966ba?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1920&q=70',
  ],
  empowered: [
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?auto=format&fit=crop&w=1920&q=70',
  ],
  hopeful: [
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1530908295418-a12e326966ba?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=70',
  ],
  love: [
    'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1920&q=70',
  ],
  romantic: [
    'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1920&q=70',
  ],
  nostalgic: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1920&q=70',
  ],
  bittersweet: [
    'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1920&q=70',
  ],
  calm: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=70',
  ],
  peaceful: [
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1920&q=70',
  ],
  chill: [
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1495464205093-c84d8c7c83ad?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=70',
  ],
  focused: [
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?auto=format&fit=crop&w=1920&q=70',
  ],
  focus: [
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?auto=format&fit=crop&w=1920&q=70',
  ],
  sad: [
    'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1493540447904-49763eecf55f?auto=format&fit=crop&w=1920&q=70',
  ],
  melancholy: [
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1920&q=70',
  ],
  lonely: [
    'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1920&q=70',
  ],
  heartbroken: [
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?auto=format&fit=crop&w=1920&q=70',
  ],
  dawn: [
    'https://images.unsplash.com/photo-1495464205093-c84d8c7c83ad?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1920&q=70',
  ],
  rainy: [
    'https://images.unsplash.com/photo-1493540447904-49763eecf55f?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1920&q=70',
  ],
  anxious: [
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1920&q=70',
  ],
  angry: [
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?auto=format&fit=crop&w=1920&q=70',
  ],
  frustrated: [
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=70',
  ],
  overwhelmed: [
    'https://images.unsplash.com/photo-1495464205093-c84d8c7c83ad?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1920&q=70',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=70',
  ],
};

const KOREAN_TO_KEY = {
  '기쁨':'happy', '슬픔':'sad', '설렘':'love', '새벽':'dawn', '분노':'angry',
  '행복':'happy', '신남':'excited', '에너지':'energetic', '에너지넘침':'energetic',
  '우울':'melancholy', '외로움':'lonely', '상심':'heartbroken',
  '새벽감성':'dawn', '추억':'nostalgic', '추억에젖은':'nostalgic',
  '차분':'calm', '평화':'peaceful', '평화로움':'peaceful',
  '멍':'chill', '멍때림':'chill', '집중':'focused', '집중하는':'focused',
  '로맨틱':'romantic', '답답':'frustrated', '답답함':'frustrated',
  '불안':'anxious', '벅참':'overwhelmed', '감동':'overwhelmed',
  '비':'rainy', '비오는날':'rainy', '비오는날감성':'rainy',
  '희망':'hopeful', '희망찬':'hopeful', '달콤쌉쌀':'bittersweet',
  '자신감':'empowered', '자신감넘치는':'empowered', '기본':'default',
};

function isHomePage() {
  const f = window.location.pathname.split('/').pop();
  return f === 'index.html' || f === '' || f === '/';
}

function pickRandomPhoto(emotion) {
  const list = EMOTION_PHOTOS[emotion];
  if (!list || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

// ════════════════════════════════════════════
// 핵심 변경 부분
// ════════════════════════════════════════════
function resolveAndApplyPhoto(emotion) {
  const cacheKey = `tify_photo_${emotion}`;

  // 1) 이번 세션에서 이미 이 감정 사진을 골랐다면 그대로 사용
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    document.body.style.setProperty('--bg-photo', cached);
    return;
  }

  // 2) 처음이면 랜덤으로 1장 선택 + 캐싱
  const url = pickRandomPhoto(emotion);
  if (!url) {
    document.body.style.setProperty('--bg-photo', 'none');
    return;
  }

  const img = new Image();
  img.onload = () => {
    const cssValue = `url('${url}')`;
    document.body.style.setProperty('--bg-photo', cssValue);
    sessionStorage.setItem(cacheKey, cssValue);  // 이번 세션 내내 같은 사진
  };
  img.onerror = () => {
    console.warn('🖼️ 사진 로딩 실패:', url);
    document.body.style.setProperty('--bg-photo', 'none');
  };
  img.src = url;
}

let lastAppliedEmotion = null;

function updateTheme() {
  // 1️⃣ 홈 화면 → 무지개 오로라
  if (isHomePage()) {
    document.body.setAttribute('data-theme', 'home');
    document.body.style.setProperty('--bg-photo', 'none');
    lastAppliedEmotion = 'home';
    return;
  }

  // 2️⃣ 감정 읽기
  let emotion = null;
  try {
    const raw = sessionStorage.getItem('analysisResult');
    if (raw && raw !== 'undefined') {
      const ai = JSON.parse(raw);
      emotion = ai.category;
    }
  } catch (e) {}

  if (!emotion) emotion = localStorage.getItem('tify_last_emotion');
  if (emotion && KOREAN_TO_KEY[emotion]) emotion = KOREAN_TO_KEY[emotion];
  if (!emotion || (!EMOTION_PHOTOS[emotion] && emotion !== 'default')) {
    emotion = 'calm';
  }

  // 3️⃣ 같은 감정이면 재적용하지 않음 (불필요한 깜빡임 방지)
  if (lastAppliedEmotion === emotion) return;
  lastAppliedEmotion = emotion;

  document.body.setAttribute('data-theme', emotion);
  localStorage.setItem('tify_last_emotion', emotion);
  resolveAndApplyPhoto(emotion);
}

window.updateTheme = updateTheme;

// 페이지 로드 시 1번만
document.addEventListener('DOMContentLoaded', updateTheme);

// ❌ window.addEventListener('storage', updateTheme); 제거
//    (다른 탭의 localStorage 변경이 의도치 않은 재호출을 일으킬 수 있음)

// ════════════════════════════════════════════
// TIFY 로고 클릭 → 홈으로 (새로고침과 함께)
// ════════════════════════════════════════════
document.addEventListener('click', (e) => {
  const logo = e.target.closest('.logo');
  if (!logo) return;
  e.preventDefault();
  if (isHomePage()) {
    window.location.reload();
  } else {
    window.location.href = 'index.html';
  }
});