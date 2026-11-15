// 선택(Enter) 길게 누르기 = 빠르게 계속 내리기/쪽 넘기기. 손을 떼면 멈춤.
// 안경이 keyup 을 안 보내면 대신 「선택 두 번 빠르게」로 켜고, 아무 키나 누르면 끔.
// 쓰는 법: <script src="../hold.js"></script> 뒤에 Hold.step = dir => { ...한 걸음... ; return 계속할수있나 };
(() => {
  const HOLD_MS = 700, EVERY_MS = 300, DOUBLE_MS = 350;
  let timer = null, run = null, dir = 1, keyupSeen = false, lastDown = 0, latched = false;
  const badge = document.createElement('div');
  badge.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:99;background:#D97757;color:#000;font:bold 18px sans-serif;padding:6px 10px;border-radius:10px;display:none';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(badge));
  const scrollStep = d => { const y = scrollY; scrollBy(0, d * 280); return scrollY !== y; };
  const H = window.Hold = { step: scrollStep, scroll: scrollStep, steps: 0, running: () => !!run };
  function start() {
    if (run) return;
    H.steps = 0;
    badge.textContent = dir > 0 ? '⏬ 빠르게 내리는 중' : '⏫ 빠르게 올리는 중'; badge.style.display = 'block';
    const tick = () => { H.steps++; if (H.step(dir) === false) stop(); };
    tick(); run = setInterval(tick, EVERY_MS);
  }
  function stop() { clearTimeout(timer); timer = null; clearInterval(run); run = null; latched = false; badge.style.display = 'none'; }
  addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') dir = -1; else if (e.key === 'ArrowDown') dir = 1;
    if (latched && !e.repeat) { stop(); e.preventDefault(); return; }       // 두 번 누르기로 켠 것은 아무 키나 끔
    if (e.key !== 'Enter') return;
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    if (e.repeat) { e.preventDefault(); if (!run) start(); return; }      // 길게 누르면 오는 반복 keydown
    const now = Date.now();
    if (now - lastDown < DOUBLE_MS && !keyupSeen) { latched = true; start(); lastDown = 0; return; }
    lastDown = now;
    if (keyupSeen) timer = setTimeout(start, HOLD_MS);                      // keyup 이 오는 기기에서만 시간으로 판단
  }, true);
  addEventListener('keyup', e => {
    if (e.key === 'Enter') { keyupSeen = true; if (!latched) stop(); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') dir = 1;
  }, true);
  addEventListener('blur', stop);
})();
