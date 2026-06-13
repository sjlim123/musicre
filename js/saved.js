/**
 * js/saved.js v4 — 저장한 음악 (단순 그리드)
 * · 감정별 토글(무드보드) 제거
 * · Spotify 임베드로 바로 재생 가능
 * · ♥ 버튼으로 저장 취소
 */

let savedSongs = [];

function songKey(s) {
  return (s?.title || '제목없음') + '|' + (s?.artist || '가수없음');
}

function loadSavedSongs() {
  try {
    let raw = localStorage.getItem('savedSongs');
    if (!raw || raw === 'undefined') raw = '[]';
    savedSongs = JSON.parse(raw);
  } catch (e) {
    savedSongs = [];
  }
  renderSaved();
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function songCardHTML(s) {
  if (!s) return '';
  const k = songKey(s);
  if (s.spotifyId) {
    const url = `https://open.spotify.com/embed/track/${s.spotifyId}?utm_source=generator&theme=0`;
    return `
      <div class="saved-card">
        <iframe
          src="${url}"
          width="100%" height="352" frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="${escapeHtml(s.title || 'song')}"></iframe>
        <button class="remove-btn" data-key="${k}" title="저장 취소">♥</button>
      </div>`;
  }
  const desc = s.description || s.desc || '내가 저장한 소중한 곡이에요.';
  return `
    <div class="saved-card saved-card-fallback">
      <button class="remove-btn" data-key="${k}" title="저장 취소">♥</button>
      <div class="fallback-cover">🎵</div>
      <div class="fallback-info">
        <div class="title">${escapeHtml(s.title || '제목없음')}</div>
        <div class="artist">${escapeHtml(s.artist || '가수없음')}</div>
        <div class="desc">${escapeHtml(desc)}</div>
      </div>
    </div>`;
}

function renderSaved() {
  const grid    = document.getElementById('savedList');
  const countEl = document.getElementById('savedCount');

  if (countEl) countEl.textContent = savedSongs.length > 0 ? `${savedSongs.length}곡` : '';
  if (!grid) return;

  // 혹시 이전 버전의 토글이 남아있으면 제거
  const oldToggle = document.querySelector('.saved-toggle');
  if (oldToggle) oldToggle.remove();

  if (savedSongs.length === 0) {
    grid.className = 'saved-grid';
    grid.innerHTML = `
      <div class="saved-empty">
        <div class="empty-icon">🎵</div>
        <p class="empty-title">아직 저장한 음악이 없어요</p>
        <p class="empty-sub">추천 화면에서 마음에 드는 곡에<br>♡ 버튼을 눌러 저장해보세요!</p>
        <a href="index.html" class="empty-btn">감정 입력하러 가기 →</a>
      </div>`;
    return;
  }

  grid.className = 'saved-grid';
  grid.innerHTML = savedSongs.map(songCardHTML).join('');
}

// 저장 취소
document.addEventListener('click', e => {
  const rm = e.target.closest('.remove-btn');
  if (!rm) return;
  const key = rm.dataset.key;
  savedSongs = savedSongs.filter(s => songKey(s) !== key);
  localStorage.setItem('savedSongs', JSON.stringify(savedSongs));
  renderSaved();
});

loadSavedSongs();