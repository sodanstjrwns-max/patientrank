// 의료 특화 키워드 풀 (진료과 구분)
// 기능: 의료 키워드인지 판정 + 진료과 자동 분류

export const MEDICAL_STEMS = [
  '치과', '한의원', '피부과', '성형외과', '안과', '정형외과',
  '이비인후과', '산부인과', '내과', '소아과', '비뇨의학과', '비뇨기과',
  '신경외과', '흉부외과', '가정의학과', '재활의학과', '마취통증', '통증의학',
  '정신건강', '정신과', '영상의학', '진단검사', '병원', '의원', '클리닉',
  '교정', '임플란트', '라식', '라섹', '보톡스', '필러', '리프팅',
  '도수치료', '체외충격파', '한약', '침', '뜸', '물리치료',
]

export const SPECIALTY_MAP: Record<string, string[]> = {
  '치과': ['치과', '임플란트', '교정', '충치', '스케일링', '라미네이트', '보철', '신경치료', '사랑니', '잇몸', '미백', '틀니'],
  '한의원': ['한의원', '한약', '침', '뜸', '부항', '추나', '한방'],
  '피부과': ['피부과', '여드름', '레이저', '기미', '주름', '모발이식', '탈모', '보톡스', '필러'],
  '성형외과': ['성형외과', '쌍꺼풀', '코성형', '가슴성형', '지방흡입', '안면윤곽', '리프팅'],
  '안과': ['안과', '라식', '라섹', '스마일라식', '백내장', '녹내장', '노안', '드라이아이'],
  '정형외과': ['정형외과', '디스크', '관절', '인공관절', '척추', '도수치료', '체외충격파'],
  '이비인후과': ['이비인후과', '비염', '축농증', '중이염', '편도', '수면무호흡'],
  '산부인과': ['산부인과', '출산', '임신', '난임', '생리', '자궁', '난소'],
  '내과': ['내과', '당뇨', '고혈압', '갑상선', '위내시경', '대장내시경', '건강검진'],
  '통증의학과': ['통증의학', '통증클리닉', '신경차단', '도수', '주사'],
}

/**
 * 키워드가 의료 관련인지 판정 (느슨한 기준)
 */
export function isMedicalKeyword(keyword: string): boolean {
  if (!keyword) return false
  const k = keyword.toLowerCase().replace(/\s+/g, '')
  return MEDICAL_STEMS.some(stem => k.includes(stem))
}

/**
 * 키워드에서 추정 진료과
 */
export function guessSpecialty(keyword: string): string | null {
  const k = keyword.toLowerCase().replace(/\s+/g, '')
  for (const [spec, list] of Object.entries(SPECIALTY_MAP)) {
    if (list.some(w => k.includes(w))) return spec
  }
  return null
}

/**
 * 키워드 리스트에서 진료과별 집계 (상위 3개)
 */
export function topSpecialties(keywords: Array<{ keyword: string; search_volume?: number }>): Array<{ specialty: string; count: number; volume: number }> {
  const map = new Map<string, { count: number; volume: number }>()
  for (const k of keywords) {
    const spec = guessSpecialty(k.keyword)
    if (!spec) continue
    const cur = map.get(spec) || { count: 0, volume: 0 }
    cur.count += 1
    cur.volume += Number(k.search_volume || 0)
    map.set(spec, cur)
  }
  return [...map.entries()]
    .map(([specialty, v]) => ({ specialty, count: v.count, volume: v.volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 3)
}
