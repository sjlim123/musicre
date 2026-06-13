/**
 * js/share-card.js — 결과 페이지에서 9:16 감정 카드 PNG 다운로드
 * · html2canvas 동적 로드
 * · 인스타 스토리 사이즈 (540x960) → 고해상도 PNG로 저장
 * · 사용자가 자발적으로 공유 → 바이럴 동력
 */

(function () {
  if (window.__tifyShareCard) return;
  window.__tifyShareCard = true;

  function isResultPage() {
    return window.location.pathname.split('/').pop() === 'result.html';
  }

  function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
      if (window.html2canvas) return resolve();
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function getAnalysisData() {
    try {
      const raw = sessionStorage.getItem('analysisResult');
      if (!raw || raw === 'undefined') return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  const MOOD_LABELS_KR = {
    happy:'행복', joyful:'기쁨', excited:'신남', energetic:'에너지',
    empowered:'자신감', hopeful:'희망', love:'설렘', romantic:'로맨틱',
    nostalgic:'추억', bittersweet:'달콤쌉쌀', calm:'차분', peaceful:'평화',
    chill:'멍', focused:'집중', sad:'슬픔', melancholy:'우울',
    lonely:'외로움', heartbroken:'상심', dawn:'새벽', rainy:'비',
    anxious:'불안', angry:'분노', frustrated:'답답', overwhelmed:'벅참',
    '기본':'오늘의 감정','기쁨':'기쁨','슬픔':'슬픔','설렘':'설렘','새벽':'새벽','분노':'분노',
  };

  const MOOD_LABELS_EN = {
    happy:'Happiness', joyful:'Joy', excited:'Excitement', energetic:'Energy',
    empowered:'Confidence', hopeful:'Hope', love:'Love', romantic:'Romance',
    nostalgic:'Nostalgia', bittersweet:'Bittersweet', calm:'Calm',
    peaceful:'Peace', chill:'Chill', focused:'Focus', sad:'Sadness',
    melancholy:'Melancholy', lonely:'Loneliness', heartbroken:'Heartbreak',
    dawn:'Dawn', rainy:'Rain', anxious:'Anxiety', angry:'Anger',
    frustrated:'Frustration', overwhelmed:'Overwhelmed',
    '기본':'Today\'s Mood','기쁨':'Joy','슬픔':'Sadness','설렘':'Love','새벽':'Dawn','분노':'Anger',
  };

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function buildCardElement(analysis) {
    const songs = (analysis.songs || []).slice(0, 5);
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;
    const cat = analysis.category || '기본';
    const krLabel = MOOD_LABELS_KR[cat] || cat;
    const enLabel = MOOD_LABELS_EN[cat] || cat;

    const card = document.createElement('div');
    card.className = 'mood-card-canvas';
    card.innerHTML = `
      <div class="mc-header">
        <div class="mc-date">${dateStr}</div>
        <div class="mc-mood">${escapeHtml(krLabel)}</div>
        <div class="mc-mood-en">${escapeHtml(enLabel)}</div>
      </div>
      ${analysis.comfortMessage ? `<div class="mc-message">${escapeHtml(analysis.comfortMessage)}</div>` : ''}
      <div class="mc-songs">
        ${songs.map((s, i) => `
          <div class="mc-song">
            <div class="mc-song-num">${i+1}</div>
            <div class="mc-song-info">
              <div class="mc-song-title">${escapeHtml(s.title || '제목없음')}</div>
              <div class="mc-song-artist">${escapeHtml(s.artist || '가수없음')}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="mc-footer">
        <div>This Is For You</div>
        <div class="mc-logo">TIFY</div>
      </div>
    `;
    document.body.appendChild(card);
    return card;
  }

  function showToast(msg) {
    let toast = document.getElementById('tify-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tify-toast';
      toast.style.cssText = 'position:fixed;bottom:130px;left:50%;transform:translateX(-50%);background:rgba(20,20,30,0.95);color:#fff;padding:14px 24px;border-radius:14px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.12);backdrop-filter:blur(20px);transition:opacity 0.3s;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
  }

  async function generateCard() {
    const analysis = getAnalysisData();
    if (!analysis) {
      showToast('분석 결과를 찾을 수 없어요 😢');
      return;
    }

    showToast('🎴 카드 생성 중...');

    try {
      await loadHtml2Canvas();
      const card = buildCardElement(analysis);

      // 잠깐 렌더 대기 (폰트 로딩)
      await new Promise(r => setTimeout(r, 200));

      const canvas = await window.html2canvas(card, {
        backgroundColor: '#050518',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      card.remove();

      canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.download = `tify-mood-card-${Date.now()}.png`;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        showToast('✅ 다운로드 완료! 인스타 스토리에 올려보세요');
      }, 'image/png');
    } catch (e) {
      console.error('카드 생성 실패', e);
      showToast('카드 생성에 실패했어요 😢');
    }
  }

  function init() {
    if (!isResultPage()) return;

    const actions = document.querySelector('.result-actions');
    if (!actions) return;

    const btn = document.createElement('button');
    btn.className = 'share-card-btn';
    btn.type = 'button';
    btn.innerHTML = '🎴 내 감정 카드 다운로드';
    btn.addEventListener('click', generateCard);

    actions.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();