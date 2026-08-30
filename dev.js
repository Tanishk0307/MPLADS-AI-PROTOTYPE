import { spawn } from 'node:child_process';
import process from 'node:process';

const sysPath = 'C:\\Windows\\System32;C:\\Windows;' + (process.env.PATH || '');
const env = {
  ...process.env,
  PATH: sysPath,
  ComSpec: process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe',
  SystemRoot: process.env.SystemRoot || 'C:\\Windows',
};

console.log('============================================================');
console.log('  MPLADS AI Surveillance & Citizen Proof Portal');
echo_banner: {
  console.log('  - FastAPI Backend : http://127.0.0.1:8000');
  console.log('  - Vite Frontend   : http://127.0.0.1:5173');
}
console.log('============================================================');

// Start FastAPI Backend
const backend = spawn('python', ['-m', 'uvicorn', 'backend.main:app', '--reload', '--port', '8000'], {
  stdio: 'inherit',
  env,
  shell: false,
});

// Start Vite Frontend
const frontend = spawn('node', ['./node_modules/vite/bin/vite.js'], {
  stdio: 'inherit',
  env,
  shell: false,
});

let isShuttingDown = false;
const cleanup = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n[DevRunner] Shutting down servers...');
  try {
    backend.kill();
  } catch {}
  try {
    frontend.kill();
  } catch {}
};

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});
process.on('exit', cleanup);

backend.on('error', (err) => console.error('[Backend Error]:', err));
frontend.on('error', (err) => console.error('[Frontend Error]:', err));
