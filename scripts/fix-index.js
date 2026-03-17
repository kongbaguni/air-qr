const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');

  // type="module" 제거하고 nomodule도 제거 (legacy만 남김)
  content = content.replace(/<script[^>]*type="module"[^>]*><\/script>/g, '');
  content = content.replace(/\s+nomodule/g, '');

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('✅ index.html 수정 완료 (ES modules 제거)');
} else {
  console.error('❌ dist/index.html 파일을 찾을 수 없습니다.');
  process.exit(1);
}
