# LibApartado – Backend (Django + DRF + MySQL)

Backend modular en Django/DRF para gestionar las reservas del Módulo 3 de la Biblioteca Moisés San Juan López (FESC). Sin integración con Google Calendar; toda la información se almacena en MySQL/MariaDB.

## Stack
- Django 4.2 + Django REST Framework
- JWT con `djangorestframework-simplejwt`
- MySQL/MariaDB vía `django.db.backends.mysql` + `PyMySQL` (pure python, sin compilación)
- Documentación con `drf-spectacular`
- CORS con `django-cors-headers`

## Estructura modular (monorepo)
- `core`: settings utilitarios y comando `seed`
- `accounts`: usuario custom con roles `ADMIN` y `TEACHER`, endpoints de usuarios y `me`
- `spaces`: CRUD de espacios
- `reservations`: lógica de reservas, servicios de negocio y validaciones de solapamiento

## Requisitos
- Python 3.11
- MySQL 8 (o MariaDB 10.6+)
- PyMySQL no requiere compilación; Docker ya trae dependencias básicas
- `pip` y `virtualenv` para ejecución local

## Variables de entorno (archivo `.env`)
- `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `ALLOWED_HOSTS`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`
- `TIME_ZONE` (por defecto `America/Bogota`)
- `RESERVATION_MIN_DURATION_MINUTES` (30) y `RESERVATION_MAX_DURATION_HOURS` (4)
- `USE_SQLITE_FOR_TESTS=1` permite correr pytest sin MySQL (default en `.env.example`)
- `CORS_ALLOWED_ORIGINS` (ej. `http://localhost:3000`)

Clona `.env.example` a `.env` y ajusta valores:
```bash
cp .env.example .env
```

## Ejecución con Docker Compose (recomendada)
```bash
docker compose up -d
docker compose exec api python manage.py migrate
docker compose exec api python manage.py seed
```
API: `http://localhost:8000/api/`  
Docs: `http://localhost:8000/api/docs/`

Credenciales semilla:
- Admin: `admin@fesc.local` / `Admin123!`
- Teacher: `teacher@fesc.local` / `Teacher123!`

## Ejecución local (sin Docker)
1) Instala MySQL/MariaDB (o usa Docker). PyMySQL es puro Python, no necesita compilar.
2) Prepara entorno virtual:
```bash
python -m venv .venv
source .venv/bin/activate  # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
3) Copia `.env.example` a `.env` y apunta a tu instancia MySQL.  
4) Migraciones y seed:
```bash
python manage.py migrate
python manage.py seed
```
5) Levanta el servidor:
```bash
python manage.py runserver 0.0.0.0:8000
```

## Comandos útiles
- Aplicar migraciones: `python manage.py migrate`
- Crear datos demo: `python manage.py seed`
- Crear superusuario: `python manage.py createsuperuser`
- Ejecutar servidor dev: `python manage.py runserver 0.0.0.0:8000`
- Ejecutar pruebas (SQLite si `USE_SQLITE_FOR_TESTS=1`): `pytest`
- Generar tokens JWT: `POST /api/auth/login/` con `email` y `password`

## Dockerfile y Compose
- `Dockerfile` instala dependencias básicas y gunicorn, expone la app (PyMySQL no requiere compilación).
- `docker-compose.yml` levanta `db` (MySQL) y `api` (Django). Ajusta puertos/env vars en `.env`.

## Endpoints principales
- Auth JWT: `POST /api/auth/login/`, `POST /api/auth/refresh/`, `GET /api/auth/me/`
- Usuarios (solo ADMIN): CRUD en `/api/users/`
- Espacios: `/api/spaces/` (ADMIN puede crear/editar/borrar)
- Disponibilidad: `GET /api/spaces/{id}/availability/?start=&end=`
- Reservas:
  - Global (ocupación): `GET /api/reservations/?space=&start=&end=` (teacher ve datos públicos)
  - Mías: `GET /api/reservations/mine/`
  - Crear: `POST /api/reservations/`
  - Detalle: `GET /api/reservations/{id}/` (teacher ajeno -> público)
  - Cancelar: `POST /api/reservations/{id}/cancel/`
  - Aprobar/Rechazar (ADMIN): `POST /api/reservations/{id}/approve/`, `POST /api/reservations/{id}/reject/`
  - Editar (solo ADMIN, revalida solapamiento): `PATCH /api/reservations/{id}/`

## Regla de solapamiento
Se bloquean reservas PENDING/APPROVED que cumplan: `start_at < other.end_at AND end_at > other.start_at` en el mismo Space, ignorando REJECTED/CANCELLED.

La validación y creación usan `transaction.atomic()` + `SELECT FOR UPDATE` en `reservations/services.py` para reducir condiciones de carrera.

## Tests
Se usan pytest + pytest-django (`USE_SQLITE_FOR_TESTS=1` en `.env` por defecto):
```bash
pytest
```
Cobertura mínima:
- Solapamiento
- Listado público para teacher y prohibición de PATCH
- Cancelación propia (teacher)
- Aprobar/Rechazar (admin)
- Disponibilidad retorna bloques ocupados

## Frontend React (Vite)
- Ruta: `frontend/`
- Configura `.env` desde `.env.example` (por defecto `VITE_API_BASE=http://localhost:8000/api`)
- Instala/levanta: `cd frontend && npm install && npm run dev`
- Incluye vistas por rol: login JWT, espacios, disponibilidad, reservas (rango), mis reservas y panel admin (aprobaciones y usuarios)

## MySQL DDL
DDL equivalente en `scripts/sql/schema.sql` (PK INT AUTO_INCREMENT, FK RESTRICT, índices requeridos).

## Flujo de desarrollo local
- `pip install -r requirements.txt`
- `python manage.py migrate && python manage.py seed`
- `python manage.py runserver 0.0.0.0:8000`

## Notas
- Las fechas deben ser timezone-aware (`America/Bogota`).
- Duración mínima 30 minutos, máxima 4 horas (configurables).
- Teacher no puede PATCH/PUT; cancela y crea nuevamente.
