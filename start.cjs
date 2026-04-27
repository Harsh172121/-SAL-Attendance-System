const { spawn, execSync } = require('child_process');
const path = require('path');
const os = require('os');

const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

const isWin = os.platform() === 'win32';
const frontend = spawn(isWin ? 'npx.cmd' : 'npx', ['vite'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: isWin
});

let cleanedUp = false;
const cleanup = () => {
  if (cleanedUp) return;
  cleanedUp = true;
  
  if (isWin) {
    try { execSync(`taskkill /pid ${backend.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
    try { execSync(`taskkill /pid ${frontend.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
  } else {
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
