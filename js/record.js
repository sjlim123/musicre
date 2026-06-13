/**
 * js/record.js v5 — 달력 + 1년 감정 히트맵
 * · 달력 ‹ › 버튼 정상 작동
 * · 날짜 클릭 → 그날 기록 "모두" 표시 (누적), 곡은 Spotify 임베드로 재생
 * · 히트맵 칸 클릭 → 그날 기록을 위 상세 패널에 표시 + 스크롤
 * · 자체 CSS 주입 (style.css 수정 불필요)
 */

let currentDate = new Date();
let selectedDateKey = null;

const EMOTION_COLORS = {
  happy: '#ffb87a', joyful: '#ffd47a', excited: '#ff9ec7',
  energetic: '#c5b5ff', empowered: '#ffd47a', hopeful: '#a5e0ff',
  love: '#ff8db8', romantic: '#ff8db8', nostalgic: '#e8b890',
  bittersweet: '#d4a08a', calm: '#80c8d8', peaceful: '#80d090',
  chill: '#90a8c8', focus: '#70c8b8', focused: '#70c8b8',
  sad: '#9bb4d8', melancholy: '#9bb4d8', lonely: '#7090b5',
  heartbroken: '#c08090', dawn: '#b09fd8', rainy: '#8090a8',
  anxious: '#d4aa50', angry: '#ff9090', frustrated: '#ffac80',
  overwhelmed: '#c0a0f8', '기본': '#c0a0f8', '기타': '#c0a0f8',
};

const KOR_LABELS = {
  happy: '행복', joyful: '기쁨', excited: '신남', energetic: '에너지',
  empowered: '자신감', hopeful: '희망', love: '설렘', romantic: '로맨틱',
  nostalgic: '추억', bittersweet: '달콤쌉쌀', calm: '차분', peaceful: '평화',
  chill: '멍', focus: '집중', focused: '집중', sad: '슬픔', melancholy: '우울',
  lonely: '외로움', heartbroken: '상심', dawn: '새벽', rainy: '비',
  anxious: '불안', angry: '분노', frustrated: '답답', overwhelmed: '벅참',
  '기본': '기본', '기타': '기타',
  '기쁨':'기쁨','슬픔':'슬픔','설렘':'설렘','새벽':'새벽','분노':'분노',
};
const KOR_TO_EN = { '기쁨':'happy','슬픔':'sad','설렘':'love','새벽':'dawn','분노':'angry' };

// ─── CSS 자동 주입 ───
function injectRecordCSS() {
  if (document.getElementById('record-extra-style')) return;
  const css = `
    /* 히트맵 */
    .heatmap-card { margin-top: 32px; border: 1px solid rgba(255,255,255,0.10);
      border-radius: 24px; padding: 32px;
      background: linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03));
      backdrop-filter: blur(20px); }
    .heatmap-grid { display: grid; grid-template-columns: repeat(53, 1fr); gap: 3px; margin-bottom: 18px; }
    .heatmap-cell { aspect-ratio: 1; border-radius: 3px; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: all 0.2s ease; position: relative; }
    .heatmap-cell.has-record { border-color: rgba(255,255,255,0.18); }
    .heatmap-cell:hover { transform: scale(1.6); z-index: 10;
      border-color: rgba(255,255,255,0.6) !important; box-shadow: 0 4px 14px rgba(0,0,0,0.4); }
    .heatmap-tooltip { position: absolute; bottom: calc(100% + 8px); left: 50%;
      transform: translateX(-50%); background: rgba(15,15,25,0.96);
      border: 1px solid rgba(255,255,255,0.18); padding: 6px 11px; border-radius: 8px;
      font-size: 11px; font-weight: 600; color: #fff; white-space: nowrap;
      pointer-events: none; opacity: 0; transition: opacity 0.2s; z-index: 20; }
    .heatmap-cell:hover .heatmap-tooltip { opacity: 1; }
    .heatmap-legend { display: flex; align-items: center; gap: 12px; margin-top: 16px;
      font-size: 11px; color: rgba(255,255,255,0.6); flex-wrap: wrap; }
    .heatmap-legend-bar { display: flex; gap: 3px; }
    .heatmap-legend-cell { width: 12px; height: 12px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.1); }
    .stats-card { display: none !important; }

    /* 상세 패널 — 여러 기록 누적 */
    .rd-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px;
      padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .rd-head .date { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
    .rd-count { margin-left: auto; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.55);
      padding: 4px 12px; background: rgba(255,255,255,0.06); border-radius: 20px; }
    .rd-block { margin-bottom: 22px; }
    .rd-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 22px 0; }
    .rd-mood { font-size: 16px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px; }
    .rd-time { margin-left: auto; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.5); }
    .rd-text { font-style: italic; color: rgba(255,255,255,0.78); font-size: 14px; margin: 8px 0; line-height: 1.6; }
    .rd-comfort { color: rgba(255,255,255,0.88); font-size: 13px; margin: 8px 0 12px; line-height: 1.6; }
    .rd-songs { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
    .rd-embed iframe { width: 100%; height: 80px; border: 0; border-radius: 10px; display: block; }
    .rd-song-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px;
      background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
    .rd-song-item .rs-thumb { width: 40px; height: 40px; border-radius: 8px; display: flex;
      align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .rd-song-item .t { font-weight: 700; font-size: 14px; color: #fff; }
    .rd-song-item .a { color: rgba(255,255,255,0.65); font-size: 12px; margin-top: 2px; }
    .record-detail { max-height: 620px; overflow-y: auto; }

    @media (max-width: 900px) { .heatmap-grid { grid-template-columns: repeat(26, 1fr); } }
  `;
  const style = document.createElement('style');
  style.id = 'record-extra-style';
  style.textContent = css;
  document.head.appendChild(style);
}

function loadAllRecords() {
  try {
    const raw = localStorage.getItem('records');
    if (!raw || raw === 'undefined') return {};
    return JSON.parse(raw);
  } catch (e) { return {}; }
}
function dateKey(y, m, d) { return `${y}-${m+1}-${d}`; }
function getRecordsForDate(y, m, d) {
  const records = loadAllRecords();
  const key = dateKey(y, m, d);
  const matches = [];
  for (const k in records) {
    if (k.startsWith(key + '_') || k === key) matches.push(records[k]);
  }
  return matches;
}
function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── 달력 ───
function renderCalendar() {
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthEl = document.getElementById('calMonth');
  if (monthEl) monthEl.textContent = `${year}년 ${month+1}월`;

  const grid = document.getElementById('calGrid');
  if (!grid) return;

  const days = ['일','월','화','수','목','금','토'];
  let html = days.map((d, i) => `<div class="dow${i===0?' sun':''}">${d}</div>`).join('');

  const firstDay = new Date(year, month, 1).getDay();
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-cell empty"></div>`;

  const lastDate = new Date(year, month+1, 0).getDate();
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

  for (let d = 1; d <= lastDate; d++) {
    const isToday = isThisMonth && today.getDate() === d;
    const recs = getRecordsForDate(year, month, d);
    const dayOfWeek = new Date(year, month, d).getDay();
    const key = dateKey(year, month, d);
    html += `
      <div class="cal-cell${dayOfWeek===0?' sun':''}${isToday?' today':''}${selectedDateKey===key?' selected':''}"
           data-key="${key}">
        ${d}${recs.length ? '<div class="marker"></div>' : ''}
      </div>`;
  }
  grid.innerHTML = html;

  grid.querySelectorAll('.cal-cell:not(.empty)').forEach(cell => {
    cell.addEventListener('click', () => {
      selectedDateKey = cell.dataset.key;
      const [y, m, d] = cell.dataset.key.split('-').map(Number);
      renderDetail(y, m-1, d);
      renderCalendar();
    });
  });
}

// ─── 상세 (하루 여러 기록 누적 + 곡 재생) ───
function renderDetail(year, month, day) {
  const detail = document.getElementById('recordDetail');
  if (!detail) return;

  const recs = getRecordsForDate(year, month, day);

  if (recs.length === 0) {
    detail.innerHTML = `
      <div class="rd-head"><div class="date">${month+1}월 ${day}일</div></div>
      <p style="text-align:center;color:rgba(255,255,255,0.55);padding:40px 0;line-height:1.7;">
        이 날의 기록이 없어요 🌙<br>
        <span style="font-size:13px;color:rgba(255,255,255,0.4)">홈에서 감정을 입력하면 자동 저장돼요</span>
      </p>`;
    return;
  }

  const blocks = recs.map(r => {
    const moodKey = KOR_TO_EN[r.category] || r.category;
    const moodLabel = KOR_LABELS[moodKey] || moodKey || '기타';
    const color = EMOTION_COLORS[moodKey] || '#c0a0f8';

    let songsHtml = '';
    if (Array.isArray(r.songs)) {
      songsHtml = r.songs.slice(0, 5).map(s => {
        if (s && s.spotifyId) {
          return `<div class="rd-embed">
            <iframe src="https://open.spotify.com/embed/track/${s.spotifyId}?utm_source=generator&theme=0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"></iframe></div>`;
        }
        return `<div class="rd-song-item">
            <div class="rs-thumb" style="background:linear-gradient(135deg,${color},#7b5cff)">🎵</div>
            <div><div class="t">${escapeHtml(s.title || '제목없음')}</div>
                 <div class="a">${escapeHtml(s.artist || '가수없음')}</div></div>
          </div>`;
      }).join('');
    }

    return `
      <div class="rd-block">
        <div class="rd-mood">
          <span style="color:${color};font-size:20px">●</span> ${moodLabel}
          <span class="rd-time">${r.time || ''}</span>
        </div>
        ${r.mood ? `<div class="rd-text">"${escapeHtml(r.mood)}"</div>` : ''}
        ${r.comfortMessage ? `<div class="rd-comfort">💡 ${escapeHtml(r.comfortMessage)}</div>` : ''}
        ${songsHtml ? `<div class="rd-songs">${songsHtml}</div>` : ''}
      </div>`;
  }).join('<div class="rd-divider"></div>');

  detail.innerHTML = `
    <div class="rd-head">
      <div class="date">${month+1}월 ${day}일</div>
      <div class="rd-count">${recs.length}개의 기록</div>
    </div>
    ${blocks}`;
}

// ─── 1년 히트맵 (칸 클릭 시 상세로) ───
function renderHeatmap() {
  const grid = document.getElementById('heatmapGrid');
  if (!grid) return;

  const records = loadAllRecords();
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  const startSun = new Date(start);
  startSun.setDate(startSun.getDate() - startSun.getDay());

  let html = '';
  const cursor = new Date(startSun);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  while (cursor <= todayEnd) {
    const y = cursor.getFullYear(), m = cursor.getMonth(), d = cursor.getDate();
    const key = dateKey(y, m, d);

    let recordsToday = [];
    for (const k in records) {
      if (k.startsWith(key + '_') || k === key) recordsToday.push(records[k]);
    }

    let cellStyle = '', tooltip = `${y}.${m+1}.${d} · 기록 없음`, hasRecClass = '';
    if (recordsToday.length > 0) {
      const r = recordsToday[0];
      const moodKey = KOR_TO_EN[r.category] || r.category;
      const color = EMOTION_COLORS[moodKey] || '#c0a0f8';
      const intensity = Math.min(0.4 + (recordsToday.length * 0.2), 1);
      cellStyle = `background:${color};opacity:${intensity}`;
      const label = KOR_LABELS[moodKey] || r.category;
      tooltip = `${y}.${m+1}.${d} · ${label} (${recordsToday.length}건)`;
      hasRecClass = ' has-record';
    }

    html += `
      <div class="heatmap-cell${hasRecClass}" style="${cellStyle}" data-key="${key}">
        <div class="heatmap-tooltip">${tooltip}</div>
      </div>`;
    cursor.setDate(cursor.getDate() + 1);
  }
  grid.innerHTML = html;

  // 칸 클릭 → 그날 상세 + 달력도 그 달로 이동 + 스크롤
  grid.querySelectorAll('.heatmap-cell.has-record').forEach(cell => {
    cell.addEventListener('click', () => {
      const [y, m, d] = cell.dataset.key.split('-').map(Number);
      selectedDateKey = cell.dataset.key;
      currentDate = new Date(y, m-1, 1);
      renderCalendar();
      renderDetail(y, m-1, d);
      const detail = document.getElementById('recordDetail');
      if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

// ─── 초기화 ───
function init() {
  injectRecordCSS();

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    renderCalendar();
  });
  if (nextBtn) nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    renderCalendar();
  });

  renderCalendar();
  renderHeatmap();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}