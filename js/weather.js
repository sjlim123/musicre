// js/weather.js — 실제 위치 기반 날씨 조회 + sessionStorage 저장
// ⚠️ 이전 버전의 "함수 밖 잘못된 코드 블록"을 제거함 (이게 스크립트를 죽이던 원인)

function getWeatherIcon(condition) {
  if (!condition) return '☁️';
  if (condition.includes('맑') || condition.includes('해')) return '☀️';
  if (condition.includes('구름') || condition.includes('흐')) return '☁️';
  if (condition.includes('비')) return '🌧️';
  if (condition.includes('눈')) return '❄️';
  if (condition.includes('천둥') || condition.includes('번개')) return '⛈️';
  return '🌫️';
}

async function fetchRealWeather(lat, lon) {
  try {
    const url = `http://localhost:3000/api/weather?lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('서버에서 날씨를 가져오지 못했습니다.');
    return await response.json();
  } catch (error) {
    console.error('날씨 API 호출 에러:', error);
    return null;
  }
}

function renderWeather(weatherData) {
  if (!weatherData) return;

  const temp      = Math.round(weatherData.temp);
  const desc      = weatherData.description;
  const condition = weatherData.weather;
  const loc       = weatherData.city;
  const icon      = getWeatherIcon(condition);

  // 사이드바 날씨 카드(있으면) 갱신
  const ic = document.getElementById('wIcon');
  const tp = document.getElementById('wTemp');
  const ds = document.getElementById('wDesc');
  const lc = document.getElementById('wLoc');
  if (ic) ic.textContent = icon;
  if (tp) tp.textContent = temp + '°';
  if (ds) ds.textContent = desc;
  if (lc) lc.textContent = '📍 ' + loc;

  // 홈 상단 배너(있으면) 갱신
  const banner = document.getElementById('bannerText');
  if (banner) {
    const bannerIcon = document.querySelector('.weather-banner .ic');
    if (bannerIcon) bannerIcon.textContent = icon;
    banner.textContent = `오늘은 ${desc} · ${temp}°`;
  }

  // ✅ AI 프롬프트 + 날씨 위젯용 데이터 저장
  sessionStorage.setItem('currentWeather', JSON.stringify({
    temp, desc, condition, location: loc, icon,
  }));

  // 날씨 위젯에게 "데이터 준비됨" 알림
  window.dispatchEvent(new Event('tify-weather-ready'));
}

function initWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log(`📍 위치 확인: ${lat}, ${lon}`);
        const weatherData = await fetchRealWeather(lat, lon);
        renderWeather(weatherData);
      },
      async () => {
        console.warn('위치 권한 거부 → 기본 위치(서울) 날씨 표시');
        const weatherData = await fetchRealWeather(37.5665, 126.9780);
        renderWeather(weatherData);
      }
    );
  } else {
    console.warn('Geolocation 미지원 → 기본 위치(서울)');
    fetchRealWeather(37.5665, 126.9780).then(renderWeather);
  }
}

initWeather();