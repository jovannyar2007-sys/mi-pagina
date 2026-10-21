const { spawn } = require('node:child_process');
const path = require('node:path');

const projectRoot = __dirname;
const services = [
  {
    name: 'Backend',
    cwd: path.join(projectRoot, 'api_portafolio'),
    command: process.execPath,
    args: ['server.js'],
  },
  {
    name: 'Frontend',
    cwd: path.join(projectRoot, 'portafolio_frontend'),
    command: process.execPath,
    args: [
      path.join('node_modules', 'vite', 'bin', 'vite.js'),
      '--host',
      '127.0.0.1',
      '--strictPort',
    ],
  },
];

const children = [];
let stopping = false;

function stop(exitCode) {
  if (stopping) return;

  stopping = true;
  process.exitCode = exitCode;

  for (const child of children) {
    if (child.exitCode === null && !child.killed) {
      child.kill();
    }
  }
}

for (const service of services) {
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: 'inherit',
    windowsHide: true,
  });

  children.push(child);

  child.on('error', (error) => {
    console.error(`No se pudo iniciar ${service.name}: ${error.message}`);
    stop(1);
  });

  child.on('exit', (code, signal) => {
    if (!stopping) {
      console.error(
        `${service.name} se detuvo${signal ? ` (${signal})` : ` con código ${code}`}.`
      );
      stop(code ?? 1);
    }
  });
}

console.log('Iniciando frontend y backend...');
console.log('Abre el portafolio en http://localhost:5173');
console.log('Pulsa Ctrl+C para detener ambos servidores.');

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
