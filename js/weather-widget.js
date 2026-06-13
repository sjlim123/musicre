/**
 * js/weather-widget.js — 우측 상단 "동그란 유리창" (은은하게 울렁이는 포트홀)
 * · 날씨를 창문 안에 표시
 * · 로딩 화면 모핑과 다른, 잔잔한 물결 느낌
 * · 자체 CSS 주입 + weather.js 의 'tify-weather-ready' 이벤트 수신
 */
(function () {
  if (window.__tifyWeatherWindow) return;
  window.__tifyWeatherWindow = true;

  function injectCSS() {
    if (document.getElementById('tify-weather-window-style')) return;
    const css = `
      .tify-weather-window {
        position: fixed;
        top: 26px;
        right: 26px;
        width: 124px;
        height: 124px;
        z-index: 200;
        animation: wwFadeIn 1.3s cubic-bezier(0.22,1,0.36,1);
        filter: drop-shadow(0 12px 32px rgba(40,30,90,0.45));
      }
      .tify-weather-window .ww-glass {
        position: absolute;
        inset: 0;
        border-radius: 50% 50% 48% 52% / 52% 48% 52% 48%;
        background: linear-gradient(150deg,
          rgba(255,255,255,0.16),
          rgba(160,140,255,0.10) 45%,
          rgba(60,40,120,0.20));
        backdrop-filter: blur(16px) saturate(150%);
        -webkit-backdrop-filter: blur(16px) saturate(150%);
        border: 1px solid rgba(255,255,255,0.30);
        box-shadow:
          inset 0 2px 12px rgba(255,255,255,0.35),
          inset 0 -14px 32px rgba(40,20,90,0.4),
          0 8px 28px rgba(0,0,0,0.3);
        animation: wwWobble 7s ease-in-out infinite;
        overflow: hidden;
      }
      /* 유리창에 흐르는 빛 반사 */
      .tify-weather-window .ww-glass::after {
        content: '';
        position: absolute;
        top: -60%; left: -30%;
        width: 70%; height: 220%;
        background: linear-gradient(transparent, rgba(255,255,255,0.20), transparent);
        transform: rotate(25deg);
        animation: wwSheen 6.5s ease-in-out infinite;
      }
      .tify-weather-window .ww-content {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
        color: #fff;
        text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        z-index: 2;
        pointer-events: none;
        text-align: center;
      }
      .ww-icon { font-size: 30px; line-height: 1; margin-bottom: 3px;
                 filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3)); }
      .ww-temp { font-size: 23px; font-weight: 800; letter-spacing: -0.02em; line-height: 1; }
      .ww-loc  { font-size: 10.5px; opacity: 0.82; font-weight: 600;
                 letter-spacing: 0.02em; margin-top: 3px; }
      .ww-loading { font-size: 11px; opacity: 0.72; line-height: 1.4; }

      @keyframes wwWobble {
        0%,100% { border-radius: 50% 50% 48% 52% / 52% 48% 52% 48%; }
        25%     { border-radius: 52% 48% 51% 49% / 48% 52% 49% 51%; }
        50%     { border-radius: 48% 52% 50% 50% / 51% 49% 52% 48%; }
        75%     { border-radius: 51% 49% 52% 48% / 52% 48% 48% 52%; }
      }
      @keyframes wwSheen {
        0%,100% { transform: rotate(25deg) translateX(-40px); opacity: 0; }
        50%     { transform: rotate(25deg) translateX(130px); opacity: 1; }
      }
      @keyframes wwFadeIn {
        0%   { opacity: 0; transform: translateY(-14px) scale(0.85); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @media (max-width: 900px) {
        .tify-weather-window { width: 98px; height: 98px; top: 16px; right: 16px; }
        .ww-icon { font-size: 24px; } .ww-temp { font-size: 19px; }
        .ww-loc { font-size: 9.5px; }
      }
    `;
    const style = document.createElement('style');
    style.id = 'tify-weather-window-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getWeather() {
    try {
      const raw = sessionStorage.getItem('currentWeather');
      if (!raw || raw === 'undefined') return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function getIcon(w) {
    if (w && w.icon) return w.icon;
    const c = String((w && (w.condition || w.desc)) || '').toLowerCase();
    if (c.includes('맑')||c.includes('해')||c.includes('clear')||c.includes('sun')) return '☀️';
    if (c.includes('구름')||c.includes('흐')||c.includes('cloud')) return '☁️';
    if (c.includes('비')||c.includes('rain')) return '🌧️';
    if (c.includes('눈')||c.includes('snow')) return '❄️';
    if (c.includes('천둥')||c.includes('번개')||c.includes('thunder')) return '⛈️';
    if (c.includes('안개')||c.includes('mist')||c.includes('fog')) return '🌫️';
    return '🌤';
  }

  let el = null;
  function ensureEl() {
    injectCSS();
    if (el && document.body.contains(el)) return el;
    el = document.createElement('div');
    el.className = 'tify-weather-window';
    el.innerHTML = `
      <div class="ww-glass"></div>
      <div class="ww-content"><span class="ww-loading">날씨<br>확인 중</span></div>`;
    document.body.appendChild(el);
    return el;
  }

  function update() {
    const w = getWeather();
    ensureEl();
    const content = el.querySelector('.ww-content');
    if (!w) {
      content.innerHTML = `<span class="ww-loading">날씨<br>확인 중</span>`;
      return false;
    }
    content.innerHTML = `
      <span class="ww-icon">${getIcon(w)}</span>
      <span class="ww-temp">${Math.round(w.temp)}°</span>
      <span class="ww-loc">${w.location || ''}</span>`;
    return true;
  }

  let tries = 0;
  function poll() {
    if (update()) return;
    if (tries++ < 15) setTimeout(poll, 1000);
  }

  function start() {
    ensureEl();
    poll();
    window.addEventListener('tify-weather-ready', update);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();