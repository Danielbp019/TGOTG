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

> Los tokens caducan a las **24 horas** (`SANCTUM_TOKEN_EXPIRATION`). Los tokens expirados se eliminan de la base de datos diariamente con el comando programado `sanctum:prune-expired`.

## Endpoints

| Método | Ruta                                         | Auth | Descripción                                                              |
| ------ | -------------------------------------------- | ---- | ------------------------------------------------------------------------ |
| GET    | `/api/ping`                                  | No   | Comprobación de que la API responde.                                     |
| POST   | `/api/auth/register`                         | No   | Crea una cuenta y devuelve un token.                                     |
| POST   | `/api/auth/login`                            | No   | Inicia sesión y devuelve un token.                                       |
| POST   | `/api/auth/logout`                           | Sí   | Cierra sesión y revoca el token actual.                                  |
| GET    | `/api/user`                                  | Sí   | Devuelve los datos del usuario autenticado.                              |
| PUT    | `/api/account/profile`                       | Sí   | Actualiza nick y/o contraseña del usuario autenticado.                   |
| DELETE | `/api/account`                               | Sí   | Elimina la cuenta y todos sus datos.                                     |
| GET    | `/api/server-time`                           | Sí   | Devuelve la hora actual del servidor (ISO 8601 UTC).                     |
| GET    | `/api/player/blessing`                       | Sí   | Devuelve la bendición actual del jugador en la partida.                  |
| PUT    | `/api/player/blessing`                       | Sí   | Actualiza la bendición del jugador.                                      |
| GET    | `/api/player/civilization`                   | Sí   | Devuelve la civilización actual del jugador en la partida.               |
| PUT    | `/api/player/civilization`                   | Sí   | Actualiza la civilización del jugador.                                   |
| GET    | `/api/blessings`                             | Sí   | Lista todas las bendiciones disponibles.                                 |
| GET    | `/api/civilizations`                         | Sí   | Lista todas las civilizaciones disponibles.                              |
| GET    | `/api/building-types`                        | Sí   | Lista todos los tipos de edificio disponibles.                           |
| GET    | `/api/game-options`                          | Sí   | Devuelve duraciones y multiplicadores para crear partida.                |
| GET    | `/api/city`                                  | Sí   | Devuelve la ciudad del jugador con recursos, producción, edificios, etc. |
| POST   | `/api/city/buildings/{building}/repair`      | Sí   | Repara un edificio (paid/auto).                                          |
| POST   | `/api/worlds`                                | Sí   | Crea una nueva contienda (partida).                                      |
| GET    | `/api/conversations`                         | Sí   | Lista conversaciones del jugador.                                        |
| POST   | `/api/conversations`                         | Sí   | Crea una nueva conversación con un mensaje inicial.                      |
| GET    | `/api/conversations/{conversation}`          | Sí   | Obtiene una conversación con sus mensajes.                               |
| POST   | `/api/conversations/{conversation}/messages` | Sí   | Envía un mensaje en una conversación existente.                          |
| DELETE | `/api/conversations/{conversation}`          | Sí   | Elimina una conversación.                                                |

### `GET /api/ping`

Sin autenticación.

```json
{ "message": "pong" }
```

### `POST /api/auth/register`

Sin autenticación. Crea el usuario con rol `player` siempre (el rol nunca se acepta del cliente). Limitada a **6 peticiones por minuto** (`throttle:6,1`). El nick es único y **sensible a mayúsculas/minúsculas** (`Thor` y `thor` son nicks distintos).

**Cuerpo de petición**

| Campo                   | Reglas                                     |
| ----------------------- | ------------------------------------------ |
| `nick`                  | obligatorio, string, único                 |
| `email`                 | obligatorio, email válido, único           |
| `password`              | obligatorio, mínimo 8 caracteres           |
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

**Errores**: `422` con los errores de validación (en español). Un nick ocupado devuelve `Este nick ya está en uso.` en `errors.nick`. `429` si se supera el límite de peticiones.

### `POST /api/auth/login`

Sin autenticación. Limitada a **6 intentos por minuto** (`throttle:6,1`).

**Cuerpo de petición**

| Campo      | Reglas             |
| ---------- | ------------------ |
| `email`    | obligatorio, email |
| `password` | obligatorio        |

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

### `GET /api/server-time`

Requiere autenticación. Hora actual del servidor en formato ISO 8601 (UTC).

**Respuesta 200**

```json
{
    "time": "2026-08-18T12:34:56+00:00"
}
```

### `PUT /api/account/profile`

Requiere autenticación. Actualiza el nick y/o la contraseña del usuario.

**Cuerpo de petición**

| Campo                   | Reglas                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `nick`                  | opcional, string 3–24, único (sensible a mayúsculas/minúsculas, se ignora al propio usuario) |
| `current_password`      | obligatorio si se envía `password`, debe coincidir con la contraseña actual                  |
| `password`              | opcional, mínimo 8 caracteres                                                                |
| `password_confirmation` | obligatorio si se envía `password`, debe coincidir con `password`                            |

**Respuesta 200**

```json
{
    "user": {
        "id": "01a0127e-1499-71c6-92e1-bce9ef458d82",
        "nick": "Odin",
        "email": "thor@example.com",
        "role": "player"
    }
}
```

**Errores**: `422` con los errores de validación (en español). El nick ocupado devuelve `Este nick ya está en uso.`; la contraseña actual incorrecta devuelve `La contraseña actual no es correcta.`.

### `DELETE /api/account`

Requiere autenticación. Elimina la cuenta y sus datos (tokens, estadísticas, partidas y mensajes). Los reportes históricos de partidas terminadas se conservan.

**Cuerpo de petición**

| Campo          | Reglas                                                          |
| -------------- | --------------------------------------------------------------- |
| `confirm_nick` | obligatorio, debe coincidir exactamente con el nick del usuario |
| `password`     | obligatorio, debe coincidir con la contraseña actual            |

**Respuesta 200**

```json
{ "message": "Cuenta eliminada correctamente." }
```

**Errores**: `422` si el nick no coincide o la contraseña es incorrecta.

### `GET /api/player/blessing`

Requiere autenticación. Bendición seleccionada por el jugador en la partida actual.

**Respuesta 200**

```json
{
    "in_game": true,
    "blessing": {
        "key": "forge",
        "name": "Forja Divina",
        "benefit": "+20% producción de hierro",
        "description": "Los hornos arden con fuego eterno..."
    }
}
```

### `PUT /api/player/blessing`

Requiere autenticación. Cambia la bendición del jugador.

**Cuerpo de petición**

| Campo | Reglas                                    |
| ----- | ----------------------------------------- |
| `key` | obligatorio, clave de bendición existente |

### `GET /api/player/civilization`

Requiere autenticación. Civilización seleccionada por el jugador en la partida actual.

### `PUT /api/player/civilization`

Requiere autenticación. Cambia la civilización del jugador.

**Cuerpo de petición**

| Campo | Reglas                                       |
| ----- | -------------------------------------------- |
| `key` | obligatorio, clave de civilización existente |

### `GET /api/blessings`

Requiere autenticación. Catálogo completo de bendiciones.

**Respuesta 200**

```json
{
    "blessings": [
        {
            "key": "forge",
            "name": "Forja Divina",
            "benefit": "+20% producción de hierro",
            "description": "..."
        },
        {
            "key": "harvest",
            "name": "Cosecha Bendita",
            "benefit": "+20% producción de comida",
            "description": "..."
        }
    ]
}
```

### `GET /api/civilizations`

Requiere autenticación. Catálogo completo de civilizaciones.

### `GET /api/building-types`

Requiere autenticación. Catálogo completo de tipos de edificio con costes, tiempos y requisitos.

### `GET /api/game-options`

Requiere autenticación. Opciones para crear partida: duraciones y multiplicadores de velocidad.

**Respuesta 200**

```json
{
    "durations": [
        {
            "key": "short",
            "label": "Corta (7 días)",
            "value": 7,
            "description": "Partida rápida"
        },
        {
            "key": "medium",
            "label": "Media (14 días)",
            "value": 14,
            "description": "Partida estándar"
        }
    ],
    "multipliers": [
        {
            "key": "normal",
            "label": "Normal (1x)",
            "value": 1,
            "description": "Velocidad base"
        },
        {
            "key": "fast",
            "label": "Rápida (2x)",
            "value": 2,
            "description": "Doble velocidad"
        }
    ]
}
```

### `GET /api/city`

Requiere autenticación. Devuelve la ciudad del jugador con todos sus datos.

**Respuesta 200**

```json
{
    "city": {
        "name": "Mi Ciudad",
        "resources": {
            "gold": 1000,
            "wood": 500,
            "stone": 300,
            "iron": 200,
            "food": 800
        },
        "perHour": {
            "gold": 50,
            "wood": 30,
            "stone": 20,
            "iron": 15,
            "food": 40
        },
        "population": 100,
        "happiness": 85,
        "defense": 150,
        "stationedTroops": 50,
        "defensePower": 500,
        "protectionUntil": "2026-08-20T12:00:00+00:00",
        "buildings": [
            {
                "key": "townhall",
                "name": "Ayuntamiento",
                "category": "core",
                "level": 3,
                "damage": 0,
                "repairing": false,
                "repairPaid": false,
                "shape": "rect",
                "x": 0,
                "y": 0,
                "width": 2,
                "height": 2
            }
        ]
    }
}
```

### `POST /api/city/buildings/{building}/repair`

Requiere autenticación. Inicia la reparación de un edificio.

**Cuerpo de petición**

| Campo  | Reglas                       |
| ------ | ---------------------------- |
| `type` | obligatorio, `paid` o `auto` |

### `POST /api/worlds`

Requiere autenticación. Crea una nueva contienda (partida).

**Cuerpo de petición**

| Campo            | Reglas                                     |
| ---------------- | ------------------------------------------ |
| `duration_key`   | obligatorio, clave de duración válida      |
| `multiplier_key` | obligatorio, clave de multiplicador válida |

### `GET /api/conversations`

Requiere autenticación. Lista las conversaciones del jugador autenticado.

### `POST /api/conversations`

Requiere autenticación. Crea una nueva conversación con un mensaje inicial.

**Cuerpo de petición**

| Campo            | Reglas                                    |
| ---------------- | ----------------------------------------- |
| `recipient_nick` | obligatorio, nick de un usuario existente |
| `body`           | obligatorio, string                       |

### `GET /api/conversations/{conversation}`

Requiere autenticación. Obtiene una conversación con todos sus mensajes.

### `POST /api/conversations/{conversation}/messages`

Requiere autenticación. Envía un mensaje en una conversación existente.

**Cuerpo de petición**

| Campo  | Reglas              |
| ------ | ------------------- |
| `body` | obligatorio, string |

### `DELETE /api/conversations/{conversation}`

Requiere autenticación. Elimina una conversación.

## Errores comunes

| Código | Situación                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------ |
| `401`  | Token ausente, inválido o revocado. `{ "message": "Unauthenticated." }`                          |
| `422`  | Validación fallida: `{ "message": "...", "errors": { "campo": ["..."] } }` (mensajes en español) |
| `429`  | Demasiados intentos en `login` o `register`.                                                     |

## Usuario administrador (seeder)

`php artisan db:seed` crea la cuenta de administrador:

- **nick**: `Dios Supremo`
- **email**: `admin@example.com`
- **contraseña**: `password`
- **rol**: `admin`

> El rol `admin` solo se asigna por seeder; el registro público siempre crea usuarios `player`.
