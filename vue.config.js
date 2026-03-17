const { defineConfig } = require('@vue/cli-service')

/**
 * file:// 프로토콜용 빌드 설정
 * - publicPath: './' → 상대 경로로 assets 로드 (로컬 파일 열기 시 필수)
 */
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  devServer: {
    port: 3002
  }
})
