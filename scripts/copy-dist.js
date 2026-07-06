#!/usr/bin/env node

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const defaultTargetDir = path.join(
  process.env.HOME || '',
  'Documents/newDev/ICN_Mobile_app/app/src/qrcodemapping/assets/dist'
)

function resolveTargetDir(value) {
  if (!value) return defaultTargetDir
  if (value === '~') return defaultTargetDir
  if (value.startsWith('~')) {
    return path.join(process.env.HOME || '', value.slice(1))
  }
  return path.resolve(value)
}

function looksLikeCsvArg(value) {
  return /^\d+\.csv$/i.test(value) || /^\d+$/i.test(value)
}

function runBuild(csvArg) {
  const buildScript = path.join(projectRoot, 'scripts', 'facility-csv.js')
  const args = ['build']
  if (csvArg) args.push(csvArg)

  console.log(`[copy-dist] 빌드 시작: ${args.join(' ')}`)
  const result = spawnSync(process.execPath, [buildScript].concat(args), {
    cwd: projectRoot,
    stdio: 'inherit'
  })

  if (result.error) {
    throw result.error
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error(`[copy-dist] 빌드 실패 (exit ${result.status})`)
  }
}

function copyDistContents(targetDir) {
  if (!fs.existsSync(distDir)) {
    throw new Error(`[copy-dist] dist 디렉터리가 없습니다: ${distDir}`)
  }

  fs.rmSync(targetDir, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(targetDir), { recursive: true })
  fs.mkdirSync(targetDir, { recursive: true })

  const entries = fs.readdirSync(distDir, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(distDir, entry.name)
    const destPath = path.join(targetDir, entry.name)
    fs.cpSync(srcPath, destPath, { recursive: true })
  }

  console.log(`[copy-dist] 복사 완료: ${targetDir}`)
}

function main() {
  try {
    const args = process.argv.slice(2)
    let csvArg = ''
    let targetDir = defaultTargetDir

    if (args.length === 0) {
      csvArg = ''
    } else if (args.length === 1) {
      if (looksLikeCsvArg(args[0])) {
        csvArg = args[0]
      } else {
        targetDir = resolveTargetDir(args[0])
      }
    } else {
      csvArg = args[0]
      targetDir = resolveTargetDir(args[1])
    }

    runBuild(csvArg)
    copyDistContents(targetDir)
  } catch (error) {
    console.error(`[copy-dist] 오류: ${error && error.message ? error.message : error}`)
    process.exit(1)
  }
}

main()
