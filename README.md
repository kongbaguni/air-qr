# air-qr

## 프로젝트 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

개발 서버는 기본적으로 http://localhost:3003 에서 실행됩니다.

## 빌드 및 배포

### 일반 프로덕션 빌드

```bash
pnpm build
```

### CSV를 지정한 프로덕션 빌드

```bash
pnpm build:csv 010
```

`public/` 폴더에 있는 CSV 파일을 기준으로 빌드합니다. 예를 들어 `public/010.csv`를 사용하려면 위 명령을 실행하면 됩니다.

빌드 인자 없이도 환경변수로 CSV를 지정할 수 있습니다.

```bash
VUE_APP_FACILITY_CSV=010.csv pnpm build
```

또한 `src/config/facilityCsv.config.js`의 `DEFAULT_FACILITY_CSV` 값은 기본값으로 쓰이지만, 빌드 인자나 환경변수로 덮어써서 배포할 수 있습니다. 값이 없으면 안전하게 `003.csv`를 사용합니다.

### 배포용 dist 복사

```bash
pnpm build:csv:deploy 010
```

이 명령은 다음 과정을 자동으로 수행합니다.

1. 선택한 CSV로 프로덕션 빌드 실행
2. 생성된 `dist/` 내용을 대상 폴더로 복사
3. 기존 대상 폴더가 있으면 삭제 후 새로 생성
4. 실패 시 에러 메시지를 출력하고 종료

기본 복사 대상은 다음 경로입니다.

```bash
~/Documents/newDev/ICN_Mobile_app/app/src/qrcodemapping/assets/dist
```

특정 경로를 지정하려면 다음처럼 실행합니다.

```bash
pnpm build:csv:deploy 010 /path/to/target/dist
```

## CSV 설정

CSV 파일은 `public/` 폴더에 넣고, 기본 사용 파일은 [src/config/facilityCsv.config.js](src/config/facilityCsv.config.js)에서 설정합니다.

예시:

```js
export var DEFAULT_FACILITY_CSV = '010.csv'
```

실제 빌드에서는 다음 우선순위로 CSV를 결정합니다.

1. `pnpm build:csv 010`처럼 전달한 빌드 인자
2. `VUE_APP_FACILITY_CSV=010.csv` 같은 환경변수
3. [src/config/facilityCsv.config.js](src/config/facilityCsv.config.js)의 기본값

즉, 다음 빌드도 아래처럼 실행하면 됩니다.

```bash
pnpm build:csv 010
# 또는
VUE_APP_FACILITY_CSV=010.csv pnpm build
```

## 네이티브 Room 검색 인터페이스

웹뷰에서 네이티브 Room 검색을 사용하려면 `src/utils/native.js`에 정의된 새 인터페이스를 구현합니다.

- `queryFacilityCatalog(payload, callback)`
  - payload: `{ query, filters, showMatchedFacilities, limit, offset }`
  - callback: JS 함수 이름 문자열
- `getFacilityCatalogFilters(payload, callback)`
  - payload: `{ query, filters }`
  - callback: JS 함수 이름 문자열
- `syncFacilityCatalog(payload, callback)`
  - payload: `{ records }` 또는 `{ sourceLabel, records }`
  - callback: JS 함수 이름 문자열

브라우저 환경에서는 기존 CSV 기반 검색 로직이 그대로 동작합니다.

## 린트

```bash
pnpm lint
```
