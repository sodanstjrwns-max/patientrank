// Patient Rank - Landing page interactions v4 (와꾸 PREMIUM)
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
    // 살짝 흔들림 효과
    if (input) {
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
    }
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
          input.classList.add('flash-success');
          setTimeout(() => input.classList.remove('flash-success'), 600);
        }
      });
    });
  }

  // ====== 입력창 라이브 검증 (✓ 표시) ======
  function setupLiveValidation() {
    if (!input) return;
    const checkIcon = document.getElementById('input-check-icon');
    if (!checkIcon) return;
    input.addEventListener('input', () => {
      const v = normalizeUrl(input.value);
      if (v && v.length > 3) {
        checkIcon.classList.remove('opacity-0', 'scale-50');
        checkIcon.classList.add('opacity-100', 'scale-100');
      } else {
        checkIcon.classList.add('opacity-0', 'scale-50');
        checkIcon.classList.remove('opacity-100', 'scale-100');
      }
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
        animateCounter(el, t, 1600);
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
      el.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
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

  // ====== 3D Tilt 마우스 패럴랙스 (히어로 mockup) ======
  function setupTilt() {
    const tilt = document.getElementById('hero-mockup-tilt');
    if (!tilt) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 1024) return; // 모바일에서는 비활성

    const MAX_TILT = 8;
    let raf = null;
    let pendingX = 0, pendingY = 0;

    function apply() {
      tilt.style.transform = `perspective(1200px) rotateX(${pendingY}deg) rotateY(${pendingX}deg)`;
      raf = null;
    }

    tilt.addEventListener('mousemove', (e) => {
      const rect = tilt.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      pendingX = Math.max(-1, Math.min(1, dx)) * MAX_TILT;
      pendingY = -Math.max(-1, Math.min(1, dy)) * MAX_TILT;
      if (!raf) raf = requestAnimationFrame(apply);
    });

    tilt.addEventListener('mouseleave', () => {
      pendingX = 0; pendingY = 0;
      tilt.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // ====== Aurora 블롭 마우스 따라 움직임 ======
  function setupAuroraParallax() {
    const a1 = document.getElementById('aurora-1');
    const a2 = document.getElementById('aurora-2');
    if (!a1 || !a2) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 1024) return;

    let raf = null;
    let mx = 0, my = 0;

    function apply() {
      a1.style.transform = `translate(${mx * 30}px, ${my * 20}px)`;
      a2.style.transform = `translate(${-mx * 25}px, ${-my * 15}px)`;
      raf = null;
    }

    document.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth) - 0.5;
      my = (e.clientY / window.innerHeight) - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  }

  // ====== 자석 버튼 (CTA 버튼 마우스 따라 미세하게 끌림) ======
  function setupMagneticButtons() {
    const btns = document.querySelectorAll('.magnetic');
    if (!btns.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 1024) return;

    btns.forEach((btn) => {
      const STRENGTH = 0.25;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * STRENGTH;
        const dy = (e.clientY - cy) * STRENGTH;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ====== 스크롤 진행바 (상단 그라디언트) ======
  function setupScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    let raf = null;
    function update() {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, scrolled))})`;
      raf = null;
    }
    document.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  // ====== 키워드 타이핑 애니메이션 (히어로 mockup 검색바) ======
  function setupKeywordTyping() {
    const target = document.getElementById('typing-keyword');
    if (!target) return;
    const keywords = [
      '홍성 라미네이트',
      '당진 인비절라인',
      '연기 치과',
      '아산 라미네이트',
      '예산 임플란트',
    ];
    let kwIdx = 0;
    let charIdx = 0;
    let deleting = false;

    function tick() {
      const cur = keywords[kwIdx];
      if (!deleting) {
        charIdx++;
        target.textContent = cur.slice(0, charIdx);
        if (charIdx >= cur.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
        setTimeout(tick, 90 + Math.random() * 60);
      } else {
        charIdx--;
        target.textContent = cur.slice(0, charIdx);
        if (charIdx <= 0) {
          deleting = false;
          kwIdx = (kwIdx + 1) % keywords.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, 40);
      }
    }
    setTimeout(tick, 1500);
  }

  // ====== 스포트라이트 카드 (마우스 따라 빛 따라옴) ======
  function setupSpotlight() {
    const cards = document.querySelectorAll('.spotlight');
    if (!cards.length) return;
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  }

  // ====== 라이브 검색 카운터 (실시간감) ======
  function setupLiveSearchCounter() {
    const countEl = document.getElementById('live-search-count');
    const kwEl = document.getElementById('live-search-kw');
    if (!countEl || !kwEl) return;

    const KEYWORDS = [
      { kw: '강남 임플란트', base: 2847 },
      { kw: '홍성 라미네이트', base: 312 },
      { kw: '당진 인비절라인', base: 487 },
      { kw: '부산 한의원', base: 1923 },
      { kw: '서울 피부과', base: 4156 },
      { kw: '아산 라미네이트', base: 234 },
      { kw: '연기 치과', base: 178 },
      { kw: '인천 안과', base: 1842 },
      { kw: '대전 정형외과', base: 1067 },
      { kw: '예산 임플란트', base: 156 },
    ];
    let idx = 0;
    let currentBase = KEYWORDS[0].base;

    function tickCount() {
      const delta = Math.floor(Math.random() * 10) - 4;
      const next = Math.max(50, currentBase + delta);
      currentBase = next;
      countEl.textContent = next.toLocaleString();
    }

    function rotateKeyword() {
      idx = (idx + 1) % KEYWORDS.length;
      kwEl.style.transition = 'all 0.3s ease';
      kwEl.style.opacity = '0';
      kwEl.style.transform = 'translateY(-4px)';
      setTimeout(() => {
        kwEl.textContent = KEYWORDS[idx].kw;
        currentBase = KEYWORDS[idx].base;
        countEl.textContent = currentBase.toLocaleString();
        kwEl.style.opacity = '1';
        kwEl.style.transform = 'translateY(0)';
      }, 250);
    }

    setInterval(tickCount, 800);
    setInterval(rotateKeyword, 3500);
  }

  // ====== 초기화 ======
  function init() {
    setupExampleDomains();
    setupLiveValidation();
    setupCounters();
    setupReveal();
    setupBars();
    setupTilt();
    setupAuroraParallax();
    setupMagneticButtons();
    setupScrollProgress();
    setupKeywordTyping();
    setupSpotlight();
    setupLiveSearchCounter();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
