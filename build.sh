#!/usr/bin/env bash
# Exit on error
set -o errexit

# Si estamos en la raíz del repositorio, entrar a backend
if [ -d "backend" ]; then
    cd backend
fi

# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Recolectar archivos estáticos para WhiteNoise
python manage.py collectstatic --no-input

# 3. Aplicar migraciones a PostgreSQL
python manage.py migrate

# 4. Poblar datos iniciales
python manage.py seed_data
