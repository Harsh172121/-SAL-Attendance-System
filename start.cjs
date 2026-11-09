const { spawn, execSync } = require('child_process');
const net = require('net');
const path = require('path');
const os = require('os');

const findAvailablePort = (preferredPort) => new Promise((resolve, reject) => {
  const probe = net.createServer();

  probe.once('error', (error) => {
    if (error.code !== 'EADDRINUSE') {
      reject(error);
      return;
    }

    const fallback = net.createServer();
    fallback.once('error', reject);
    fallback.listen(0, '127.0.0.1', () => {
      const port = fallback.address().port;
      fallback.close((closeError) => closeError ? reject(closeError) : resolve(port));
    });
  });

  probe.listen(preferredPort, '127.0.0.1', () => {
    probe.close((error) => error ? reject(error) : resolve(preferredPort));
  });
});

const isWin = os.platform() === 'win32';
let backend;
let frontend;

let cleanedUp = false;
const cleanup = () => {
  if (cleanedUp) return;
  cleanedUp = true;
  
  if (isWin) {
    if (backend?.pid) {
      try { execSync(`taskkill /pid ${backend.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
    }
    if (frontend?.pid) {
      try { execSync(`taskkill /pid ${frontend.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
    }
  } else {
    backend?.kill('SIGINT');
    frontend?.kill('SIGINT');
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

async function start() {
  const apiPort = await findAvailablePort(5000);
  const childEnv = { ...process.env, API_HOST: '127.0.0.1', API_PORT: String(apiPort) };

  if (apiPort !== 5000) {
    console.log(`Port 5000 is in use; using API port ${apiPort} for this dev session.`);
  }

  backend = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    env: childEnv
  });

  frontend = spawn(isWin ? 'npx.cmd' : 'npx', ['vite'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: isWin,
    env: childEnv
  });
}

start().catch((error) => {
  console.error('Unable to start the development servers:', error);
  process.exitCode = 1;
});
