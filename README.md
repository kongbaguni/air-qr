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

## 린트

```bash
pnpm lint
```
