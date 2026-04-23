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

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    drawDonut();
    setupSearch();
    setupLeadForm();
  });
  if (document.readyState !== 'loading') {
    drawDonut();
    setupSearch();
    setupLeadForm();
  }
})();
