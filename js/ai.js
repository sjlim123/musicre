// js/ai.js — 감정 분석

const MOOD_PROFILES = {
  happy:    { label:'기쁨이 가득한',     emoji:'😊', bars:{'기쁨':85,'설렘':62,'활력':78,'평온':54},           msg:'좋은 하루를 보내고 계시는군요! 이 기분 그대로 즐길 수 있는 곡들을 모아봤어요. ✨' },
  sad:      { label:'지친 하루의 끝에서', emoji:'😢', bars:{'피로감':76,'외로움':52,'안정 필요':80,'우울감':45}, msg:'오늘 하루도 정말 수고했어요. 천천히 호흡하며 이 노래들과 함께 쉬어가요. ☕' },
  dawn:     { label:'고요한 새벽 감성',   emoji:'🌙', bars:{'감성':82,'고요함':70,'생각이 많음':65,'외로움':48}, msg:'잠 못 드는 새벽이군요. 조용히 마음을 정리하기 좋은 곡들을 골랐어요. 🌌' },
  focus:    { label:'집중이 필요한 시간', emoji:'🎧', bars:{'집중력':80,'몰입':72,'차분함':68,'긴장':40},        msg:'몰입의 시간을 함께할 음악이에요. 흐름을 끊지 않게 잔잔하게 흘려보낼게요. 📚' },
  chill:    { label:'느긋한 멍 때리기',   emoji:'☁️', bars:{'여유':78,'편안함':74,'느슨함':70,'활력':32},       msg:'잠시 모든 걸 내려놓고 쉬어가요. 부드럽게 흘러가는 음악과 함께. ☁️' },
  love:     { label:'설레는 마음',        emoji:'💗', bars:{'설렘':88,'두근거림':75,'행복':70,'그리움':45},      msg:'마음이 따뜻해지는 순간이네요. 이 설렘을 더 풍성하게 만들어줄 곡들이에요. 💗' },
  angry:    { label:'답답한 마음',        emoji:'😠', bars:{'분노':75,'답답함':80,'긴장':68,'에너지':70},        msg:'화가 날 땐 음악으로 풀어내요. 마음껏 분출하고 다시 차분해질 수 있게. 🔥' },
  anxious:  { label:'불안한 마음',        emoji:'😰', bars:{'불안':82,'긴장':70,'안정 필요':85,'걱정':65},       msg:'잠시 깊게 숨을 들이쉬어 봐요. 천천히, 같이 진정해볼게요. 🫧' },
  energetic:{ label:'에너지 폭발',        emoji:'⚡', bars:{'활력':90,'기대감':78,'설렘':70,'집중':55},          msg:'에너지가 넘치네요! 이 기세를 끌어올려줄 곡들로 함께 달려봐요. ⚡' },
  nostalgic:{ label:'추억 속의 하루',     emoji:'📷', bars:{'그리움':78,'잔잔함':72,'추억':85,'감성':68},        msg:'지난 시간을 떠올리고 있군요. 그 시절로 데려다줄 노래들이에요. 📷' },
  lonely:   { label:'홀로 있는 시간',     emoji:'🥀', bars:{'외로움':85,'고요함':70,'위로 필요':80,'우울감':55}, msg:'혼자라고 느낄 때, 음악은 가장 가까운 친구가 되어줄 거예요. 🌙' },
  rainy:    { label:'비 오는 날의 감성',  emoji:'🌧️', bars:{'잔잔함':80,'감성':75,'쓸쓸함':62,'평온':68},       msg:'비 오는 날에 어울리는 노래들을 골랐어요. 빗소리와 함께 들어보세요. ☔' },
};

function detectFromText(text){
  const t = text.toLowerCase();
  const map = [
    ['happy',     /행복|기쁘|좋아|신나|happy|즐거|기뻐/],
    ['sad',       /우울|슬프|울고|힘들|지쳤|sad|눈물|쓸쓸/],
    ['dawn',      /새벽|밤|night|잠 안|잠이 안|3시|두시/],
    ['focus',     /집중|공부|일|focus|몰입/],
    ['chill',     /멍|쉬|쉬고|chill|여유|편안/],
    ['love',      /설레|좋아해|사랑|love|두근|썸/],
    ['angry',     /화|짜증|열받|빡|angry|답답/],
    ['anxious',   /불안|걱정|초조|긴장|anxious/],
    ['energetic', /신난|에너지|운동|뛰|달리|energetic/],
    ['nostalgic', /추억|옛날|그리워|예전/],
    ['lonely',    /외로|혼자|lonely/],
    ['rainy',     /비|우산|장마|rainy/],
  ];
  for(const [m,r] of map) if(r.test(t)) return m;
  return null;
}

function pickCategory(){
  const chips = JSON.parse(sessionStorage.getItem('moodChips') || '[]');
  if(chips.length) return chips[0];
  const text = sessionStorage.getItem('userMood') || '';
  return detectFromText(text) || 'sad';
}

function applyWeatherBias(profile, weather){
  if(!weather) return profile;
  const p = JSON.parse(JSON.stringify(profile));
  if(weather.key === 'rainy'){
    Object.keys(p.bars).forEach(k=>{
      if(k.includes('감성')||k.includes('잔잔')||k.includes('쓸쓸')) p.bars[k] = Math.min(95, p.bars[k]+8);
    });
    p.msg = '☔ ' + p.msg + ' 오늘은 비도 오니까요.';
  } else if(weather.key === 'night'){
    p.msg = '🌙 고요한 밤, ' + p.msg;
  } else if(weather.key === 'sunny'){
    Object.keys(p.bars).forEach(k=>{
      if(k.includes('활력')||k.includes('기쁨')) p.bars[k] = Math.min(95, p.bars[k]+5);
    });
  }
  return p;
}

window.addEventListener('load', ()=>{
  const cat     = pickCategory();
  const weather = window.TIFY_WEATHER;
  const base    = MOOD_PROFILES[cat] || MOOD_PROFILES.sad;
  const profile = applyWeatherBias(base, weather);

  const echo = document.getElementById('inputEcho');
  if(echo) echo.textContent = `"${sessionStorage.getItem('userMood')||''}"`;

  // 막대 렌더
  const bars = document.getElementById('bars');
  if(bars){
    bars.innerHTML = Object.entries(profile.bars).map(([k,v])=>`
      <div class="bar-row">
        <div class="bar-label">${k}</div>
        <div class="bar-track"><div class="bar-fill" data-pct="${v}"></div></div>
        <div class="bar-pct">${v}%</div>
      </div>`).join('');
    requestAnimationFrame(()=>{
      document.querySelectorAll('.bar-fill').forEach(el=>{
        el.style.width = el.dataset.pct + '%';
      });
    });
  }

  // 기존 analysisResult 읽기 (Gemini가 저장한 category, color 보존)
  let savedResult = {};
  try {
    const raw = sessionStorage.getItem('analysisResult');
    if(raw && raw !== 'undefined') savedResult = JSON.parse(raw);
  } catch(e) {}

  // ✅ 핵심 수정: category와 color를 반드시 보존
  const result = {
    label:          profile.label,
    emoji:          profile.emoji,
    bars:           profile.bars,
    comfortMessage: savedResult.comfortMessage || profile.msg,
    weather:        weather,
    songs:          savedResult.songs,
    category:       savedResult.category || cat,  // Gemini 카테고리 → 없으면 chip 키
    color:          savedResult.color    || null, // Gemini 커스텀 색상 보존
  };

  sessionStorage.setItem('analysisResult', JSON.stringify(result));

  setTimeout(()=>{ location.href = 'result.html'; }, 3200);
});