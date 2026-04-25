// 한국 시/군/구 한글 ↔ 영문 슬러그 매핑
// 옵션 A (지역×진료과목 매트릭스) + 옵션 B (sitemap 슬러그 역변환)에서 공통 사용

/**
 * 영문 슬러그 → 한글 지역명 매핑
 * (sitemap URL에서 발견되는 패턴 위주)
 */
export const SLUG_TO_REGION_KO: Record<string, string> = {
  // 서울 주요구
  gangnam: '강남', seocho: '서초', songpa: '송파', gangdong: '강동',
  gangseo: '강서', yangcheon: '양천', guro: '구로', geumcheon: '금천',
  yeongdeungpo: '영등포', dongjak: '동작', gwanak: '관악', mapo: '마포',
  seodaemun: '서대문', eunpyeong: '은평', jongno: '종로', jung: '중구',
  yongsan: '용산', seongdong: '성동', gwangjin: '광진', dongdaemun: '동대문',
  jungnang: '중랑', seongbuk: '성북', gangbuk: '강북', dobong: '도봉',
  nowon: '노원',

  // 경기
  suwon: '수원', seongnam: '성남', yongin: '용인', goyang: '고양',
  bucheon: '부천', ansan: '안산', anyang: '안양', namyangju: '남양주',
  hwaseong: '화성', pyeongtaek: '평택', uijeongbu: '의정부', siheung: '시흥',
  paju: '파주', gimpo: '김포', gwangju_gg: '광주', gwangmyeong: '광명',
  gunpo: '군포', osan: '오산', icheon: '이천', yangju: '양주',
  guri: '구리', anseong: '안성', pocheon: '포천', uiwang: '의왕',
  hanam: '하남', dongducheon: '동두천', gwacheon: '과천', yeoju: '여주',

  // 인천
  incheon: '인천', michuhol: '미추홀', yeonsu: '연수', namdong: '남동',
  bupyeong: '부평', gyeyang: '계양', seo_ic: '서구',

  // 부산
  busan: '부산', haeundae: '해운대', suyeong: '수영', dongnae: '동래',
  geumjeong: '금정', saha: '사하', sasang: '사상', gijang: '기장',

  // 대구
  daegu: '대구', suseong: '수성', dalseo: '달서', dalseong: '달성',

  // 대전/세종
  daejeon: '대전', yuseong: '유성', daedeok: '대덕', seogu: '서구',
  sejong: '세종',

  // 광주
  gwangju: '광주',

  // 울산
  ulsan: '울산',

  // 강원
  chuncheon: '춘천', wonju: '원주', gangneung: '강릉', donghae: '동해',
  sokcho: '속초', samcheok: '삼척', taebaek: '태백', pyeongchang: '평창',

  // 충북
  cheongju: '청주', chungju: '충주', jecheon: '제천', jincheon: '진천',
  eumseong: '음성', okcheon: '옥천', yeongdong: '영동', goesan: '괴산',
  boeun: '보은', jeungpyeong: '증평', danyang: '단양',

  // 충남 (서울비디치과 핵심)
  cheonan: '천안', asan: '아산', buldang: '불당',
  yesan: '예산', hongseong: '홍성', dangjin: '당진', seosan: '서산',
  nonsan: '논산', gongju: '공주', gyeryong: '계룡', cheongyang: '청양',
  buyeo: '부여', seocheon: '서천', boryeong: '보령', taean: '태안',
  geumsan: '금산', yeongi: '연기',

  // 전북
  jeonju: '전주', gunsan: '군산', iksan: '익산', jeongeup: '정읍',
  namwon: '남원', gimje: '김제',

  // 전남
  mokpo: '목포', yeosu: '여수', suncheon: '순천', naju: '나주',
  gwangyang: '광양', damyang: '담양',

  // 경북
  pohang: '포항', gyeongju: '경주', gumi: '구미', yeongju: '영주',
  andong: '안동', sangju: '상주', mungyeong: '문경', gyeongsan: '경산',

  // 경남
  changwon: '창원', jinju: '진주', tongyeong: '통영', sacheon: '사천',
  gimhae: '김해', miryang: '밀양', geoje: '거제', yangsan: '양산',

  // 제주
  jeju: '제주', seogwipo: '서귀포',
}

/**
 * 영문 진료과목 슬러그 → 한글 매핑 (치과 중심)
 */
export const SLUG_TO_SPECIALTY_KO: Record<string, string[]> = {
  // 치과
  implant: ['임플란트'],
  invisalign: ['인비절라인', '투명교정'],
  laminate: ['라미네이트'],
  orthodontics: ['교정', '치아교정'],
  braces: ['교정', '치아교정'],
  whitening: ['미백', '치아미백'],
  scaling: ['스케일링'],
  extraction: ['발치'],
  wisdom: ['사랑니'],
  cavity: ['충치'],
  prosthodontics: ['보철'],
  endodontics: ['신경치료'],
  periodontics: ['잇몸치료'],
  denture: ['틀니'],
  pediatric: ['소아치과'],
  cosmetic: ['심미치과'],
  crown: ['크라운'],
  veneer: ['베니어'],
  pfm: ['pfm'],
  zirconia: ['지르코니아'],
  'gold-crown': ['골드크라운'],
  'all-on-4': ['올온4'],

  // 한의원/피부과 등 확장 (미래 대비)
  acne: ['여드름'],
  botox: ['보톡스'],
  filler: ['필러'],
  lasik: ['라식'],
  lasek: ['라섹'],
}

/**
 * "hongseong-laminate" 같은 슬러그를 한글 키워드 후보로 변환
 * 반환 예: ["홍성 라미네이트", "홍성라미네이트", "홍성 치과", "홍성치과"]
 */
export function slugToKeywordCandidates(slug: string, baseSpecialty: string = '치과'): string[] {
  const parts = slug.toLowerCase().split('-')
  const candidates = new Set<string>()

  // 지역 슬러그 + 진료 슬러그 조합
  let regionKo: string | null = null
  const specialtyKos: string[] = []

  for (const part of parts) {
    if (SLUG_TO_REGION_KO[part] && !regionKo) {
      regionKo = SLUG_TO_REGION_KO[part]
    } else if (SLUG_TO_SPECIALTY_KO[part]) {
      specialtyKos.push(...SLUG_TO_SPECIALTY_KO[part])
    }
  }

  if (!regionKo) return []

  // 지역 단독 → "홍성 치과", "홍성치과"
  if (specialtyKos.length === 0) {
    candidates.add(`${regionKo} ${baseSpecialty}`)
    candidates.add(`${regionKo}${baseSpecialty}`)
  } else {
    // 지역 × 진료 → "홍성 라미네이트", "홍성라미네이트"
    for (const spec of specialtyKos) {
      candidates.add(`${regionKo} ${spec}`)
      candidates.add(`${regionKo}${spec}`)
      // 역순도 ("라미네이트 홍성"은 검색량 적지만 있을 수 있음)
    }
  }

  return [...candidates]
}

/**
 * 지역 × 진료과목 매트릭스 생성 (옵션 A용)
 * 상위 우선순위 지역 30개 × 진료 10개 = 300 조합 (비용 ≈ $0.18 at $0.0006/query)
 */
export const PRIORITY_REGIONS_KO = [
  // 서울비디치과 핵심 타겟 + 전국 주요 도시
  '강남', '서초', '송파', '강동', '마포', '용산', '영등포', '성동',
  '수원', '성남', '용인', '고양', '안산', '화성', '평택', '안양',
  '인천', '부천', '부산', '대구', '대전', '광주', '울산', '세종',
  '천안', '아산', '청주', '전주', '창원', '춘천',
]

export const DENTAL_PROCEDURES_KO = [
  '치과', '임플란트', '치아교정', '라미네이트', '투명교정',
  '치아미백', '충치치료', '사랑니발치', '신경치료', '보철',
]

/**
 * 지역×진료 매트릭스 조합 생성
 * @param regions 지역 리스트 (기본: PRIORITY_REGIONS_KO)
 * @param procedures 진료과목 리스트 (기본: DENTAL_PROCEDURES_KO)
 * @param limit 최대 조합 수 (비용 제한용)
 */
export function buildRegionProcedureMatrix(
  regions: string[] = PRIORITY_REGIONS_KO,
  procedures: string[] = DENTAL_PROCEDURES_KO,
  limit: number = 300
): string[] {
  const combos: string[] = []
  for (const region of regions) {
    for (const proc of procedures) {
      combos.push(`${region} ${proc}`)
      if (combos.length >= limit) return combos
    }
  }
  return combos
}
