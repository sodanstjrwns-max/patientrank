// Patient Rank - Landing page interactions
(function () {
  'use strict';

  const overlay = document.getElementById('loading-overlay');
  const errBox = document.getElementById('scan-error');
  const input = document.getElementById('scan-url');
  const msg = document.getElementById('loading-message');

  const MESSAGES = [
    '구글 색인에서 키워드 긁는 중',
    '의료 키워드 매칭 중',
    '랭킹 데이터 정리 중',
    '검색량 기준으로 정렬 중',
    '거의 다 됐어요',
  ];
  const STEP_IDS = ['step-2', 'step-3', 'step-4'];

  function showError(text) {
    if (!errBox) return;
    errBox.textContent = text;
    errBox.classList.remove('hidden');
  }
  function clearError() {
    if (!errBox) return;
    errBox.classList.add('hidden');
    errBox.textContent = '';
  }

  function startLoading() {
    if (!overlay) return null;
    overlay.classList.remove('hidden');
    let i = 0;
    const msgTimer = setInterval(() => {
      i = (i + 1) % MESSAGES.length;
      if (msg) msg.textContent = MESSAGES[i] + '...';
    }, 1800);
    const stepTimers = STEP_IDS.map((id, idx) =>
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML = '<i class="fas fa-check text-accent"></i> ' + el.textContent.trim();
        }
      }, 1500 * (idx + 1))
    );
    return () => {
      clearInterval(msgTimer);
      stepTimers.forEach(clearTimeout);
      overlay.classList.add('hidden');
    };
  }

  function normalizeUrl(v) {
    if (!v) return '';
    v = v.trim().toLowerCase();
    if (!v) return '';
    const stripped = v.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!stripped.includes('.')) return '';
    return stripped;
  }

  window.__submitScan = async function (e) {
    if (e && e.preventDefault) e.preventDefault();
    clearError();
    const raw = (input && input.value) || '';
    const domain = normalizeUrl(raw);
    if (!domain) {
      showError('올바른 병원 홈페이지 URL을 입력해주세요 (예: example-hospital.com)');
      if (input) input.focus();
      return false;
    }
    const stopLoading = startLoading();
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: domain }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (stopLoading) stopLoading();
        if (data.error === 'RATE_LIMIT') {
          showError('월 3회 무료 조회를 모두 사용했습니다. Basic 플랜으로 업그레이드해주세요');
        } else {
          showError(data.message || '진단에 실패했습니다. 다시 시도해주세요');
        }
        return false;
      }
      location.href = '/result/' + data.scan.scanId;
    } catch (err) {
      if (stopLoading) stopLoading();
      showError('네트워크 오류가 발생했습니다. 다시 시도해주세요');
      console.error(err);
    }
    return false;
  };

  // ====== 예시 도메인 클릭 → 폼 자동 채움 ======
  function setupExampleDomains() {
    document.querySelectorAll('.example-domain').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = btn.getAttribute('data-domain') || '';
        if (input) {
          input.value = d;
          input.focus();
          input.classList.add('animate-fade-in');
          setTimeout(() => input.classList.remove('animate-fade-in'), 400);
        }
      });
    });
  }

  // ====== 카운트업 애니메이션 ======
  function animateCounter(el, target, duration) {
    const start = performance.now();
    const isFloat = !Number.isInteger(target);
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = target * eased;
      el.textContent = isFloat ? cur.toFixed(1) : Math.round(cur).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
    }
    requestAnimationFrame(tick);
  }

  function setupCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;
    if (typeof IntersectionObserver === 'undefined') {
      counters.forEach((el) => {
        const t = parseFloat(el.getAttribute('data-target') || '0');
        animateCounter(el, t, 1400);
      });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.done) return;
        el.dataset.done = '1';
        const t = parseFloat(el.getAttribute('data-target') || '0');
        animateCounter(el, t, 1400);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => io.observe(el));
  }

  // ====== 스크롤 reveal ======
  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }

  // ====== 성장 그래프 막대 ======
  function setupBars() {
    document.querySelectorAll('.reveal-bar').forEach((el) => {
      el.style.transformOrigin = 'bottom';
      el.style.transform = 'scaleY(0)';
      el.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.reveal-bar').forEach((el) => { el.style.transform = 'scaleY(1)'; });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.transform = 'scaleY(1)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.reveal-bar').forEach((el) => io.observe(el));
  }

  // ====== 초기화 ======
  function init() {
    setupExampleDomains();
    setupCounters();
    setupReveal();
    setupBars();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
