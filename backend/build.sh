#!/usr/bin/env bash
# Exit on error
set -o errexit

# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Recolectar archivos estáticos para WhiteNoise
python manage.py collectstatic --no-input

# 3. Aplicar migraciones a la base de datos de Render
python manage.py migrate

# 4. Poblar datos iniciales (roles, capillas y usuarios de prueba)
python manage.py seed_data
