import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
let failures = 0

function report(ok, message) {
  console.log(`${ok ? 'OK' : 'MISSING'}  ${message}`)
  if (!ok) failures += 1
}

for (const path of ['AGENTS.md', 'CLAUDE.md', 'docs/AI_HANDOFF.md', 'docs/AI_WORKFLOW.md']) {
  try {
    const text = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
    report(text.trim().length > 0, path)
    if (path === 'CLAUDE.md') {
      report(/^@AGENTS\.md\s*$/m.test(text), 'Claude Code imports the shared AGENTS.md instructions')
    }
  } catch {
    report(false, `${path} could not be read`)
  }
}

for (const [command, label, setup] of [
  ['codex', 'Codex', 'https://developers.openai.com/codex/cli/'],
  ['claude', 'Claude Code', 'https://code.claude.com/docs/en/setup'],
]) {
  const result = spawnSync(command, ['--version'], {
    cwd: root,
    encoding: 'utf8',
    timeout: 10000,
    maxBuffer: 64 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const ready = !result.error && result.status === 0
  report(ready, ready ? `${label}: ${result.stdout.trim()}` : `${label} could not run from this terminal. Setup: ${setup}`)
}

console.log('\nThis checks local setup only. Sign in through each tool when you launch it.')
process.exitCode = failures ? 1 : 0
