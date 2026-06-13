/**
 * js/chat.js — 입력 검증 후 즉시 analyzing.html 이동
 * API 호출은 analyzing.js에서 처리
 */
const form  = document.getElementById('inputForm');
const input = document.getElementById('moodInput');
const chips = document.getElementById('chips');
let selectedChips = [];
let selectedMoods = [];

chips?.addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  btn.classList.toggle('selected');
  const label = btn.dataset.label;
  const mood  = btn.dataset.mood;
  if (btn.classList.contains('selected')) {
    selectedChips.push(label);
    selectedMoods.push(mood);
  } else {
    selectedChips = selectedChips.filter(x => x !== label);
    selectedMoods = selectedMoods.filter(x => x !== mood);
  }
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text && selectedChips.length === 0) { input.focus(); return; }

  const finalText = [text, ...selectedChips].filter(Boolean).join(' / ');

  // sessionStorage에 저장
  sessionStorage.setItem('userMood',        finalText);
  sessionStorage.setItem('moodChips',       JSON.stringify(selectedMoods));
  sessionStorage.setItem('currentRecordId', Date.now().toString());

  // 버튼 잠깐 피드백 (overflow 없음)
  const btn = form.querySelector('button[type="submit"]');
  btn.innerHTML  = '⏳';
  btn.disabled   = true;

  // 즉시 analyzing 화면으로 이동
  setTimeout(() => { location.href = 'analyzing.html'; }, 150);
});