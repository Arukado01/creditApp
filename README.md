# CreditApp – Prueba técnica  
La actual App fue desarrollada con las siguientes tecnologías:

_Front-end: React (Vite) · Back-end (Python): Flask/SQLAlchemy · PostgreSQL · Celery + Redis · JWT_

#### Para revisar el proyecto en productivo seguir este enlace: https://creditapp.3-139-21-107.nip.io/, puede registrarse con su correo e iniciar el recorrido en el SPA.

#### Si desea conectarse al servicio web API Rest, puede hacerlo descargando la colección `CreditApp REST API Local.postman_collection.json` ubicado en este git, importandolo en postman(punto 5) y reemplazando la variable {{base_url}} por el enlace: https://api.3-139-21-107.nip.io/api/v1
---

## 0. Puntos clave para compartir 📌

| Área                       | Qué revisar                                 | Ruta / URL                                             |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| **Rutas Flask**            | Blueprints `auth` y `credits`               | `backend/app/routes/`                                  |
| **Tarea Celery**           | Notificación e-mail (`send_credit_email`)   | `backend/app/tasks.py`                                 |
| **Política de contraseña** | Validación en Front                         | `frontend/src/pages/Register.jsx`, `ResetPassword.jsx` |
| **Filtro & paginado**      | Tabla con _react-select_ y paginación local | `frontend/src/pages/CreditsList.jsx`                   |
| **Modelo de datos**        | SQLAlchemy                                  | `backend/app/models.py`                                |
| **Pasos de despliegue**    | Todo en este README ✔                       |

---
---
## 1. Requisitos previos

| Herramienta                             | Versión probada        | Notas |
| --------------------------------------- | ---------------------- | ----- |
| **Ubuntu 22.04/24.04** (WSL 2 o nativo) | –                      |
| **Python**                              | 3.12.x                 |
| **Node.js**                             | ≥ 22 (nvm recomendado) |
| **PostgreSQL**                          | 16.x                   |
| **Redis**                               | 7.x                    |
| **Cuenta SMTP**                         | SendGrid (gratuita)    |

Instalación rápida en Ubuntu:

```bash
sudo apt update && sudo apt install -y \
  python3.12-venv build-essential redis-server postgresql-16
nvm install 18 && nvm use 18          # Node
```
---
## 2. Clonar proyecto y estructura
```bash
git clone https://github.com/Arukado01/creditApp.git
cd creditapp
# tree -L 2
# .
# ├─ backend/
# └─ frontend/
```
---
## 3. Backend (Flask + Celery)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
### 3.1 Variables de entorno
Crea backend/.env:

```ini
FLASK_ENV=development
SECRET_KEY=SÚPER_SECRETA
JWT_SECRET_KEY=SÚPER_JWT

DATABASE_URI=postgresql://credits_user:supersegura@localhost:5432/credits_db

# Celery / Redis
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Correo (SendGrid)
MAIL_SERVER=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=apikey
MAIL_PASSWORD=<TU_SENDGRID_API_KEY>
MAIL_DEFAULT_SENDER=notificaciones@tusistema.com

# E-mail fijo que exige la prueba
MAIL_ADMIN=fyasocialcapital@gmail.com

# URL frontend (para enlace reset)
FRONTEND_URL=http://localhost:5173

```
### 3.2 Restaurar el dump
```bash
cd .. # Ingreso a la carpeta raiz
createdb -U postgres credits_db
pg_restore -U postgres -d credits_db credits_db.dump

```
(o usa flask db upgrade para una BD vacía).

### 3.3 Lanzar servicios
```bash
# terminal 1 – API
export FLASK_APP=app
flask run --port 5000

# terminal 2 – Celery
source .venv/bin/activate
celery -A tasks.celery worker --loglevel=info

# terminal 3 – Redis (si no es servicio)
redis-server
```
---
## 4. Frontend (React + Vite)
Sin cerrar las terminales que anteriormente ya esta corriendo por favor correr:
```bash
cd frontend
npm install
```
.env.local:
```ini
VITE_API_URL=http://localhost:5000/api/v1
```

Modo desarrollo:
```bash
yarn dev            # http://localhost:5173
```
---
## 5. Documentación de la API REST – CreditApp  

### Cómo importar la colección en Postman

1. Abre **Postman** → `Import` → pestaña **Raw text**.  
2. Importa el JSON: `CreditApp REST API Local.postman_collection.json`
3. Pulsa **Continue** → **Import**.  
4. Crea un **Environment** llamado `CreditApp Local` con estas variables:

| Nombre     | Valor por defecto                        |
| ---------- | ---------------------------------------- |
| `base_url` | `http://localhost:5000/api/v1`           |
| `jwt`      | _(vacío, se rellenará tras hacer login)_ |

---

### Tabla de Endpoints

| Módulo      | Método   | Ruta                  | Auth | Descripción                     |
| ----------- | -------- | --------------------- | ---- | ------------------------------- |
| **Auth**    | `POST`   | `/auth/register`      | –    | Crea usuario y devuelve *201*   |
|             | `POST`   | `/auth/login`         | –    | Devuelve `access_token` (*200*) |
|             | `POST`   | `/auth/forgot`        | –    | Envía email de reset (*200*)    |
|             | `POST`   | `/auth/reset/<token>` | –    | Cambia contraseña (*200*)       |
|             | `GET`    | `/auth/profile`       | ✔    | Datos del usuario               |
| **Credits** | `POST`   | `/credits/`           | ✔    | Crear crédito (*201*)           |
|             | `GET`    | `/credits/`           | ✔    | Listar con paginado y filtros   |
|             | `GET`    | `/credits/<id>`       | ✔    | Detalle por ID                  |
|             | `PUT`    | `/credits/<id>`       | ✔    | Actualizar parcial              |
|             | `DELETE` | `/credits/<id>`       | ✔    | Eliminar                        |
|             | `GET`    | `/credits/distinct`   | ✔    | Valores únicos para filtros     |

> **Nota permisos:** Los endpoints de crédito no filtran por `user_id`;
> cualquier usuario autenticado puede leer, editar o eliminar cualquier
> registro (requisito de la prueba).

---

## 1. Autenticación
---
### 1.1 `POST /auth/register`

```http
POST {{base_url}}/auth/register
Content-Type: application/json
```
Body
```json
{
  "email": "user@example.com",
  "password": "Abc123!"
}
```
_Reglas de contraseña:_
≥ 6 caracteres, 1 mayúscula, 1 número, 1 carácter especial, sin
secuencia 123456, no “contraseña/password”.
#### — 201
```json
{ "access_token": "…" }
```

---
### 1.2 `POST /auth/login`

```http
POST {{base_url}}/auth/login
Content-Type: application/json
```
Body
```json
{ "email": "user@example.com", "password": "Abc123!" }
```
#### — 200
```json
{ "access_token": "JWT…" }
```

---
### 1.3 `POST /auth/forgot`

```http
POST {{base_url}}/auth/forgot
Content-Type: application/json
```
Body
```json
{ "email": "user@example.com" }
```
#### — 200
```json
{ "msg": "Correo enviado" }
```

---
### 1.4 `POST /auth/reset/<token>`

```http
POST {{base_url}}/auth/reset/{{token}}
Content-Type: application/json
```
Body
```json
{ "password": "Nueva123!" }
```
#### — 200
```json
{ "msg": "Contraseña actualizada" }
```

---
### 1.5 `GET /auth/profile`

```http
Authorization: Bearer {{jwt}}
```
#### — 200
```json
{ "id": 1, "email": "user@example.com" }
```
---
## 2. Créditos
Todos los endpoints requieren
```http
Authorization: Bearer {{jwt}}
```

---
### 2.1 `POST /credits/` – Crear
```json
{
  "client_name": "Juan Pérez",
  "client_id":   "123456789",
  "amount":      25000000,
  "rate":        1.5,
  "term":        24
}
```
1. Campos amount, rate, term pueden enviarse con decimales.
2. El backend añade internamente:
    - commercial = email del usuario autenticado
    - user_id = ID del usuario

#### — 201
```json
{ "id": 10, … }
```
Se dispara una tarea Celery que envía correo a:
`usuario@…`
`fyasocialcapital@gmail.com`

---
### 2.2 `GET /credits/` – Listar

Parámetros:

| Query         | Ejemplo        | Descripción                   |
| ------------- | -------------- | ----------------------------- |
| **page**      | `1`            | `Página (1-n)`                |
| **per_page**  | `10`           | `Registros x página`          |
| **client_id** | `123456789`    | `(opcional)`                  |
| **comercial** | `@empresa.com` | `(opcional, ILIKE '%valor%')` |

#### — 200
```json
{
  "items": [ { … }, … ],
  "page": 1,
  "per_page": 10,
  "total": 23,
  "pages": 3
}
```


---
### 2.3 `GET /credits/<id>`
#### — 200 Objeto crédito
#### — 404 si no existe


---
### 2.4 `PUT /credits/<id>` – Parcial
```json
{ "amount": 30000000, "rate": 1.3 }
```
#### — 200 Objeto actualizado
#### — 404 si no existe

---
### 2.5 `DELETE /credits/<id>`
#### — 204 Sin contenido
#### — 404 si no existe

---
### 2.6 `GET /credits/distinct`
Devuelve listas únicas para llenar los filtros del Frontend.
```json
{
  "client_name": ["Juan Pérez", "Ana Ruiz", "…"],
  "client_id":   ["123456789", "555555555"],
  "commercial":  ["user1@email.com", "user2@email.com"]
}
```
---
# 6. Flujo de pruebas

1. *Registro* (/register)
   - La contraseña debe cumplir:
     - ≥ 6 caracteres  
     - 1 mayúscula  
     - 1 número  
     - 1 carácter especial  
     - No “contraseña/password”  
     - No secuencias “123456” / “654321”

2. *Login*
   - JWT guardado en localStorage.

3. *Crear crédito*
   - Envío automático de correo al usuario y a fyasocialcapital@gmail.com.

4. *Filtros y paginación*
   - Usar filtros multinivel y paginación.

5. *Editar / Eliminar*
   - Cualquier usuario puede modificar o eliminar cualquier registro (requisito de la prueba).

---
# 7. Comandos rápidos

```bash
# Linter
ruff check backend

# Consola PSQL
sudo -u postgres psql credits_db
```

---
# 8. Licencia

MIT – utilízalo libremente para la evaluación técnica.

Hecho con ❤️ por Carlos Cortina – carlosjcortinam@gmail.com
