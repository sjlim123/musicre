/**
 * js/analyzing.js — API 호출 + 분석 중 애니메이션
 * chat.js에서 navigating 즉시 실행됨
 */

const STEPS = [
  '당신의 마음을 읽는 중...',
  '감정 패턴을 분석하는 중...',
  '어울리는 음악 장르를 탐색 중...',
  '당신만을 위한 곡을 고르는 중...',
  '플레이리스트를 완성하는 중...',
  '마지막 손질을 하는 중...',
];

let apiDone  = false;
let animDone = false;

function tryNavigate() {
  if (apiDone && animDone) location.href = 'result.html';
}

// ─── 사용자 입력 표시 ───
const mood   = sessionStorage.getItem('userMood') || '';
const echoEl = document.getElementById('inputEcho');
if (echoEl) echoEl.textContent = `"${mood}"`;

// ─── 단계 메시지 애니메이션 ───
let stepIdx  = 0;
const stepEl = document.getElementById('analyzingStep');
const ticker = setInterval(() => {
  stepIdx = (stepIdx + 1) % STEPS.length;
  if (stepEl) {
    stepEl.style.opacity = '0';
    setTimeout(() => {
      stepEl.textContent = STEPS[stepIdx];
      stepEl.style.opacity = '1';
    }, 200);
  }
}, 900);

// ─── 최소 애니메이션 시간 3.5초 ───
setTimeout(() => {
  animDone = true;
  clearInterval(ticker);
  tryNavigate();
}, 3500);

// ─── API 호출 ───
(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/playlist', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ emotion: mood }),
    });
    if (!res.ok) throw new Error('서버 에러');
    const data = await res.json();

    // 결과 저장
    sessionStorage.setItem('analysisResult', JSON.stringify({
      comfortMessage: data.comfortMessage,
      songs:          data.songs,
      category:       data.category || 'calm',
      color:          data.color    || null,
    }));
    sessionStorage.setItem('safeSongs', JSON.stringify(data.songs));

    // 감정 테마 localStorage 저장 (탭 닫아도 유지)
    if (data.category) {
      localStorage.setItem('tify_emotion', data.category);
      localStorage.removeItem(`tify_scene_${data.category}`); // 씬 재랜덤
    }

    // theme.js 갱신 (배경이 실시간으로 감정에 맞게 바뀜)
    if (typeof updateTheme === 'function') updateTheme();

  } catch (err) {
    console.error('API 실패, fallback 사용:', err.message);
    const fallback = {
      comfortMessage: '오늘도 정말 수고 많으셨어요. 당신을 위한 선물입니다 🎧',
      songs: [
        { title: '밤편지',       artist: '아이유',   spotifyId: '4Rrt6RkQElZ5u6I5vjM7xY', description: '따뜻하고 포근한 감성의 곡이에요.' },
        { title: 'Ditto',        artist: 'NewJeans', spotifyId: '3r8RuvgaZAdZbxFlHOIu6A', description: '잔잔하게 위로가 되는 곡이에요.' },
        { title: '사건의 지평선', artist: '윤하',     spotifyId: '14848uVw6ZOfbLwY0S9L80', description: '깊은 감성의 발라드예요.' },
      ],
      category: 'calm',
      color: null,
    };
    sessionStorage.setItem('analysisResult', JSON.stringify(fallback));
    sessionStorage.setItem('safeSongs',      JSON.stringify(fallback.songs));
  }

  apiDone = true;
  tryNavigate();
})();