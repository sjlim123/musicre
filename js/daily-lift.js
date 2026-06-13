/**
 * js/daily-lift.js v4 — 홈 맨 위 "오늘의 한 곡" 큰 카드
 * · 앨범 표지 + 전체 플레이어 보이게 (152px 임베드, 무조건 재생)
 * · 표면에 사선으로 흐르는 광택(shine) + 상단 하이라이트 + 글로우
 * · Spotify 큐레이션 풀에서 랜덤 / 🔀 셔플 / × 닫기
 * · 자체 CSS 주입, 홈에서만 표시
 *
 * ※ 앞 3곡은 재생 확인된 곡. spotifyId 만 바꾸면 곡 교체 가능.
 */

const DAILY_LIFT_POOL = [
  // ── 기존 8곡 ──
  { title: '밤편지',                    artist: '아이유',            spotifyId: '1Bb6jVrsg8cXxMCBxIWJUn' },
  { title: 'Ditto',                    artist: 'NewJeans',          spotifyId: '3r8RuvgbX9s7ammBn07D3W' },
  { title: '사건의 지평선',              artist: '윤하',              spotifyId: '6RBziRcDeiho3iTPdtEeg9' },
  { title: 'River Flows in You',       artist: 'Yiruma',            spotifyId: '2agBDIr9MYDUducQPC1sFU' },
  { title: 'Experience',               artist: 'Ludovico Einaudi',  spotifyId: '1BncfTJAWxrsxyT9culBrj' },
  { title: "Comptine d'un autre ete",  artist: 'Yann Tiersen',      spotifyId: '14rZjW3RioG7WesZhYESso' },
  { title: 'Gymnopedie No.1',          artist: 'Erik Satie',        spotifyId: '5NGtFXVpXSvwunEIGeviY3' },
  { title: 'Weightless',               artist: 'Marconi Union',     spotifyId: '6kkwzB6hXLIONkEk9JciA6' },

  // ── Oasis 10곡 ──
  { title: 'Wonderwall',               artist: 'Oasis',             spotifyId: '5qqabIl2vWzo9ApSC317sa' },
  { title: "Don't Look Back In Anger", artist: 'Oasis',             spotifyId: '12dU3vAh6AFoJkisorfoUl' },
  { title: 'Champagne Supernova',      artist: 'Oasis',             spotifyId: '40bynawzslg9U7ACq07fAj' },
  { title: 'Live Forever',             artist: 'Oasis',             spotifyId: '5IfBLN9VPPJOwcKmAZhdXe' },
  { title: 'Supersonic',               artist: 'Oasis',             spotifyId: '1qr2GUENukq90wmJtbg3qr' },
  { title: 'Stop Crying Your Heart Out', artist: 'Oasis',           spotifyId: '5YciOakY5dB5dULkiLdCaf' },
  { title: 'Stand By Me',              artist: 'Oasis',             spotifyId: '0zxHSBTEKdH8CI3auJ7Jyc' },
  { title: 'Slide Away',               artist: 'Oasis',             spotifyId: '2iDM76B3zHr6khKkiX4vUr' },
  { title: 'Some Might Say',           artist: 'Oasis',             spotifyId: '6FBpIPlWYCQyXiJsmIDTOV' },
  { title: 'Cigarettes & Alcohol',     artist: 'Oasis',             spotifyId: '3nK2qGHdVAEOuVAmMSWQPW' },

  // ── The Beatles 5곡 ──
  { title: 'Here Comes The Sun',       artist: 'The Beatles',       spotifyId: '6dGnYIeXmHdcikdzNNDMm2' },
  { title: 'Let It Be',                artist: 'The Beatles',       spotifyId: '7iN1s7xHE4ifF5povM6A48' },
  { title: 'Come Together',            artist: 'The Beatles',       spotifyId: '2EqlS6tkEnglzr7tkKAAYD' },
  { title: 'Yesterday',                artist: 'The Beatles',       spotifyId: '3BQHpFgAp4l80e1XslIjNI' },
  { title: 'Hey Jude',                 artist: 'The Beatles',       spotifyId: '3m7V717IKZqZLW5qUIOxdD' },
];

(function () {
  if (window.__tifyDailyLift) return;
  window.__tifyDailyLift = true;

  function injectCSS() {
    if (document.getElementById('daily-lift-style')) return;
    const css = `
      .daily-lift-card {
        position: relative;
        width: 100%;
        max-width: 620px;
        margin: 0 auto 30px;
        padding: 18px 18px 16px;
        border-radius: 24px;
        background:
          linear-gradient(135deg,
            rgba(255,255,255,0.14) 0%,
            rgba(180,150,255,0.10) 40%,
            rgba(60,40,120,0.16) 100%);
        backdrop-filter: blur(26px) saturate(170%);
        -webkit-backdrop-filter: blur(26px) saturate(170%);
        border: 1px solid rgba(255,255,255,0.20);
        box-shadow:
          0 18px 48px rgba(40,20,90,0.45),
          inset 0 1px 0 rgba(255,255,255,0.35),
          inset 0 -20px 50px rgba(40,20,90,0.25);
        overflow: hidden;
        animation: dlFadeIn 1.3s cubic-bezier(0.22,1,0.36,1);
      }
      /* 사선으로 흐르는 광택 */
      .daily-lift-card::before {
        content: '';
        position: absolute;
        top: -120%; left: -40%;
        width: 55%; height: 340%;
        background: linear-gradient(
          to right,
          transparent,
          rgba(255,255,255,0.28),
          rgba(255,255,255,0.05),
          transparent);
        transform: rotate(22deg);
        animation: dlShine 5.5s ease-in-out infinite;
        pointer-events: none;
        z-index: 3;
      }
      /* 상단 하이라이트 */
      .daily-lift-card::after {
        content: '';
        position: absolute;
        top: 0; left: 12%;
        width: 76%; height: 40%;
        background: radial-gradient(ellipse at top,
          rgba(255,255,255,0.22), transparent 70%);
        pointer-events: none;
        z-index: 1;
      }

      .daily-lift-head {
        position: relative;
        z-index: 4;
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 14px;
        padding: 0 4px;
      }
      .dl-spark { font-size: 17px; filter: drop-shadow(0 0 6px rgba(255,210,150,0.6)); }
      .dl-label {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-style: italic;
        font-size: 21px;
        font-weight: 600;
        letter-spacing: 0.02em;
        background: linear-gradient(135deg, #fff 10%, #ffd9a8 45%, #e879f9 90%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        flex: 1;
        text-shadow: 0 2px 12px rgba(232,121,249,0.25);
      }
      .dl-sub {
        font-size: 11px;
        font-weight: 600;
        color: rgba(255,255,255,0.55);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-right: 6px;
      }
      .dl-btn {
        width: 30px; height: 30px;
        border-radius: 50%;
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.22);
        color: rgba(255,255,255,0.9);
        font-size: 14px;
        line-height: 1;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; padding: 0;
        transition: all 0.22s ease;
      }
      .dl-btn:hover {
        background: rgba(255,255,255,0.26);
        transform: scale(1.12) rotate(8deg);
        box-shadow: 0 0 14px rgba(255,255,255,0.3);
      }

      .daily-lift-embed {
        position: relative;
        z-index: 2;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      }
      .daily-lift-embed iframe {
        width: 100%;
        height: 152px;
        border: 0;
        display: block;
      }

      @keyframes dlShine {
        0%   { transform: rotate(22deg) translateX(-60px); opacity: 0; }
        18%  { opacity: 1; }
        45%  { transform: rotate(22deg) translateX(560px); opacity: 0; }
        100% { transform: rotate(22deg) translateX(560px); opacity: 0; }
      }
      @keyframes dlFadeIn {
        0%   { opacity: 0; transform: translateY(-14px) scale(0.96); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (max-width: 700px) {
        .daily-lift-card { max-width: 100%; }
        .dl-label { font-size: 18px; }
      }
    `;
    const style = document.createElement('style');
    style.id = 'daily-lift-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function isHomePage() {
    const f = window.location.pathname.split('/').pop();
    return f === 'index.html' || f === '' || f === '/';
  }
  function todayKey() { return new Date().toISOString().slice(0, 10); }

  function pickRandom() {
    return DAILY_LIFT_POOL[Math.floor(Math.random() * DAILY_LIFT_POOL.length)];
  }
  function getTodaySong(forceNew) {
    const today = todayKey();
    if (!forceNew) {
      const cached = localStorage.getItem('tify_daily_lift');
      if (cached) {
        try {
          const p = JSON.parse(cached);
          if (p.date === today && p.song) return p.song;
        } catch (e) {}
      }
    }
    const song = pickRandom();
    localStorage.setItem('tify_daily_lift', JSON.stringify({ date: today, song }));
    return song;
  }
  function isDismissedToday() {
    return localStorage.getItem('tify_daily_lift_dismissed') === todayKey();
  }
  function dismissToday() {
    localStorage.setItem('tify_daily_lift_dismissed', todayKey());
  }

  function embedHTML(song) {
    return `<iframe
      src="https://open.spotify.com/embed/track/${encodeURIComponent(song.spotifyId)}?utm_source=generator&theme=0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"></iframe>`;
  }

  function render() {
    if (!isHomePage()) return;
    if (isDismissedToday()) return;
    if (document.getElementById('daily-lift-card')) return;

    const home = document.querySelector('.home');
    if (!home) return;

    injectCSS();
    let song = getTodaySong(false);

    const card = document.createElement('div');
    card.id = 'daily-lift-card';
    card.className = 'daily-lift-card';
    card.innerHTML = `
      <div class="daily-lift-head">
        <span class="dl-spark">&#10024;</span>
        <span class="dl-label">오늘의 한 곡</span>
        <span class="dl-sub">Today's Pick</span>
        <button class="dl-btn dl-shuffle" type="button" title="다른 곡 뽑기">&#128256;</button>
        <button class="dl-btn dl-close" type="button" title="오늘은 그만 보기">&times;</button>
      </div>
      <div class="daily-lift-embed">${embedHTML(song)}</div>
    `;

    home.insertBefore(card, home.firstChild);

    card.querySelector('.dl-shuffle').addEventListener('click', () => {
      song = getTodaySong(true);
      card.querySelector('.daily-lift-embed').innerHTML = embedHTML(song);
    });

    card.querySelector('.dl-close').addEventListener('click', () => {
      dismissToday();
      card.style.transition = 'all 0.4s ease';
      card.style.opacity = '0';
      card.style.transform = 'translateY(-12px) scale(0.96)';
      setTimeout(() => card.remove(), 400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();