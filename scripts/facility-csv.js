/**
 * 시설 CSV 선택 dev/build (Windows·Mac 공통)
 *
 *   pnpm dev:csv              → 기본 003.csv
 *   pnpm dev:csv 004          → 004.csv
 *   pnpm build:csv 004.csv
 *   pnpm facility-csv list    → public/ 번호 CSV 목록
 */
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const DEFAULT_CSV = '003.csv'
const publicDir = path.join(__dirname, '../public')

function listFacilityCsvs() {
  if (!fs.existsSync(publicDir)) return []
  return fs
    .readdirSync(publicDir)
    .filter(function (name) {
      return /^\d+\.csv$/i.test(name)
    })
    .sort()
}

function normalizeCsv(name) {
  if (name == null || String(name).trim() === '') {
    return process.env.VUE_APP_FACILITY_CSV || DEFAULT_CSV
  }
  var n = String(name).trim()
  return n.endsWith('.csv') ? n : n + '.csv'
}

function ensureCsvExists(csvName) {
  var csvPath = path.join(publicDir, csvName)
  if (!fs.existsSync(csvPath)) {
    console.error('CSV 없음: public/' + csvName)
    console.error('사용 가능: ' + (listFacilityCsvs().join(', ') || '(없음)'))
    process.exit(1)
  }
  return csvName
}

function runWithCsv(csvName, command, args) {
  var env = Object.assign({}, process.env, { VUE_APP_FACILITY_CSV: csvName })
  var result = spawnSync(command, args, {
    stdio: 'inherit',
    env: env,
    shell: true
  })
  if (typeof result.status !== 'number' || result.status !== 0) {
    process.exit(typeof result.status === 'number' ? result.status : 1)
  }
}

function printHelp() {
  var available = listFacilityCsvs()
  console.log([
    'Usage:',
    '  pnpm dev:csv [004]       개발 서버 (기본 ' + DEFAULT_CSV + ')',
    '  pnpm build:csv [004]     프로덕션 빌드',
    '  pnpm facility-csv list   번호 CSV 목록',
    '',
    'Available: ' + (available.join(', ') || '(없음)')
  ].join('\n'))
}

var mode = process.argv[2]
var csvArg = process.argv[3]

if (!mode || mode === 'help' || mode === '-h' || mode === '--help') {
  printHelp()
  process.exit(mode ? 0 : 1)
}

if (mode === 'list') {
  listFacilityCsvs().forEach(function (name) {
    console.log(name)
  })
  process.exit(0)
}

if (mode !== 'dev' && mode !== 'build') {
  console.error('알 수 없는 명령: ' + mode)
  printHelp()
  process.exit(1)
}

var csvName = ensureCsvExists(normalizeCsv(csvArg))
console.log('[facility-csv] ' + mode + ' → ' + csvName)

if (mode === 'dev') {
  runWithCsv(csvName, 'vue-cli-service', ['serve'])
} else {
  runWithCsv(csvName, 'vue-cli-service', ['build', '--no-module'])
  runWithCsv(csvName, 'node', [path.join(__dirname, 'fix-index.js')])
}
