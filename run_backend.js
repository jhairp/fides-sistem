const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;

// Detectar interprete de Python en virtualenv
const venvPythonWin = path.join(rootDir, 'venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(rootDir, 'venv', 'bin', 'python');

let pythonCmd = 'python';
if (fs.existsSync(venvPythonWin)) {
  pythonCmd = venvPythonWin;
} else if (fs.existsSync(venvPythonUnix)) {
  pythonCmd = venvPythonUnix;
}

const managePy = path.join(rootDir, 'backend', 'manage.py');

console.log(`[Backend] Iniciando Django con intérprete: ${pythonCmd}`);

const proc = spawn(pythonCmd, [managePy, 'runserver', '0.0.0.0:8000'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(rootDir, 'backend'),
});

proc.on('close', (code) => {
  process.exit(code || 0);
});
