/**
 * 시설 QR 매칭 — 사용할 CSV 및 컬럼 별칭 (한 곳만 수정)
 *
 * - CSV 교체: pnpm dev:csv 005 / pnpm build:csv 005 (public/NNN.csv 추가만 하면 됨)
 * - 005 등 현장관리번호 없는 CSV: 시설명칭(EQ_NM)으로 QR 매칭 (자동 감지)
 * - 또는: DEFAULT_FACILITY_CSV 변경, VUE_APP_FACILITY_CSV 환경변수
 * - 새 포맷: FACILITY_CSV_FIELD_ALIASES 에 헤더명만 배열로 추가
 */

/** public/ 아래 파일명 */
export var DEFAULT_FACILITY_CSV =
  typeof process !== 'undefined' && process.env && process.env.VUE_APP_FACILITY_CSV
    ? String(process.env.VUE_APP_FACILITY_CSV).trim()
    : '003.csv'

/**
 * 논리 필드 → CSV 헤더 후보 (앞쪽 우선, 002·003·추가 포맷 공통)
 */
export var FACILITY_CSV_FIELD_ALIASES = {
  siteMgmtNo: ['FIELD_MGT_NO_현장관리번호', '현장관리번호', 'FIELD_MGT_NO'],
  specName: ['EQ_NM_시설명칭', '시설명칭', 'EQ_NM', 'FWK_FCLT_NM_기능시설명', 'FWK_FCLT_NM'],
  facilityNo: ['SOU_ID_임시시설번호', 'SOU_ID', '시설번호'],
  eqNo: ['EQ_NO'],
  qrCode: ['qrcode', 'qrcode 등록일시', 'QR코드', 'qrCode', '시드QR', 'QR'],
  f1: ['FWK_F1', 'F1(대)'],
  f2: ['FWK_F2', 'F2(중)'],
  f3: ['FWK_F3', 'F3(소)'],
  f4: ['FWK_F4', 'F4(세)'],
  l2: ['L2_AREA_NAME', 'L2(단지)'],
  l3: ['L3_BUILDING', 'L3(건물)'],
  l4: ['L4_FLOOR', 'L4(층)'],
  l5: ['L5_SECTOR', 'L5(섹터)'],
  l6: ['L6_ROOM', 'L6(룸)'],
  l7: ['L7(상세)', 'L7_상세']
}
