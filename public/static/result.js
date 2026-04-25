// Patient Rank - Result page interactions
(function () {
  'use strict';

  // ====== Donut Chart (Canvas 기반, 라이브러리 없이) ======
  function drawDonut() {
    const canvas = document.getElementById('rank-donut');
    const dataEl = document.getElementById('scan-data');
    if (!canvas || !dataEl) return;
    let data;
    try { data = JSON.parse(dataEl.textContent || '{}'); } catch { return; }

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 120;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const segments = [
      { v: Number(data.top3 || 0), color: '#00D084' },
      { v: Number(data.top10 || 0), color: '#0066FF' },
      { v: Number(data.top30 || 0), color: '#F59E0B' },
      { v: Number(data.top100 || 0), color: '#94A3B8' },
    ];
    const total = segments.reduce((s, x) => s + x.v, 0);
    const cx = size / 2, cy = size / 2, r = 48, rw = 18;

    ctx.clearRect(0, 0, size, size);

    if (total === 0) {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = rw;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('데이터 없음', cx, cy + 4);
      return;
    }

    let start = -Math.PI / 2;
    segments.forEach(s => {
      if (s.v <= 0) return;
      const ang = (s.v / total) * Math.PI * 2;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = rw;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + ang);
      ctx.stroke();
      start += ang;
    });

    // 중앙 텍스트
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 20px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(total), cx, cy + 2);
    ctx.fillStyle = '#64748B';
    ctx.font = '10px Pretendard, sans-serif';
    ctx.fillText('키워드', cx, cy + 16);
  }

  // ====== 키워드 검색 필터 ======
  function setupSearch() {
    const input = document.getElementById('kw-search');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const rows = document.querySelectorAll('#kw-tbody .kw-row');
      rows.forEach(row => {
        const kw = (row.children[1]?.textContent || '').toLowerCase();
        row.style.display = !q || kw.includes(q) ? '' : 'none';
      });
    });
  }

  // ====== 리드 폼 (이메일 게이팅) ======
  function setupLeadForm() {
    const form = document.getElementById('lead-form');
    if (!form) return;
    const status = document.getElementById('lead-status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        scan_id: Number(fd.get('scan_id')),
        email: String(fd.get('email') || '').trim(),
        clinic_name: String(fd.get('clinic_name') || '').trim() || null,
        specialty: String(fd.get('specialty') || '').trim() || null,
        doctor_name: String(fd.get('doctor_name') || '').trim() || null,
        kakao_opt_in: fd.get('kakao_opt_in') ? 1 : 0,
      };
      if (!payload.email) {
        if (status) { status.textContent = '이메일을 입력해주세요'; status.className = 'md:col-span-2 text-sm text-center text-warn'; }
        return;
      }
      if (status) { status.textContent = '발송 중...'; status.className = 'md:col-span-2 text-sm text-center text-slate-500'; }

      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          if (status) { status.innerHTML = '<i class="fas fa-check-circle mr-1"></i> 완료! 페이지를 새로고침하면 전체 키워드가 보입니다'; status.className = 'md:col-span-2 text-sm text-center text-accent-600'; }
          setTimeout(() => location.reload(), 1500);
        } else {
          if (status) { status.textContent = data.message || '오류가 발생했습니다'; status.className = 'md:col-span-2 text-sm text-center text-warn'; }
        }
      } catch (err) {
        if (status) { status.textContent = '네트워크 오류가 발생했습니다'; status.className = 'md:col-span-2 text-sm text-center text-warn'; }
        console.error(err);
      }
    });
  }

  // ====== TOP 100 / TOP 500 재스캔 토글 ======
  function setupRescan() {
    const btn = document.getElementById('rescan-wider');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const domain = btn.getAttribute('data-domain');
      const maxRank = Number(btn.getAttribute('data-max-rank') || 500);
      if (!domain) return;
      const orig = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>스캔 중...';
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: domain, max_rank: maxRank }),
        });
        const data = await res.json();
        if (res.ok && data.ok && data.scan?.scanId) {
          location.href = '/result/' + data.scan.scanId;
        } else {
          alert(data.message || '재스캔 실패');
          btn.disabled = false;
          btn.innerHTML = orig;
        }
      } catch (err) {
        console.error(err);
        alert('네트워크 오류');
        btn.disabled = false;
        btn.innerHTML = orig;
      }
    });
  }

  // ====== 롱테일 키워드 발견 (폴링 방식) ======
  function renderLongtailProgress(statusEl, job) {
    if (!statusEl || !job) return;
    const p = job.progress || {};
    const percent = Math.min(100, Math.max(0, p.percent || 0));
    const phaseIcon = {
      init: 'hourglass-start',
      sitemap: 'sitemap',
      matrix: 'table-cells',
      serp: 'satellite-dish',
      volumes: 'chart-line',
      saving: 'floppy-disk',
      done: 'check-circle',
    }[p.phase] || 'spinner';
    const phaseColor = job.status === 'failed' ? 'text-warn'
                     : job.status === 'done' ? 'text-accent'
                     : 'text-brand';
    statusEl.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="${phaseColor} font-semibold">
            <i class="fas fa-${phaseIcon} ${job.status === 'running' || job.status === 'pending' ? 'fa-spin' : ''} mr-1"></i>
            ${p.phase_label || '대기'}
          </span>
          <span class="tabular-nums text-slate-500">${percent}%</span>
        </div>
        <div class="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-brand to-accent transition-all duration-500" style="width:${percent}%"></div>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>
            <i class="fas fa-bullseye mr-1 text-accent"></i>
            발견: <b class="text-slate-900">${p.found_so_far || 0}</b>개
          </span>
          <span class="tabular-nums">${Math.min(p.current || 0, p.total || 0)} / ${p.total || 0}</span>
        </div>
      </div>
    `;
  }

  function setupLongtail() {
    const btn = document.getElementById('longtail-btn');
    if (!btn) return;
    const statusEl = document.getElementById('longtail-status');
    const scanId = btn.getAttribute('data-scan-id');
    if (!scanId) return;

    // 페이지 로드 시 기존 진행 중 job 있으면 즉시 복구
    (async () => {
      try {
        const res = await fetch('/api/scan/' + scanId + '/longtail/status');
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && data.job && (data.job.status === 'running' || data.job.status === 'pending')) {
          startPolling(data.job.jobId, true);
        }
      } catch {}
    })();

    btn.addEventListener('click', async () => {
      const orig = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>시작 중...';
      if (statusEl) statusEl.classList.remove('hidden');
      try {
        const res = await fetch('/api/scan/' + scanId + '/longtail/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'both', max: 200 }),
        });
        const data = await res.json();
        if (res.ok && data.ok && data.job) {
          renderLongtailProgress(statusEl, data.job);
          startPolling(data.job.jobId, false);
        } else {
          if (statusEl) {
            statusEl.innerHTML = '<i class="fas fa-exclamation-circle text-warn mr-1"></i> ' + (data.message || '스캔 실패');
          }
          btn.disabled = false;
          btn.innerHTML = orig;
        }
      } catch (err) {
        console.error(err);
        if (statusEl) {
          statusEl.innerHTML = '<i class="fas fa-exclamation-circle text-warn mr-1"></i> 네트워크 오류';
        }
        btn.disabled = false;
        btn.innerHTML = orig;
      }
    });

    // 폴링 (2초 간격, 최대 10분)
    function startPolling(jobId, restored) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>' + (restored ? '이미 실행 중...' : '스캔 중...');
      const startedAt = Date.now();
      const POLL_INTERVAL = 2000;
      const MAX_WAIT = 10 * 60 * 1000;
      const timer = setInterval(async () => {
        if (Date.now() - startedAt > MAX_WAIT) {
          clearInterval(timer);
          if (statusEl) {
            statusEl.innerHTML = '<i class="fas fa-exclamation-triangle text-warn mr-1"></i> 타임아웃 (10분 초과)';
          }
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-rotate mr-2"></i>다시 시도';
          return;
        }
        try {
          const res = await fetch('/api/scan/' + scanId + '/longtail/status?job_id=' + encodeURIComponent(jobId));
          if (!res.ok) return;
          const data = await res.json();
          if (!data.ok || !data.job) return;
          const job = data.job;
          renderLongtailProgress(statusEl, job);
          if (job.status === 'done') {
            clearInterval(timer);
            if (statusEl) {
              const found = job.result?.meta?.found_count || job.progress?.found_so_far || 0;
              const cost = (job.result?.meta?.total_cost || 0).toFixed(2);
              statusEl.innerHTML = '<i class="fas fa-check-circle text-accent mr-1"></i> <b>' + found + '개</b>의 롱테일 발견 (비용 $' + cost + ') · 새로고침 중...';
            }
            setTimeout(() => location.reload(), 1200);
          } else if (job.status === 'failed') {
            clearInterval(timer);
            if (statusEl) {
              statusEl.innerHTML = '<i class="fas fa-exclamation-circle text-warn mr-1"></i> ' + (job.error || '스캔 실패');
            }
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-rotate mr-2"></i>다시 시도';
          }
        } catch (e) {
          console.warn('poll error', e);
        }
      }, POLL_INTERVAL);
    }
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    drawDonut();
    setupSearch();
    setupLeadForm();
    setupRescan();
    setupLongtail();
  });
  if (document.readyState !== 'loading') {
    drawDonut();
    setupSearch();
    setupLeadForm();
    setupRescan();
    setupLongtail();
  }
})();
