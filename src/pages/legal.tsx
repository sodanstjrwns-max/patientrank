// Patient Rank - Legal Pages (Privacy Policy & Terms of Service)
// Google OAuth Verification 통과를 위한 풀버전 법적 고지
import type { FC } from 'hono/jsx'
import { Layout, NavBar, Footer } from './layout'

// =============================================================================
// Privacy Policy (개인정보처리방침)
// =============================================================================
export const PrivacyPolicyPage: FC = () => (
  <Layout title="개인정보처리방침 · Patient Rank">
    <NavBar />
    <main class="max-w-4xl mx-auto px-5 py-16">
      {/* Hero */}
      <div class="mb-12 pb-8 border-b border-slate-200">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2.5 py-1 rounded-md bg-brand/10 text-brand text-xs font-bold tracking-wider">
            <i class="fas fa-shield-halved mr-1"></i>PRIVACY POLICY
          </span>
          <span class="text-xs text-slate-500">최종 업데이트: 2026-04-25</span>
        </div>
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">개인정보처리방침</h1>
        <p class="mt-3 text-slate-600 leading-relaxed">
          Patient Rank(이하 "회사")는 「개인정보 보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」을 준수하며,
          이용자의 개인정보를 안전하게 보호하기 위해 본 개인정보처리방침을 수립·공개합니다.
        </p>
      </div>

      {/* Quick Summary Card */}
      <section class="mb-10 p-6 rounded-2xl bg-gradient-to-br from-brand/5 to-brand/0 border border-brand/20">
        <h2 class="text-lg font-bold text-slate-900 mb-4">
          <i class="fas fa-circle-info text-brand mr-2"></i>요약 (TL;DR)
        </h2>
        <ul class="space-y-2.5 text-sm text-slate-700">
          <li class="flex items-start gap-2">
            <i class="fas fa-check text-brand mt-1"></i>
            <span><strong>이메일</strong>은 AES-256으로 암호화하여 저장합니다.</span>
          </li>
          <li class="flex items-start gap-2">
            <i class="fas fa-check text-brand mt-1"></i>
            <span><strong>IP 주소</strong>는 SHA-256 해시로만 저장하고 원본은 보관하지 않습니다.</span>
          </li>
          <li class="flex items-start gap-2">
            <i class="fas fa-check text-brand mt-1"></i>
            <span><strong>Google Search Console 데이터</strong>는 이용자 본인에게만 표시되며 제3자에게 절대 공유되지 않습니다.</span>
          </li>
          <li class="flex items-start gap-2">
            <i class="fas fa-check text-brand mt-1"></i>
            <span><strong>결제 정보</strong>는 토스페이먼츠 Customer Key만 저장하며 카드 정보는 직접 보관하지 않습니다.</span>
          </li>
          <li class="flex items-start gap-2">
            <i class="fas fa-check text-brand mt-1"></i>
            <span>이용자는 언제든 자신의 정보 열람·정정·삭제·연결 해제를 요청할 수 있습니다.</span>
          </li>
        </ul>
      </section>

      <div class="prose prose-slate max-w-none">

        {/* 1. 수집하는 개인정보 항목 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">1. 수집하는 개인정보 항목</h2>
        <p>회사는 다음의 정보를 수집합니다.</p>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">1.1 회원가입 및 서비스 이용 시 수집 항목</h3>
        <table class="w-full text-sm border-collapse my-4">
          <thead>
            <tr class="bg-slate-50">
              <th class="border border-slate-200 px-4 py-2 text-left font-semibold">구분</th>
              <th class="border border-slate-200 px-4 py-2 text-left font-semibold">수집 항목</th>
              <th class="border border-slate-200 px-4 py-2 text-left font-semibold">수집 방법</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-200 px-4 py-2">필수</td>
              <td class="border border-slate-200 px-4 py-2">이메일, 이름</td>
              <td class="border border-slate-200 px-4 py-2">Google OAuth 2.0</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">선택</td>
              <td class="border border-slate-200 px-4 py-2">병원명, 진료과, 원장명</td>
              <td class="border border-slate-200 px-4 py-2">이용자 직접 입력</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">자동 수집</td>
              <td class="border border-slate-200 px-4 py-2">접속 IP(해시), 브라우저 정보, 접속 로그</td>
              <td class="border border-slate-200 px-4 py-2">서비스 이용 과정에서 자동 생성</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">결제 시</td>
              <td class="border border-slate-200 px-4 py-2">토스페이먼츠 Customer Key, 결제 금액, 결제 일시</td>
              <td class="border border-slate-200 px-4 py-2">토스페이먼츠 결제 게이트웨이</td>
            </tr>
          </tbody>
        </table>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">1.2 Google Search Console 연동 시 수집 항목</h3>
        <p>이용자가 GSC 연동 기능을 사용할 경우 다음 데이터를 Google API를 통해 가져옵니다.</p>
        <ul>
          <li><strong>요청 권한 (Scope)</strong>: <code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">https://www.googleapis.com/auth/webmasters.readonly</code> (읽기 전용)</li>
          <li><strong>가져오는 데이터</strong>: 검색 키워드, 노출수(impressions), 클릭수(clicks), 평균 순위, CTR, 페이지 URL</li>
          <li><strong>가져오지 않는 데이터</strong>: 사이트맵, 색인 요청, 보안 이슈, 수정 권한 (모두 읽기 전용 권한이므로 수정 불가)</li>
          <li><strong>접근 범위</strong>: 이용자 본인이 GSC에 등록한 사이트 중 본인이 선택한 사이트에 한함</li>
        </ul>

        {/* 2. 개인정보 수집·이용 목적 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">2. 개인정보 수집 및 이용 목적</h2>
        <ul>
          <li><strong>회원 식별 및 인증</strong>: Google OAuth를 통한 로그인, 본인 확인</li>
          <li><strong>서비스 제공</strong>: SEO 진단 결과 저장, 대시보드 제공, GSC 데이터 표시</li>
          <li><strong>결제 처리</strong>: 유료 플랜 결제, 환불, 영수증 발급</li>
          <li><strong>서비스 개선</strong>: 이용 통계 분석(개인 식별 불가능한 형태로), 오류 수정</li>
          <li><strong>고객 지원</strong>: 문의 응대, 공지사항 안내</li>
          <li><strong>법적 의무 이행</strong>: 전자상거래법 등 관련 법령 준수</li>
        </ul>

        {/* 3. 개인정보 보유 및 이용 기간 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">3. 개인정보 보유 및 이용 기간</h2>
        <table class="w-full text-sm border-collapse my-4">
          <thead>
            <tr class="bg-slate-50">
              <th class="border border-slate-200 px-4 py-2 text-left font-semibold">항목</th>
              <th class="border border-slate-200 px-4 py-2 text-left font-semibold">보유 기간</th>
              <th class="border border-slate-200 px-4 py-2 text-left font-semibold">근거</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-200 px-4 py-2">회원 정보</td>
              <td class="border border-slate-200 px-4 py-2">회원 탈퇴 시까지</td>
              <td class="border border-slate-200 px-4 py-2">이용자 동의</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">GSC OAuth Refresh Token</td>
              <td class="border border-slate-200 px-4 py-2">연결 해제 또는 회원 탈퇴 시까지</td>
              <td class="border border-slate-200 px-4 py-2">서비스 제공</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">GSC 데이터 캐시</td>
              <td class="border border-slate-200 px-4 py-2">최대 24시간</td>
              <td class="border border-slate-200 px-4 py-2">성능 최적화 (자동 만료)</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">결제 기록</td>
              <td class="border border-slate-200 px-4 py-2">5년</td>
              <td class="border border-slate-200 px-4 py-2">전자상거래법 제6조</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">접속 로그(IP 해시)</td>
              <td class="border border-slate-200 px-4 py-2">3개월</td>
              <td class="border border-slate-200 px-4 py-2">통신비밀보호법 제15조</td>
            </tr>
          </tbody>
        </table>

        {/* 4. Google API Services User Data Policy 준수 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">4. Google API 사용자 데이터 정책 준수</h2>
        <p>
          Patient Rank의 Google API 사용은
          {' '}<a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener" class="text-brand underline">Google API Services User Data Policy</a>
          {' '}(Limited Use 요건 포함)을 준수하며, 다음 사항을 약속합니다.
        </p>
        <ul>
          <li><strong>사용 제한 (Limited Use)</strong>: GSC에서 가져온 데이터는 이용자에게 표시되는 사용자 대면 기능에만 사용합니다.</li>
          <li><strong>데이터 전송 금지</strong>: GSC 데이터를 제3자에게 전송하거나 판매하지 않습니다. 단, (a) 이용자의 명시적 동의가 있는 경우, (b) 보안 목적, (c) 법적 의무 이행을 위한 경우는 제외합니다.</li>
          <li><strong>광고 활용 금지</strong>: GSC 데이터를 광고(맞춤 광고 포함)에 사용하지 않습니다.</li>
          <li><strong>인적 열람 금지</strong>: GSC 데이터를 사람이 직접 열람하지 않습니다. 단, (a) 이용자의 명시적 동의가 있는 경우, (b) 보안 목적, (c) 법적 의무, (d) 데이터가 익명·집계 처리되어 내부 운영에 사용되는 경우는 제외합니다.</li>
        </ul>

        {/* 5. 개인정보 제3자 제공 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">5. 개인정보의 제3자 제공</h2>
        <p>회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우에는 예외로 합니다.</p>
        <ul>
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
        </ul>

        {/* 6. 개인정보 처리 위탁 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">6. 개인정보 처리 위탁</h2>
        <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.</p>
        <table class="w-full text-sm border-collapse my-4">
          <thead>
            <tr class="bg-slate-50">
              <th class="border border-slate-200 px-4 py-2 text-left font-semibold">수탁 업체</th>
              <th class="border border-slate-200 px-4 py-2 text-left font-semibold">위탁 업무</th>
              <th class="border border-slate-200 px-4 py-2 text-left font-semibold">처리 위치</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-200 px-4 py-2">Cloudflare, Inc.</td>
              <td class="border border-slate-200 px-4 py-2">서비스 호스팅, 데이터 저장(D1, KV)</td>
              <td class="border border-slate-200 px-4 py-2">글로벌 엣지 (한국 포함)</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">Google LLC</td>
              <td class="border border-slate-200 px-4 py-2">OAuth 인증, Search Console API</td>
              <td class="border border-slate-200 px-4 py-2">미국</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">DataForSEO</td>
              <td class="border border-slate-200 px-4 py-2">SEO 데이터 조회</td>
              <td class="border border-slate-200 px-4 py-2">미국</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">토스페이먼츠</td>
              <td class="border border-slate-200 px-4 py-2">결제 처리</td>
              <td class="border border-slate-200 px-4 py-2">대한민국</td>
            </tr>
            <tr>
              <td class="border border-slate-200 px-4 py-2">Resend</td>
              <td class="border border-slate-200 px-4 py-2">이메일 발송</td>
              <td class="border border-slate-200 px-4 py-2">미국</td>
            </tr>
          </tbody>
        </table>

        {/* 7. 개인정보 보호 기술적·관리적 조치 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">7. 개인정보 보호를 위한 기술적·관리적 조치</h2>
        <ul>
          <li><strong>암호화 저장</strong>: 이메일은 AES-256-GCM으로 암호화하여 저장합니다.</li>
          <li><strong>일방향 해시</strong>: IP 주소는 SHA-256 해시로만 저장하며 원본은 보관하지 않습니다.</li>
          <li><strong>전송 구간 암호화</strong>: 모든 통신은 HTTPS(TLS 1.3)로 암호화됩니다.</li>
          <li><strong>OAuth 토큰 관리</strong>: Google OAuth Refresh Token은 Cloudflare KV에 암호화 저장되며, 이용자가 연결 해제 시 즉시 폐기됩니다.</li>
          <li><strong>접근 권한 통제</strong>: 개인정보 처리 권한은 최소 인원에게만 부여하며 정기적으로 점검합니다.</li>
          <li><strong>로그 모니터링</strong>: 비정상 접근 시도를 자동 감지하고 차단합니다.</li>
        </ul>

        {/* 8. 이용자 권리 및 행사 방법 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">8. 이용자 및 법정대리인의 권리·의무 및 행사 방법</h2>
        <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
        <ul>
          <li><strong>열람 요청</strong>: 자신의 개인정보 처리 현황 확인</li>
          <li><strong>정정·삭제 요청</strong>: 잘못된 정보의 수정 또는 삭제</li>
          <li><strong>처리 정지 요청</strong>: 개인정보 처리 중단 요청</li>
          <li><strong>회원 탈퇴</strong>: 대시보드 → 설정 → 회원 탈퇴</li>
          <li><strong>GSC 연결 해제</strong>: 결과 페이지 → GSC 카드 → 연결 해제 또는
            {' '}<a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener" class="text-brand underline">Google 계정 권한 페이지</a>에서 직접 해제 가능</li>
        </ul>
        <p>위 권리 행사는 이메일(<a href="mailto:hello@patientrank.kr" class="text-brand underline">hello@patientrank.kr</a>)로 요청 가능하며, 회사는 지체 없이 조치합니다.</p>

        {/* 9. 개인정보 파기 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">9. 개인정보 파기 절차 및 방법</h2>
        <ul>
          <li><strong>파기 시점</strong>: 보유 기간 경과, 처리 목적 달성, 회원 탈퇴 시</li>
          <li><strong>전자적 파일</strong>: 복구 불가능한 방법으로 영구 삭제 (DB DELETE + 백업 회전 만료)</li>
          <li><strong>OAuth Token</strong>: Google API <code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">revoke</code> 엔드포인트 호출 후 KV 삭제</li>
          <li><strong>출력물</strong>: 분쇄 또는 소각 (해당 사항 거의 없음)</li>
        </ul>

        {/* 10. 쿠키 사용 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">10. 쿠키(Cookie) 사용</h2>
        <p>회사는 로그인 세션 유지를 위해 쿠키를 사용합니다.</p>
        <ul>
          <li><strong>쿠키 이름</strong>: <code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">pr_session</code> (HttpOnly, Secure, SameSite=Lax)</li>
          <li><strong>유효 기간</strong>: 30일</li>
          <li><strong>거부 방법</strong>: 브라우저 설정에서 쿠키 차단 가능 (단, 로그인 기능 사용 불가)</li>
        </ul>

        {/* 11. 개인정보 보호책임자 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">11. 개인정보 보호책임자</h2>
        <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 my-4">
          <ul class="list-none pl-0 space-y-1.5 text-sm">
            <li><strong>성명</strong>: 문석준 (대표)</li>
            <li><strong>소속</strong>: Patient Rank</li>
            <li><strong>이메일</strong>: <a href="mailto:hello@patientrank.kr" class="text-brand underline">hello@patientrank.kr</a></li>
          </ul>
        </div>

        {/* 12. 권익침해 구제방법 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">12. 권익침해 구제방법</h2>
        <p>개인정보 침해로 인한 피해 발생 시 아래 기관에 신고하실 수 있습니다.</p>
        <ul>
          <li>개인정보분쟁조정위원회: <a href="https://www.kopico.go.kr" target="_blank" rel="noopener" class="text-brand underline">www.kopico.go.kr</a> (1833-6972)</li>
          <li>개인정보침해신고센터: <a href="https://privacy.kisa.or.kr" target="_blank" rel="noopener" class="text-brand underline">privacy.kisa.or.kr</a> (118)</li>
          <li>대검찰청 사이버수사과: <a href="https://www.spo.go.kr" target="_blank" rel="noopener" class="text-brand underline">www.spo.go.kr</a> (1301)</li>
          <li>경찰청 사이버수사국: <a href="https://ecrm.cyber.go.kr" target="_blank" rel="noopener" class="text-brand underline">ecrm.cyber.go.kr</a> (182)</li>
        </ul>

        {/* 13. 개정 이력 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">13. 개정 이력</h2>
        <ul>
          <li>2026-04-25: 최초 제정 및 시행 (v1.0)</li>
        </ul>
      </div>

      {/* English Version Notice */}
      <section class="mt-16 p-6 rounded-2xl bg-slate-900 text-white">
        <h2 class="text-lg font-bold mb-3">
          <i class="fas fa-globe mr-2"></i>English Summary
        </h2>
        <p class="text-sm leading-relaxed text-slate-300">
          Patient Rank is a medical-only SEO diagnostic SaaS for clinics in Korea.
          We collect minimal user data (email, name via Google OAuth) for authentication,
          and optionally Google Search Console data (read-only, via{' '}
          <code class="text-xs bg-white/10 px-1.5 py-0.5 rounded">webmasters.readonly</code> scope)
          when the user explicitly connects their GSC account.
          GSC data is displayed only to the authenticated user, never shared with third parties,
          never used for advertising, and cached for at most 24 hours in Cloudflare KV.
          Our use of Google APIs strictly adheres to the{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener" class="text-brand-300 underline">
            Google API Services User Data Policy
          </a>, including the Limited Use requirements.
          Users can disconnect their GSC account or delete their entire account at any time.
        </p>
        <p class="mt-4 text-xs text-slate-400">
          Contact: <a href="mailto:hello@patientrank.kr" class="text-brand-300 underline">hello@patientrank.kr</a> · Last updated: 2026-04-25
        </p>
      </section>
    </main>
    <Footer />
  </Layout>
)

// =============================================================================
// Terms of Service (이용약관)
// =============================================================================
export const TermsPage: FC = () => (
  <Layout title="이용약관 · Patient Rank">
    <NavBar />
    <main class="max-w-4xl mx-auto px-5 py-16">
      {/* Hero */}
      <div class="mb-12 pb-8 border-b border-slate-200">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2.5 py-1 rounded-md bg-brand/10 text-brand text-xs font-bold tracking-wider">
            <i class="fas fa-file-contract mr-1"></i>TERMS OF SERVICE
          </span>
          <span class="text-xs text-slate-500">최종 업데이트: 2026-04-25 · 시행일: 2026-04-25</span>
        </div>
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">이용약관</h1>
        <p class="mt-3 text-slate-600 leading-relaxed">
          본 약관은 Patient Rank(이하 "회사")가 제공하는 의료기관 전용 SEO 진단 SaaS 서비스(이하 "서비스") 이용에 관한
          제반 사항을 규정함을 목적으로 합니다.
        </p>
      </div>

      <div class="prose prose-slate max-w-none">

        {/* 제1장 총칙 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">제1장 총칙</h2>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제1조 (목적)</h3>
        <p>본 약관은 회사가 제공하는 서비스의 이용 조건과 절차, 회사와 이용자 간의 권리·의무 및 책임 사항을 규정합니다.</p>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제2조 (용어의 정의)</h3>
        <ul>
          <li><strong>"서비스"</strong>: Patient Rank가 제공하는 SEO 진단 도구, GSC 연동 분석, 백링크 분석, 키워드 갭 분석 등 일체의 기능</li>
          <li><strong>"이용자"</strong>: 본 약관에 동의하고 서비스를 이용하는 회원 및 비회원</li>
          <li><strong>"회원"</strong>: Google OAuth로 로그인하여 회사의 서비스를 정기적으로 이용하는 자</li>
          <li><strong>"플랜"</strong>: 무료, 베이직, 프로, 에이전시 등 회사가 제공하는 서비스 구독 등급</li>
          <li><strong>"GSC 연동"</strong>: 이용자가 자신의 Google Search Console 계정을 회사 서비스에 연결하여 데이터를 분석에 활용하는 기능</li>
        </ul>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제3조 (약관의 효력 및 변경)</h3>
        <p>① 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.</p>
        <p>② 회사는 필요 시 약관을 변경할 수 있으며, 변경 시 변경 사유와 시행일을 명시하여 시행일 7일 전(이용자에게 불리한 변경의 경우 30일 전)부터 서비스 내 공지합니다.</p>
        <p>③ 변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 회원 탈퇴를 할 수 있습니다.</p>

        {/* 제2장 서비스 이용 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">제2장 서비스 이용</h2>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제4조 (회원가입)</h3>
        <p>① 이용자는 Google OAuth를 통해 회원가입할 수 있습니다.</p>
        <p>② 다음의 경우 회원가입을 거부하거나 사후 해지할 수 있습니다.</p>
        <ul>
          <li>타인의 정보를 도용한 경우</li>
          <li>허위 정보를 등록한 경우</li>
          <li>서비스 이용 목적이 사회 질서나 미풍양속에 반하는 경우</li>
          <li>이전에 회원 자격이 박탈된 자가 재가입을 시도한 경우</li>
        </ul>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제5조 (서비스 제공 범위)</h3>
        <p>회사는 다음의 서비스를 제공합니다.</p>
        <ul>
          <li>URL 기반 SEO 진단 (구글 한국 검색 노출 현황)</li>
          <li>키워드 순위 분석, 추정 트래픽, 롱테일 키워드 발굴</li>
          <li>백링크 분석, 도메인 권위(DR) 진단, 경쟁사 갭 분석</li>
          <li>Google Search Console 연동을 통한 실측 키워드 분석 (Pro 이상)</li>
          <li>유료 플랜 가입자를 위한 추가 기능</li>
        </ul>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제6조 (서비스 이용 시간)</h3>
        <p>① 서비스는 연중무휴 24시간 제공을 원칙으로 합니다.</p>
        <p>② 단, 시스템 점검, 외부 API(Google, DataForSEO 등) 장애, 천재지변 등 부득이한 사유로 일시 중단될 수 있으며, 이 경우 사전 또는 사후 공지합니다.</p>

        {/* 제3장 GSC 연동 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">제3장 Google Search Console 연동</h2>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제7조 (GSC 연동 동의)</h3>
        <p>① 이용자는 Pro 이상 플랜에서 GSC 연동 기능을 이용할 수 있습니다.</p>
        <p>② 연동 시 회사는 Google OAuth를 통해 <code class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">webmasters.readonly</code> 권한(읽기 전용)만 요청합니다.</p>
        <p>③ 회사는 GSC 데이터를 다음 용도로만 사용합니다.</p>
        <ul>
          <li>이용자 본인에게 분석 결과 표시</li>
          <li>DataForSEO에서 잡지 못한 키워드의 보완 발견</li>
          <li>이용자의 명시적 동의 하에 통계적 집계 처리</li>
        </ul>
        <p>④ 회사는 GSC 데이터를 광고에 사용하거나 제3자에게 제공·판매하지 않습니다.</p>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제8조 (GSC 연결 해제)</h3>
        <p>이용자는 다음 방법으로 언제든 GSC 연결을 해제할 수 있습니다.</p>
        <ul>
          <li>서비스 내 결과 페이지 → GSC 카드 → "연결 해제" 버튼</li>
          <li>Google 계정 권한 페이지 (<a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener" class="text-brand underline">myaccount.google.com/permissions</a>)에서 직접 권한 회수</li>
        </ul>

        {/* 제4장 결제 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">제4장 유료 서비스 및 결제</h2>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제9조 (요금제)</h3>
        <p>회사는 무료, 베이직, 프로, 에이전시 등 다양한 요금제를 제공하며, 각 요금제의 가격과 기능은 서비스 내 가격 페이지에 명시합니다.</p>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제10조 (결제 방법)</h3>
        <p>① 결제는 토스페이먼츠를 통해 신용카드, 계좌이체 등으로 처리됩니다.</p>
        <p>② 회사는 카드 정보를 직접 보관하지 않으며, 토스페이먼츠 Customer Key만 저장합니다.</p>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제11조 (환불 정책)</h3>
        <p>① 결제일로부터 7일 이내, 서비스를 단 한 번도 사용하지 않은 경우 전액 환불됩니다.</p>
        <p>② 서비스를 1회 이상 사용한 경우 잔여 기간에 대해 일할 계산하여 환불할 수 있습니다.</p>
        <p>③ 회사의 귀책 사유로 서비스를 이용할 수 없는 경우 전액 환불됩니다.</p>
        <p>④ 환불 요청은 <a href="mailto:hello@patientrank.kr" class="text-brand underline">hello@patientrank.kr</a>로 접수하며, 영업일 기준 5일 이내 처리됩니다.</p>

        {/* 제5장 권리·의무 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">제5장 회사와 이용자의 권리·의무</h2>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제12조 (회사의 의무)</h3>
        <ul>
          <li>관련 법령과 본 약관을 준수하고 이용자에게 안정적이고 지속적인 서비스를 제공합니다.</li>
          <li>이용자의 개인정보를 보호하기 위해 보안 시스템을 갖추고 개인정보처리방침을 준수합니다.</li>
          <li>이용자의 의견이나 불만이 정당하다고 인정될 경우 즉시 처리합니다.</li>
        </ul>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제13조 (이용자의 의무)</h3>
        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
        <ul>
          <li>타인의 계정을 도용하거나 허위 정보로 가입하는 행위</li>
          <li>회사가 제공하는 서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제·전송·출판·배포·방송하는 행위</li>
          <li>서비스에 위해를 가하거나 정상 운영을 방해하는 행위 (자동화 봇, 과도한 API 호출 등)</li>
          <li>리버스 엔지니어링, 디컴파일, 분해 등으로 서비스의 소스 코드를 추출하는 행위</li>
          <li>다른 이용자의 개인정보를 무단으로 수집·저장·공개하는 행위</li>
          <li>서비스를 통해 분석한 결과를 의료광고법 등 관련 법령에 위반되는 형태로 사용하는 행위</li>
        </ul>

        {/* 제6장 면책 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">제6장 면책 및 분쟁 해결</h2>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제14조 (면책 사항)</h3>
        <ul>
          <li>회사는 천재지변, 전쟁, 외부 API(Google, DataForSEO) 장애 등 불가항력으로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</li>
          <li>회사가 제공하는 SEO 진단 결과는 참고용이며, 실제 검색 순위와 차이가 있을 수 있습니다. 회사는 진단 결과를 토대로 한 마케팅 의사결정의 결과에 대해 보장하지 않습니다.</li>
          <li>이용자의 귀책 사유로 인한 서비스 이용 장애에 대해 회사는 책임을 지지 않습니다.</li>
        </ul>

        <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-3">제15조 (분쟁 해결)</h3>
        <p>① 회사와 이용자 간 분쟁은 상호 협의로 해결을 우선합니다.</p>
        <p>② 협의가 이루어지지 않을 경우 「민사소송법」상의 관할 법원(서울중앙지방법원)에 소를 제기할 수 있습니다.</p>
        <p>③ 본 약관은 대한민국 법률에 따라 해석되고 집행됩니다.</p>

        {/* 부칙 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">부칙</h2>
        <p>본 약관은 2026년 4월 25일부터 시행됩니다.</p>

        {/* 문의 */}
        <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">문의</h2>
        <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 my-4">
          <ul class="list-none pl-0 space-y-1.5 text-sm">
            <li><strong>서비스명</strong>: Patient Rank</li>
            <li><strong>운영자</strong>: 문석준</li>
            <li><strong>이메일</strong>: <a href="mailto:hello@patientrank.kr" class="text-brand underline">hello@patientrank.kr</a></li>
            <li><strong>홈페이지</strong>: <a href="https://patientrank.pages.dev" class="text-brand underline">patientrank.pages.dev</a></li>
          </ul>
        </div>
      </div>
    </main>
    <Footer />
  </Layout>
)
