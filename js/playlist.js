/**
 * js/playlist.js v4 — 큰 앨범 카드 + 저장 + 공유 기능
 */
window.allSongs = [];
let analysis = {};
let savedKeys = new Set();

function songKey(s){ return (s?.title || '제목없음') + '|' + (s?.artist || '가수없음'); }

function loadSaved(){
  try {
    let raw = localStorage.getItem('savedSongs');
    if (!raw || raw === 'undefined') raw = '[]';
    savedKeys = new Set(JSON.parse(raw).map(songKey));
  } catch(e) { savedKeys = new Set(); }
}

async function loadSongs(){
  try {
    let rawAnalysis = sessionStorage.getItem('analysisResult');
    if (!rawAnalysis || rawAnalysis === 'undefined') rawAnalysis = '{}';
    analysis = JSON.parse(rawAnalysis);

    let rawSongs = sessionStorage.getItem('safeSongs');
    if (!rawSongs || rawSongs === 'undefined') {
      rawSongs = JSON.stringify(analysis.songs || []);
    }
    allSongs = JSON.parse(rawSongs);

    console.log("🎧 로드된 곡:", allSongs.length, "곡 / 카테고리:", analysis.category);

    if(analysis.comfortMessage){
      const msgEl = document.getElementById('comfortMsg');
      if(msgEl) msgEl.textContent = analysis.comfortMessage;
    }

    loadSaved();
    render();
    saveTodayRecord();
  } catch (error) {
    console.error("🚨 데이터 파싱 에러:", error);
    const list = document.getElementById('songList');
    if(list) list.innerHTML = `<p style="color:rgba(255,255,255,0.7);text-align:center;padding:40px;">데이터를 읽는 중 오류가 발생했습니다.<br>홈으로 돌아가서 다시 시도해주세요.</p>`;
  }
}

function render(){
  const list = document.getElementById('songList');
  if (!list) return;

  if(!allSongs || allSongs.length === 0){
    list.innerHTML = '<p style="color:rgba(255,255,255,0.75);text-align:center;padding:40px;font-size:15px;line-height:1.7;">AI가 추천한 곡을 아직 받지 못했어요.<br>홈 화면으로 돌아가서 다시 시도해주세요 😭</p>';
    return;
  }

  list.innerHTML = allSongs.map(s => {
    if(!s) return '';
    const k = songKey(s);
    const saved = savedKeys.has(k);
    const description = s.description || s.desc || "이 기분에 어울리는 곡이에요.";
    const shareTitle = `${s.title || '제목 없음'} - ${s.artist || '가수 없음'}`;

    if (s.spotifyId) {
      // Spotify 트랙 공유 URL
      const embedUrl = `https://open.spotify.com/embed/track/${s.spotifyId}?utm_source=generator&theme=0`;
      const shareUrl = `https://open.spotify.com/track/${s.spotifyId}`;
      return `
        <div class="song-card">
          <iframe
            src="${embedUrl}"
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="${s.title || 'song'}"></iframe>
          <div class="card-footer">
            <p class="desc-text">💡 ${description}</p>
            <button class="share-btn"
                    data-url="${shareUrl}"
                    data-title="${shareTitle.replace(/"/g, '&quot;')}"
                    title="친구에게 공유">🔗</button>
            <button class="save-btn ${saved?'saved':''}" data-key="${k}" title="${saved?'저장 취소':'저장'}">
              ${saved?'♥':'♡'}
            </button>
          </div>
        </div>`;
    } else {
      // Spotify ID 없을 때 → YouTube 검색 URL로 공유
      const ytQuery = encodeURIComponent(`${s.title} ${s.artist}`);
      const shareUrl = `https://www.youtube.com/results?search_query=${ytQuery}`;
      return `
        <div class="song-card song-card-fallback">
          <div class="song-thumb">🎵</div>
          <div class="song-info">
            <div class="title">${s.title || '제목 없음'}</div>
            <div class="artist">${s.artist || '가수 없음'}</div>
            <div class="desc">${description}</div>
          </div>
          <button class="share-btn"
                  data-url="${shareUrl}"
                  data-title="${shareTitle.replace(/"/g, '&quot;')}"
                  title="친구에게 공유">🔗</button>
          <button class="save-btn ${saved?'saved':''}" data-key="${k}" title="${saved?'저장 취소':'저장'}">
            ${saved?'♥':'♡'}
          </button>
        </div>`;
    }
  }).join('');
}

// ─────────────────────────────────────────────
// 토스트 알림 (alert 대신 부드러운 UX)
// ─────────────────────────────────────────────
function showToast(message) {
  let toast = document.getElementById('tify-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'tify-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 130px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: rgba(20,20,30,0.95);
      color: #fff;
      padding: 14px 24px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      z-index: 9999;
      opacity: 0;
      transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.12);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      max-width: 80vw;
      pointer-events: none;
      letter-spacing: 0.3px;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2500);
}

// ─────────────────────────────────────────────
// 통합 클릭 핸들러: 저장(♡) + 공유(🔗)
// ─────────────────────────────────────────────
document.getElementById('songList')?.addEventListener('click', async (e) => {

  // ─── 저장 버튼 ───
  const sv = e.target.closest('.save-btn');
  if (sv) {
    const key = sv.dataset.key;
    const song = allSongs.find(s => songKey(s) === key);
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem('savedSongs') || '[]'); } catch(e){}

    if(savedKeys.has(key)){
      arr = arr.filter(s => songKey(s) !== key);
      savedKeys.delete(key);
      sv.classList.remove('saved');
      sv.textContent = '♡';
      showToast('저장 취소되었어요');
    } else {
      if(song) arr.push(song);
      savedKeys.add(key);
      sv.classList.add('saved');
      sv.textContent = '♥';
      showToast('♥ 저장한 음악에 추가했어요');
    }
    localStorage.setItem('savedSongs', JSON.stringify(arr));
    return;
  }

  // ─── 공유 버튼 ───
  const sh = e.target.closest('.share-btn');
  if (sh) {
    const shareUrl   = sh.getAttribute('data-url');
    const shareTitle = sh.getAttribute('data-title');

    // [1] 모바일 브라우저: 네이티브 공유창 (카톡, 메시지, SNS 등)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text:  `이 노래 좋네요! 같이 들어요 🎧\n[${shareTitle}]`,
          url:   shareUrl,
        });
      } catch (error) {
        // 사용자가 공유 취소했을 때 — 무시
        console.log('공유 취소:', error.message);
      }
    }
    // [2] PC 브라우저: 클립보드에 링크 복사
    else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast(`📋 링크가 복사되었어요!\n친구에게 붙여넣기(Ctrl+V) 하세요`);
      } catch (err) {
        showToast('링크 복사에 실패했어요 😢');
      }
    }
    return;
  }
});

document.getElementById('mainPlay')?.addEventListener('click', () => {
  showToast('위 카드의 Spotify 플레이어에서 직접 재생해주세요 🎧');
});

// 감정 기록 저장
function saveTodayRecord(){
  if(!allSongs.length) return;
  const recordId = sessionStorage.getItem('currentRecordId');
  if(!recordId) return;

  const mood  = sessionStorage.getItem('userMood') || '';
  let records = {};
  try {
    const raw = localStorage.getItem('records');
    if(raw && raw !== 'undefined') records = JSON.parse(raw);
  } catch(e){}

  const today     = new Date();
  const uniqueKey = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}_${recordId}`;

  records[uniqueKey] = {
    date:           `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`,
    mood,
    comfortMessage: analysis.comfortMessage,
    songs:          allSongs.slice(0, 5),
    time:           today.toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'}),
    category:       analysis.category || '기타',
  };

  localStorage.setItem('records', JSON.stringify(records));
}

loadSongs();