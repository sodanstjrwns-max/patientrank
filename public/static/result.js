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
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = rw;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
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

    // 중앙 텍스트 (다크 톤)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(total), cx, cy + 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px Pretendard, sans-serif';
    ctx.fillText('키워드', cx, cy + 18);
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
    const authed = btn.getAttribute('data-authed') === '1';

    // 페이지 로드 시 기존 진행 중 job 있으면 즉시 복구 (비로그인은 401만 나므로 스킵)
    if (authed) (async () => {
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

  // ====== GSC (Google Search Console) 연동 ======
  function fmtNumber(n) {
    if (n == null || isNaN(n)) return '—';
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '만';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(Math.round(n));
  }

  function setupGsc() {
    const card = document.getElementById('gsc-card');
    if (!card) return;
    const scanId = card.getAttribute('data-scan-id');
    if (!scanId) return;
    const gscAuthed = card.getAttribute('data-authed') === '1';

    const connectBtn = document.getElementById('gsc-connect-btn');
    const syncBtn = document.getElementById('gsc-sync-btn');
    const disconnectBtn = document.getElementById('gsc-disconnect-btn');
    const upgradeBtn = document.getElementById('gsc-upgrade-btn');
    const sitesPanel = document.getElementById('gsc-sites-panel');
    const siteSelect = document.getElementById('gsc-site-select');
    const runSyncBtn = document.getElementById('gsc-run-sync-btn');
    const syncStatus = document.getElementById('gsc-sync-status');
    const resultPanel = document.getElementById('gsc-result-panel');

    function show(el) { if (el) el.classList.remove('hidden'); }
    function hide(el) { if (el) el.classList.add('hidden'); }

    async function checkStatus() {
      // 비로그인은 API 호출 없이 즉시 연결 버튼만 노출 (콘솔 401 노이즈 제거)
      if (!gscAuthed) {
        show(connectBtn);
        return;
      }
      try {
        const res = await fetch('/api/gsc/status');
        if (res.status === 401) {
          // 세션 만료 등 → 연결 버튼만 보여주고 클릭 시 로그인 유도
          show(connectBtn);
          return;
        }
        if (res.status === 403) {
          // Pro 플랜 필요
          show(upgradeBtn);
          return;
        }
        const data = await res.json();
        if (data.ok && data.connected) {
          // 연결됨: 동기화 버튼 + 해제 버튼
          show(syncBtn);
          show(disconnectBtn);
          if (data.last_site_url) {
            syncBtn.setAttribute('data-last-site', data.last_site_url);
          }
        } else {
          // 권한 OK · 미연결
          show(connectBtn);
        }
      } catch (e) {
        console.warn('gsc status error', e);
        show(connectBtn);
      }
    }

    if (connectBtn) {
      connectBtn.addEventListener('click', () => {
        location.href = '/auth/gsc/connect?next=' + encodeURIComponent(location.pathname + '?gsc=ready');
      });
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', async () => {
        if (!confirm('GSC 연결을 해제할까요? 다음에 다시 연결할 수 있습니다.')) return;
        try {
          await fetch('/api/gsc/disconnect', { method: 'POST' });
          hide(syncBtn); hide(disconnectBtn); hide(sitesPanel); hide(resultPanel);
          show(connectBtn);
        } catch (e) { console.warn(e); }
      });
    }

    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        show(sitesPanel);
        siteSelect.innerHTML = '<option value="">불러오는 중...</option>';
        try {
          const res = await fetch('/api/gsc/sites');
          const data = await res.json();
          if (!res.ok || !data.ok) {
            siteSelect.innerHTML = '<option value="">사이트 목록을 가져올 수 없습니다</option>';
            return;
          }
          const sites = data.sites || [];
          if (sites.length === 0) {
            siteSelect.innerHTML = '<option value="">등록된 사이트가 없습니다</option>';
            return;
          }
          const lastSite = syncBtn.getAttribute('data-last-site') || '';
          siteSelect.innerHTML = sites.map(function (s) {
            const sel = s.siteUrl === lastSite ? ' selected' : '';
            return '<option value="' + s.siteUrl + '"' + sel + '>' + s.siteUrl + ' (' + s.permissionLevel + ')</option>';
          }).join('');
        } catch (e) {
          siteSelect.innerHTML = '<option value="">네트워크 오류</option>';
        }
      });
    }

    if (runSyncBtn) {
      runSyncBtn.addEventListener('click', async () => {
        const siteUrl = siteSelect.value;
        if (!siteUrl) {
          alert('사이트를 먼저 선택해주세요');
          return;
        }
        const orig = runSyncBtn.innerHTML;
        runSyncBtn.disabled = true;
        runSyncBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>가져오는 중...';
        show(syncStatus);
        if (syncStatus) syncStatus.innerHTML = '<i class="fas fa-cloud-download-alt mr-2"></i>최근 28일 GSC 데이터 동기화 중... (보통 5~15초)';

        try {
          const res = await fetch('/api/scan/' + scanId + '/gsc-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site_url: siteUrl }),
          });
          const data = await res.json();
          if (!res.ok || !data.ok) {
            if (syncStatus) syncStatus.innerHTML = '<i class="fas fa-exclamation-circle text-amber-300 mr-2"></i>' + (data.message || '동기화 실패');
            runSyncBtn.disabled = false;
            runSyncBtn.innerHTML = orig;
            return;
          }
          renderGscResult(data.result);
          if (syncStatus) syncStatus.innerHTML = '<i class="fas fa-check-circle text-emerald-300 mr-2"></i>동기화 완료 · ' + (data.result.total_rows || 0) + '개 키워드 수신';
          runSyncBtn.disabled = false;
          runSyncBtn.innerHTML = '<i class="fas fa-sync mr-2"></i>다시 동기화';
        } catch (e) {
          console.error(e);
          if (syncStatus) syncStatus.innerHTML = '<i class="fas fa-exclamation-circle text-amber-300 mr-2"></i>네트워크 오류';
          runSyncBtn.disabled = false;
          runSyncBtn.innerHTML = orig;
        }
      });
    }

    function renderGscResult(result) {
      if (!result) return;
      show(resultPanel);
      const totalRowsEl = document.getElementById('gsc-total-rows');
      const newFoundEl = document.getElementById('gsc-new-found');
      const missedImpEl = document.getElementById('gsc-missed-impressions');
      const dateRangeEl = document.getElementById('gsc-date-range');
      const tbody = document.getElementById('gsc-missed-tbody');
      if (totalRowsEl) totalRowsEl.textContent = fmtNumber(result.total_rows);
      if (newFoundEl) newFoundEl.textContent = fmtNumber(result.new_keywords_found);
      if (missedImpEl) missedImpEl.textContent = fmtNumber(result.missed_impressions);
      if (dateRangeEl && result.date_range) {
        dateRangeEl.textContent = result.date_range.start + ' ~ ' + result.date_range.end;
      }
      if (tbody) {
        const rows = result.top_missed || [];
        if (rows.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="px-5 py-8 text-center text-slate-400 text-sm">놓친 키워드가 없습니다 — 모든 노출 키워드를 잡고 있습니다 🎉</td></tr>';
        } else {
          tbody.innerHTML = rows.slice(0, 50).map(function (r, i) {
            const ctrPct = r.ctr ? (r.ctr * 100).toFixed(1) + '%' : '0%';
            const pos = r.avg_position ? r.avg_position.toFixed(1) : '—';
            const posBadge = r.avg_position && r.avg_position <= 10
              ? 'bg-amber-100 text-amber-800'
              : r.avg_position && r.avg_position <= 30
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-700';
            return '<tr class="hover:bg-slate-50">'
              + '<td class="px-5 py-3 text-slate-400 tabular-nums">' + (i + 1) + '</td>'
              + '<td class="px-5 py-3 font-medium text-slate-900">' + escapeHtml(r.keyword) + '</td>'
              + '<td class="px-5 py-3 text-right tabular-nums hidden md:table-cell">' + fmtNumber(r.impressions) + '</td>'
              + '<td class="px-5 py-3 text-right tabular-nums hidden md:table-cell">' + fmtNumber(r.clicks) + '</td>'
              + '<td class="px-5 py-3 text-right tabular-nums hidden md:table-cell text-slate-500">' + ctrPct + '</td>'
              + '<td class="px-5 py-3 text-right"><span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ' + posBadge + '">' + pos + '위</span></td>'
              + '</tr>';
          }).join('');
        }
      }
    }

    function escapeHtml(s) {
      return String(s || '').replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    // 콜백 후 ?gsc_connected=1 으로 돌아온 경우, 자동으로 사이트 목록 열기
    const params = new URLSearchParams(location.search);
    if (params.get('gsc_connected') === '1' && syncBtn) {
      setTimeout(() => syncBtn.click(), 300);
    }

    checkStatus();
  }

  // reveal 안전망: .reveal 요소 강제로 .in 토글 (스크롤 진입 시) + 초기 viewport 안 요소 즉시 표시
  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.2) el.classList.add('in');
      else io.observe(el);
    });
  }

  // Init
  function initAll() {
    drawDonut();
    setupSearch();
    setupLeadForm();
    setupRescan();
    setupLongtail();
    setupGsc();
    setupReveal();
  }
  document.addEventListener('DOMContentLoaded', initAll);
  if (document.readyState !== 'loading') initAll();
})();
