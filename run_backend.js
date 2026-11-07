import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Detectar automáticamente el ejecutable de Python en el entorno virtual (venv)
let pythonPath = 'python';

if (process.platform === 'win32') {
  const venvWin = path.resolve('venv/Scripts/python.exe');
  if (fs.existsSync(venvWin)) {
    pythonPath = venvWin;
  }
} else {
  const venvUnix = path.resolve('venv/bin/python');
  if (fs.existsSync(venvUnix)) {
    pythonPath = venvUnix;
  }
}

// Ejecutar manage.py runserver pasando los argumentos adecuadamente incluso con espacios en rutas
const managePy = path.resolve('backend/manage.py');
const child = spawn(pythonPath, [managePy, 'runserver'], {
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
