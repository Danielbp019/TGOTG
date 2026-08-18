<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

# API

Backend de **TGOTG — El Juego de los Dioses**. API REST construida con Laravel 12 y autenticación por tokens de **Laravel Sanctum**.

## Puesta en marcha

```cmd
back-dev.cmd
```

Lanza Laravel en `http://127.0.0.1:8000`. La base de datos es **MariaDB** (`tgotg_game`).

- **URL base**: `http://127.0.0.1:8000/api`
- **CORS**: permite peticiones desde `http://localhost:3000` y `http://127.0.0.1:3000` (frontend Next.js).

## Autenticación

Sanctum en modo **Bearer token**:

1. En `register` o `login` se devuelve un `token` opaco.
2. Las rutas protegidas requieren la cabecera:

```
Authorization: Bearer <token>
```

3. `logout` revoca el token actual; a partir de ese momento deja de ser válido.

## Endpoints

| Método | Ruta              | Auth | Descripción                                  |
| ------ | ----------------- | ---- | -------------------------------------------- |
| GET    | `/api/ping`       | No   | Comprobación de que la API responde.         |
| POST   | `/api/auth/register` | No | Crea una cuenta y devuelve un token.         |
| POST   | `/api/auth/login` | No   | Inicia sesión y devuelve un token.           |
| POST   | `/api/auth/logout`| Sí   | Cierra sesión y revoca el token actual.      |
| GET    | `/api/user`       | Sí   | Devuelve los datos del usuario autenticado.  |

### `GET /api/ping`

Sin autenticación.

```json
{ "message": "pong" }
```

### `POST /api/auth/register`

Sin autenticación. Crea el usuario con rol `player` siempre (el rol nunca se acepta del cliente).

**Cuerpo de petición**

| Campo                | Reglas                                    |
| -------------------- | ----------------------------------------- |
| `nick`               | obligatorio, string, único                |
| `email`              | obligatorio, email válido, único          |
| `password`           | obligatorio, mínimo 8 caracteres          |
| `password_confirmation` | obligatorio, debe coincidir con `password` |

**Respuesta 201**

```json
{
  "token": "1|abc123...",
  "user": {
    "id": "01a0127e-1499-71c6-92e1-bce9ef458d82",
    "nick": "Thor",
    "email": "thor@example.com",
    "role": "player"
  }
}
```

**Errores**: `422` con los errores de validación (en español).

### `POST /api/auth/login`

Sin autenticación. Limitada a **6 intentos por minuto** (`throttle:6,1`).

**Cuerpo de petición**

| Campo      | Reglas               |
| ---------- | -------------------- |
| `email`    | obligatorio, email   |
| `password` | obligatorio          |

**Respuesta 200**

```json
{
  "token": "1|abc123...",
  "user": {
    "id": "01a0127e-1499-71c6-92e1-bce9ef458d82",
    "nick": "Thor",
    "email": "thor@example.com",
    "role": "player"
  }
}
```

**Errores**: `422` si las credenciales no coinciden (`message` con `Las credenciales no coinciden con nuestros registros.`).

### `POST /api/auth/logout`

Requiere autenticación. Revoca el token usado en la petición.

**Respuesta 200**

```json
{ "message": "Sesión cerrada correctamente." }
```

### `GET /api/user`

Requiere autenticación. Datos del usuario actual.

**Respuesta 200**

```json
{
  "id": "01a0127e-1499-71c6-92e1-bce9ef458d82",
  "nick": "Thor",
  "email": "thor@example.com",
  "role": "player"
}
```

## Errores comunes

| Código | Situación                                                        |
| ------ | ---------------------------------------------------------------- |
| `401`  | Token ausente, inválido o revocado. `{ "message": "Unauthenticated." }` |
| `422`  | Validación fallida: `{ "message": "...", "errors": { "campo": ["..."] } }` (mensajes en español) |
| `429`  | Demasiados intentos en `login`.                                   |

## Usuario administrador (seeder)

`php artisan db:seed` crea la cuenta de administrador:

- **nick**: `Dios Supremo`
- **email**: `admin@example.com`
- **contraseña**: `password`
- **rol**: `admin`

> El rol `admin` solo se asigna por seeder; el registro público siempre crea usuarios `player`.