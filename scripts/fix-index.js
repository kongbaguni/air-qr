const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '../dist')
const indexPath = path.join(distDir, 'index.html')
function normalizeFacilityCsvName(value) {
  if (typeof value !== 'string') return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  return trimmed.endsWith('.csv') ? trimmed : trimmed + '.csv'
}

/** src/config/facilityCsv.config.js 와 동일 — 빌드 시 환경변수/인자로 덮어쓸 수 있음 */
const csvName = normalizeFacilityCsvName(
  process.env.VUE_APP_FACILITY_CSV || process.env.FACILITY_CSV_NAME || '003.csv'
)
const csvPath = path.join(distDir, csvName)
const bundlePath = path.join(distDir, 'js/facility-csv-data.js')
const bundleScriptTag = '<script src="js/facility-csv-data.js"></script>'

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html 파일을 찾을 수 없습니다.')
  process.exit(1)
}

let content = fs.readFileSync(indexPath, 'utf8')

content = content.replace(/<script[^>]*type="module"[^>]*><\/script>/g, '')
content = content.replace(/\s+nomodule/g, '')

if (fs.existsSync(csvPath)) {
  const csvText = fs.readFileSync(csvPath, 'utf8')
  fs.mkdirSync(path.dirname(bundlePath), { recursive: true })
  fs.writeFileSync(
    bundlePath,
    'window.__FACILITY_CSV_BUNDLE__=' + JSON.stringify(csvText) + ';\n',
    'utf8'
  )

  if (content.indexOf(bundleScriptTag) === -1) {
    content = content.replace('</body>', '  ' + bundleScriptTag + '\n</body>')
  }

  console.log('facility-csv-data.js 생성 완료')
} else {
  console.warn('dist/' + csvName + ' 없음. file:// CSV 번들을 건너뜁니다.')
}

fs.writeFileSync(indexPath, content, 'utf8')
console.log('index.html 수정 완료')
