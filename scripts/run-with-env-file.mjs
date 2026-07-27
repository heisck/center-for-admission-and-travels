import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { parseEnv } from 'node:util'

const [envFile, command, ...args] = process.argv.slice(2)

if (!envFile || !command) {
  console.error('Usage: node scripts/run-with-env-file.mjs <env-file> <command> [...args]')
  process.exit(2)
}

const env = {
  ...parseEnv(await readFile(envFile, 'utf8')),
  ...process.env,
}

const child = spawn(command, args, {
  env,
  stdio: 'inherit',
  shell: false,
  windowsHide: true,
})

child.on('error', () => {
  console.error('Failed to start the requested command')
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})
