<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

# API

Backend de **TGOTG — El Juego de los Dioses**. API REST construida con Laravel 12 y autenticación por tokens de **Laravel Sanctum**.

## Puesta en marcha

```cmd
back-dev.cmd
```

Lanza Laravel en `http://127.0.0.1:8000`. La base de datos es **MariaDB** (`tgotg_game`).

- **URL base**: `http://127.0.0.1:8000/api`
- **CORS**: configurable por la variable `CORS_ALLOWED_ORIGINS` (por defecto `http://localhost:3000,http://127.0.0.1:3000`) con `supports_credentials: true`.
    - En `.env` deben estar: `SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000`, `SESSION_DOMAIN=localhost` y `CORS_ALLOWED_ORIGINS` apuntando al front (ver Variables de entorno). Sin esto el navegador bloquea la cookie de sesión y verás `401`.
- **Frontend**: debe llamar a la API con `credentials: "include"` para que el navegador envíe la cookie `tgotg_token` automáticamente.

## Autenticación

La API usa **Sanctum con cookie `HttpOnly`** (recomendado para el navegador). Es más seguro que guardar el token en `localStorage` porque JavaScript no puede leer la cookie.

**Cómo funciona (flujo normal del navegador):**

1. `POST /api/auth/register` o `POST /api/auth/login` → el servidor crea un token interno, lo guarda en la base y lo envía al navegador como cookie:
   `Set-Cookie: tgotg_token=1|abc...; HttpOnly; SameSite=Lax; Path=/` (dura 24h). Además devuelve `{ user }` (y `token` opcional para compatibilidad).
2. En cada petición siguiente el navegador envía la cookie automáticamente (si el frontend usa `fetch(..., { credentials: "include" })`). El middleware `AttachTokenFromCookie` la convierte en `Authorization: Bearer <token>` para que Sanctum autentique. No necesitas añadir la cabecera a mano.
3. `POST /api/auth/logout` revoca el token en la base y borra la cookie (`Set-Cookie: tgotg_token=; Max-Age=0`).

**¿Y `Authorization: Bearer`?** Sigue funcionando como respaldo (útil para Postman, tests `actingAs` o apps externas). Si envías `Authorization: Bearer 1|abc...` el servidor lo usa directamente y no necesita la cookie. En el navegador real, usa la cookie.

> Los tokens caducan a las **24 horas** (`SANCTUM_TOKEN_EXPIRATION`). Los expirados se borran a diario con `sanctum:prune-expired`. Si ves `401 Sesión caducada` en el front, el `middleware/proxy` te redirige a `/login` y el `ApiError` dispara `tgotg:unauthorized`.

## Autorización (Policies y roles)

La comprobación de propiedad no se hace "a mano" en los controladores; vive en policies:

- `BuildingPolicy::manage` — un edificio solo se repara/mejora si pertenece a la ciudad del jugador en la contienda `running` actual (`403` en caso contrario).
- `ConversationPolicy::participate` — solo los dos participantes de una conversación pueden leerla, escribir o borrarla (`404`, para no revelar existencia).

Las rutas exclusivas de administrador usan el middleware `role:admin` (alias registrado en `bootstrap/app.php`). Si un usuario sin el rol adecuado intenta acceder, recibe `403` con `{ "message": "No tienes permiso para realizar esta acción." }`. Los roles se asignan únicamente por seeder; el registro público siempre crea cuentas `player`.

## Rate limiting

| Grupo                           | Límite  |
| ------------------------------- | ------- |
| `POST /api/auth/register/login` | 6/min   |
| Resto de endpoints autenticados | 120/min |
| Endpoints de mensajería         | 30/min  |
| Endpoints de clanes             | 60/min  |

Al superarlo la API responde `429`.

## Integridad y concurrencia

Las operaciones que tocan recursos del juego son atómicas:

- **Mejora/reparación de edificios** (`CityController`): la validación de recursos y los descuentos ocurren dentro de una transacción con `lockForUpdate` sobre la fila de la ciudad → peticiones paralelas no pueden duplicar gastos ni dejar recursos en negativo.
- **Creación de mundo** (`WorldController::store`): cierra mundos anteriores, borra sus jugadores (cascada) y crea el nuevo mundo/player/ciudad/edificios dentro de una sola transacción protegida con `Cache::lock('tgotg:world-create-lock')`; si otra creación está en curso responde `409`.
- El mundo "actual" se memoiza por petición (`ResolvesCurrentPlayer`) para no repetir consultas.

## Endpoints

| Método | Ruta                                          | Auth  | Descripción                                                              |
| ------ | --------------------------------------------- | ----- | ------------------------------------------------------------------------ |
| GET    | `/api/ping`                                   | No    | Comprobación de que la API responde.                                     |
| POST   | `/api/auth/register`                          | No    | Crea una cuenta y deja la sesión en cookie `tgotg_token`.                |
| POST   | `/api/auth/login`                             | No    | Inicia sesión y deja la sesión en cookie `tgotg_token`.                  |
| POST   | `/api/auth/logout`                            | Sí    | Cierra sesión, revoca el token y borra la cookie.                        |
| GET    | `/api/user`                                   | Sí    | Devuelve los datos del usuario autenticado.                              |
| PUT    | `/api/account/profile`                        | Sí    | Actualiza nick y/o contraseña del usuario autenticado.                   |
| DELETE | `/api/account`                                | Sí    | Elimina la cuenta y todos sus datos.                                     |
| GET    | `/api/server-time`                            | Sí    | Devuelve la hora actual del servidor (ISO 8601 UTC).                     |
| GET    | `/api/player/blessing`                        | Sí    | Devuelve la bendición actual del jugador en la partida.                  |
| PUT    | `/api/player/blessing`                        | Sí    | Actualiza la bendición del jugador.                                      |
| GET    | `/api/player/resources`                       | Sí    | Devuelve los recursos actuales del jugador.                              |
| GET    | `/api/player/civilization`                    | Sí    | Devuelve la civilización actual del jugador en la partida.               |
| PUT    | `/api/player/civilization`                    | Sí    | Actualiza la civilización del jugador.                                   |
| GET    | `/api/blessings`                              | Sí    | Lista todas las bendiciones disponibles.                                 |
| GET    | `/api/civilizations`                          | Sí    | Lista todas las civilizaciones disponibles.                              |
| GET    | `/api/building-types`                         | Sí    | Lista todos los tipos de edificio disponibles.                           |
| GET    | `/api/unit-types`                             | Sí    | Lista tipos de unidad (filtro por civilización).                         |
| GET    | `/api/game-options`                           | Sí    | Devuelve duraciones y multiplicadores para crear partida.                |
| GET    | `/api/city`                                   | Sí    | Devuelve la ciudad del jugador con recursos, producción, edificios, etc. |
| GET    | `/api/cities`                                 | Sí    | Lista las ciudades del jugador.                                          |
| GET    | `/api/cities/{city}`                          | Sí    | Devuelve una ciudad con sus edificios.                                   |
| POST   | `/api/cities`                                 | Sí    | Crea una nueva ciudad en una región y bioma.                             |
| GET    | `/api/regions`                                | Sí    | Lista regiones disponibles con sus biomas.                               |
| GET    | `/api/biomes`                                 | Sí    | Lista todos los biomas disponibles.                                      |
| POST   | `/api/city/buildings/{building}/repair`       | Sí    | Repara un edificio (paid/auto).                                          |
| POST   | `/api/city/buildings/{building}/upgrade`      | Sí    | Inicia la mejora/construcción de un edificio (cola temporizada).         |
| POST   | `/api/worlds`                                 | Admin | Crea una nueva contienda (partida).                                      |
| GET    | `/api/conversations`                          | Sí    | Lista conversaciones del jugador.                                        |
| POST   | `/api/conversations`                          | Sí    | Crea una nueva conversación con un mensaje inicial.                      |
| GET    | `/api/conversations/{conversation}`           | Sí    | Obtiene una conversación con sus mensajes.                               |
| POST   | `/api/conversations/{conversation}/messages`  | Sí    | Envía un mensaje en una conversación existente.                          |
| DELETE | `/api/conversations/{conversation}`           | Sí    | Elimina una conversación.                                                |
| GET    | `/api/clans`                                  | Sí    | Lista todos los clanes de la contienda.                                  |
| POST   | `/api/clans`                                  | Sí    | Crea un nuevo clan.                                                      |
| GET    | `/api/clans/my`                               | Sí    | Devuelve el clan del jugador actual con miembros y boletines.            |
| GET    | `/api/clans/{clan}`                           | Sí    | Devuelve el detalle de un clan.                                          |
| POST   | `/api/clans/{clan}/join`                      | Sí    | Solicita unirse a un clan.                                               |
| POST   | `/api/clans/{clan}/leave`                     | Sí    | Abandona el clan actual.                                                 |
| DELETE | `/api/clans/{clan}`                           | Sí    | Disuelve el clan (solo el líder).                                        |
| GET    | `/api/clans/{clan}/applications`              | Sí    | Lista solicitudes pendientes de un clan.                                 |
| POST   | `/api/clans/{clan}/applications/{app}/accept` | Sí    | Acepta una solicitud de unión.                                           |
| POST   | `/api/clans/{clan}/applications/{app}/reject` | Sí    | Rechaza una solicitud de unión.                                          |
| GET    | `/api/clans/{clan}/bulletins`                 | Sí    | Lista boletines del clan.                                                |
| POST   | `/api/clans/{clan}/bulletins`                 | Sí    | Crea un nuevo boletín.                                                   |
| PUT    | `/api/clans/{clan}/bulletins/{bulletin}`      | Sí    | Actualiza un boletín.                                                    |
| DELETE | `/api/clans/{clan}/bulletins/{bulletin}`      | Sí    | Elimina un boletín.                                                      |
| GET    | `/api/clans/{clan}/messages`                  | Sí    | Devuelve los mensajes recientes del chat del clan.                       |
| POST   | `/api/clans/{clan}/messages`                  | Sí    | Envía un mensaje al chat del clan.                                       |
| POST   | `/api/clan/transfer`                          | Sí    | Transfiere recursos a otro miembro del clan.                             |

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

Requiere autenticación (cookie `tgotg_token` o `Authorization: Bearer`). Devuelve la ciudad del jugador con todos sus datos. Las coordenadas `shape,x,y,width,height` y `worldSize` **no se leen de la tabla `buildings`** — la tabla solo guarda `level/damage/repair_*/upgrade_*`; el controlador las resuelve contra el SSOT `App\Support\CityLayouts` y las inyecta en la respuesta.

**Respuesta 200**

```json
{
    "city": {
        "name": "Principal",
        "resources": {
            "gold": 12450,
            "wood": 8300,
            "stone": 6200,
            "iron": 4100,
            "food": 9700
        },
        "perHour": {
            "gold": 109,
            "wood": 85,
            "stone": 60,
            "iron": 35,
            "food": 105
        },
        "population": 340,
        "happiness": 72,
        "defense": 230,
        "stationedTroops": 124,
        "defensePower": 3330,
        "protectionUntil": "2026-08-20T12:00:00+00:00",
        "worldSize": { "width": 2048, "height": 1024 },
        "buildings": [
            {
                "id": "0199aabb-...-uuid",
                "key": "ayuntamiento",
                "name": "Ayuntamiento",
                "category": "Principal",
                "level": 1,
                "damage": 0,
                "repairing": false,
                "repairPaid": false,
                "upgrading": false,
                "upgradeFinishesAt": null,
                "shape": "diamond",
                "x": 970,
                "y": 290,
                "width": 340,
                "height": 340
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

### `POST /api/city/buildings/{building}/upgrade`

Requiere autenticación. Inicia la construcción o mejora de un edificio. Coste y tiempo escalan por nivel: materiales y oro `×1.6^(n-1)` (redondeo a decenas) y minutos `×1.5^(n-1)` según `config/game_balance.php` vía `BuildingCosts::costForLevel()`. El tiempo se divide por `speed_multiplier` del mundo.

**Reglas:** nivel `< max_level (5)`, `damage == 0`, sin `repair` ni `upgrade` en curso, recursos suficientes (verificados con `lockForUpdate` dentro de la transacción). Múltiples edificios pueden estar en cola en paralelo. La producción (`per_level` en `game_balance.production`) se aplica al completarse el nivel, no al iniciarlo.

**Respuesta 200 (cola):**

```json
{
    "building": {
        "id": "uuid",
        "key": "granja",
        "level": 0,
        "upgrading": true,
        "upgradeFinishesAt": "2026-08-22T12:30:00+00:00",
        "targetLevel": 1,
        "cost": {
            "gold": 1500,
            "wood": 600,
            "stone": 100,
            "iron": 0,
            "minutes": 45
        }
    }
}
```

**Errores:** `422` nivel máximo / dañado / recursos insuficientes; `409` ya en reparación o mejora; `403` edificio ajeno.

**Atajos para pruebas:** con `APP_DEBUG=true`, `POST .../upgrade?instant=1` completa instantáneamente (sin cola). Alternativamente `FAST_BUILD_FACTOR` en `.env` (ver Variables de entorno), que se lee vía `config('game_balance.fast_build_factor')` (compatible con `config:cache`).

### `POST /api/worlds`

Requiere autenticación y rol `admin`. Crea una nueva contienda (partida).

**Cuerpo de petición**

| Campo            | Reglas                                     |
| ---------------- | ------------------------------------------ |
| `duration_key`   | obligatorio, clave de duración válida      |
| `multiplier_key` | obligatorio, clave de multiplicador válida |

### `GET /api/conversations`

Requiere autenticación. Lista las conversaciones del jugador autenticado. Optimizada: usa `lastMessage` (`latestOfMany`) y un subcontaje SQL para los no leídos — no carga todos los mensajes de cada conversación.

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

---

## Sistema y catálogos

### `GET /api/player/resources`

Requiere autenticación. Devuelve los recursos actuales del jugador en la partida.

**Respuesta 200**

```json
{
    "in_game": true,
    "resources": {
        "gold": 12450,
        "wood": 8300,
        "stone": 6200,
        "iron": 4100,
        "food": 9700
    }
}
```

Si el jugador no está en partida: `{ "in_game": false, "resources": null }`.

### `GET /api/unit-types`

Requiere autenticación. Catálogo de tipos de unidad. Opcionalmente filtra por civilización.

**Query params**

| Campo          | Reglas                                    |
| -------------- | ----------------------------------------- |
| `civilization` | opcional, clave de civilización existente |

Si no se envía `civilization` y el jugador tiene civilización seleccionada, usa esa. Si no, devuelve todas las unidades.

**Respuesta 200**

```json
{
    "unit_types": [
        {
            "id": "uuid",
            "key": "guerrero",
            "name": "Guerrero",
            "tier": 1,
            "attack": 10,
            "defense": 5,
            "speed": 1.0,
            "cost": { "gold": 100, "food": 50 },
            "civilization": { "key": "norse", "name": "Nórdicos" }
        }
    ]
}
```

### `GET /api/cities`

Requiere autenticación. Lista las ciudades del jugador en la contienda actual.

**Respuesta 200**

```json
{
    "cities": [
        {
            "id": "uuid",
            "name": "Principal",
            "region": { "id": "uuid", "key": "bosque", "label": "Bosque" },
            "biome": { "id": "uuid", "key": "archipiélago" }
        }
    ]
}
```

Si no hay contienda en curso: respuesta `404` con `"No hay una contienda en curso."`.

### `GET /api/cities/{city}`

Requiere autenticación. Devuelve una ciudad con todos sus edificios. Las coordenadas `shape,x,y,width,height` y `worldSize` se resuelven contra el SSOT `App\Support\CityLayouts`.

**Respuesta 200**

Mismo formato que `GET /api/city` (ver arriba).

**Errores**: `403` si la ciudad no pertenece al jugador.

### `POST /api/cities`

Requiere autenticación. Crea una nueva ciudad en una región y bioma.

**Cuerpo de petición**

| Campo       | Reglas                                       |
| ----------- | -------------------------------------------- |
| `name`      | obligatorio, string, 3–30 caracteres         |
| `region_id` | obligatorio, uuid, debe existir en `regions` |
| `biome_id`  | obligatorio, uuid, debe existir en `biomes`  |

El bioma debe pertenecer a la región seleccionada (verificación server-side).

**Respuesta 201**

```json
{
    "city": {
        "id": "uuid",
        "name": "Nueva Ciudad",
        "region": { "id": "uuid", "key": "bosque", "label": "Bosque" },
        "biome": { "id": "uuid", "key": "archipiélago" }
    }
}
```

**Errores**: `422` si el bioma no pertenece a la región, validación fallida.

### `GET /api/regions`

Requiere autenticación. Lista todas las regiones disponibles con sus biomas.

**Respuesta 200**

```json
{
    "regions": [
        {
            "id": "uuid",
            "key": "bosque",
            "label": "Bosque",
            "polygon": "[[0,0],[100,0],[100,100],[0,100]]",
            "sortOrder": 1,
            "biomes": [
                {
                    "id": "uuid",
                    "key": "archipiélago",
                    "label": "Archipiélago",
                    "description": "Islas separadas por agua",
                    "bonusResource": "food",
                    "bonusValue": 0.15
                }
            ]
        }
    ]
}
```

### `GET /api/biomes`

Requiere autenticación. Lista todos los biomas disponibles.

**Respuesta 200**

```json
{
    "biomes": [
        {
            "id": "uuid",
            "key": "archipiélago",
            "label": "Archipiélago",
            "description": "Islas separadas por agua",
            "bonusResource": "food",
            "bonusValue": 0.15
        }
    ]
}
```

---

## Clanes

Los clanes permiten a los jugadores agruparse, compartir un tablón de anuncios, chatear y transferir recursos. Todos los endpoints de clanes usan `throttle:60,1`.

### `GET /api/clans`

Requiere autenticación. Lista todos los clanes de la contienda actual.

**Respuesta 200**

```json
{
    "clans": [
        {
            "id": "uuid",
            "name": "Los Valientes",
            "acronym": "LVA",
            "leader": { "id": "uuid", "nick": "Thor" },
            "memberCount": 5,
            "maxMembers": 20
        }
    ]
}
```

### `POST /api/clans`

Requiere autenticación. Crea un nuevo clan. El jugador queda como líder automáticamente.

**Cuerpo de petición**

| Campo     | Reglas                                                  |
| --------- | ------------------------------------------------------- |
| `name`    | obligatorio, string, max 50, único                      |
| `acronym` | obligatorio, string, 3–5 caracteres, solo letras, único |

**Respuesta 201**

```json
{
    "clan": {
        "id": "uuid",
        "name": "Los Valientes",
        "acronym": "LVA",
        "leader": { "id": "uuid", "nick": "Thor" },
        "members": [
            {
                "id": "uuid",
                "nick": "Thor",
                "role": "leader",
                "joinedAt": "2026-08-27T12:00:00+00:00"
            }
        ],
        "memberCount": 1,
        "maxMembers": 20
    }
}
```

**Errores**: `422` si el jugador ya pertenece a un clan, nombre o acrónimo ocupado.

### `GET /api/clans/my`

Requiere autenticación. Devuelve el clan del jugador actual con miembros, boletines y rol.

**Respuesta 200**

```json
{
    "clan": {
        "id": "uuid",
        "name": "Los Valientes",
        "acronym": "LVA",
        "leader": { "id": "uuid", "nick": "Thor" },
        "members": [
            {
                "id": "uuid",
                "nick": "Thor",
                "role": "leader",
                "joinedAt": "2026-08-27T12:00:00+00:00"
            },
            {
                "id": "uuid",
                "nick": "Loki",
                "role": "member",
                "joinedAt": "2026-08-27T13:00:00+00:00"
            }
        ],
        "bulletins": [
            {
                "id": "uuid",
                "title": "Reunión",
                "content": "Reunión el viernes a las 20h.",
                "author": { "id": "uuid", "nick": "Thor" },
                "createdAt": "2026-08-27T12:00:00+00:00"
            }
        ],
        "memberCount": 2,
        "maxMembers": 20,
        "currentUserRole": "leader",
        "currentPlayerId": "uuid"
    }
}
```

Si el jugador no tiene clan: `{ "clan": null }`.

### `GET /api/clans/{clan}`

Requiere autenticación. Devuelve el detalle de un clan (sin miembros ni boletines).

**Respuesta 200**

```json
{
    "clan": {
        "id": "uuid",
        "name": "Los Valientes",
        "acronym": "LVA",
        "leader": { "id": "uuid", "nick": "Thor" },
        "memberCount": 5,
        "maxMembers": 20
    }
}
```

### `POST /api/clans/{clan}/join`

Requiere autenticación. Solicita unirse a un clan. El mensaje es opcional.

**Cuerpo de petición**

| Campo     | Reglas                    |
| --------- | ------------------------- |
| `message` | opcional, string, max 500 |

**Respuesta 201**

```json
{
    "application": {
        "id": "uuid",
        "status": "pending",
        "createdAt": "2026-08-27T12:00:00+00:00"
    }
}
```

**Errores**: `422` si ya pertenece a un clan, clan lleno, solicitud pendiente, límite de 24h.

### `POST /api/clans/{clan}/leave`

Requiere autenticación. Abandona el clan actual. El líder no puede abandonar (debe disolver).

**Respuesta 200**

```json
{ "message": "Has abandonado el clan." }
```

**Errores**: `422` si no pertenece a un clan, cooldown de salida, líder no puede salir.

### `DELETE /api/clans/{clan}`

Requiere autenticación. Disuelve el clan. Solo el líder puede hacerlo.

**Respuesta 200**

```json
{ "message": "El clan ha sido disuelto." }
```

**Errores**: `403` si no es el líder, `422` si hay cooldown.

### `GET /api/clans/{clan}/applications`

Requiere autenticación. Lista las solicitudes pendientes de un clan. Solo miembros del clan pueden verlas.

**Respuesta 200**

```json
{
    "applications": [
        {
            "id": "uuid",
            "player": { "id": "uuid", "nick": "Odin" },
            "message": "Quiero unirme al clan.",
            "createdAt": "2026-08-27T12:00:00+00:00"
        }
    ]
}
```

**Errores**: `403` si no es miembro del clan.

### `POST /api/clans/{clan}/applications/{application}/accept`

Requiere autenticación. Acepta una solicitud de unión. Requiere permisos de admin (líder u oficial).

**Respuesta 200**

```json
{ "message": "Solicitud aceptada." }
```

**Errores**: `403` sin permisos, `422` clan lleno, solicitud ya procesada, jugador ya en clan.

### `POST /api/clans/{clan}/applications/{application}/reject`

Requiere autenticación. Rechaza una solicitud de unión. Requiere permisos de admin.

**Respuesta 200**

```json
{ "message": "Solicitud rechazada." }
```

**Errores**: `403` sin permisos, `422` solicitud ya procesada.

### `GET /api/clans/{clan}/bulletins`

Requiere autenticación. Lista los boletines del clan. Solo miembros del clan pueden verlos.

**Respuesta 200**

```json
{
    "bulletins": [
        {
            "id": "uuid",
            "title": "Reunión",
            "content": "Reunión el viernes a las 20h.",
            "author": { "id": "uuid", "nick": "Thor" },
            "createdAt": "2026-08-27T12:00:00+00:00"
        }
    ]
}
```

**Errores**: `403` si no es miembro del clan.

### `POST /api/clans/{clan}/bulletins`

Requiere autenticación. Crea un nuevo boletín. Requiere permisos de admin.

**Cuerpo de petición**

| Campo     | Reglas                        |
| --------- | ----------------------------- |
| `title`   | obligatorio, string, max 100  |
| `content` | obligatorio, string, max 2000 |

**Respuesta 201**

```json
{
    "bulletin": {
        "id": "uuid",
        "title": "Reunión",
        "content": "Reunión el viernes a las 20h.",
        "author": { "id": "uuid", "nick": "Thor" },
        "createdAt": "2026-08-27T12:00:00+00:00"
    }
}
```

**Errores**: `403` sin permisos.

### `PUT /api/clans/{clan}/bulletins/{bulletin}`

Requiere autenticación. Actualiza un boletín. Requiere permisos de admin.

**Cuerpo de petición**

| Campo     | Reglas                        |
| --------- | ----------------------------- |
| `title`   | obligatorio, string, max 100  |
| `content` | obligatorio, string, max 2000 |

**Respuesta 200**

```json
{
    "bulletin": {
        "id": "uuid",
        "title": "Reunión actualizada",
        "content": "Reunión el sábado.",
        "author": { "id": "uuid", "nick": "Thor" },
        "createdAt": "2026-08-27T12:00:00+00:00"
    }
}
```

**Errores**: `403` sin permisos, `422` boletín no pertenece al clan.

### `DELETE /api/clans/{clan}/bulletins/{bulletin}`

Requiere autenticación. Elimina un boletín. Requiere permisos de admin.

**Respuesta 200**

```json
{ "message": "Publicación eliminada." }
```

**Errores**: `403` sin permisos, `422` boletín no pertenece al clan.

### `GET /api/clans/{clan}/messages`

Requiere autenticación. Devuelve los mensajes recientes del chat del clan. Solo miembros del clan pueden verlos. Limitado a 100 mensajes (configurable en `game_balance.clan.chat_max_messages`).

**Respuesta 200**

```json
{
    "messages": [
        {
            "id": "uuid",
            "body": "¿Listos para la batalla?",
            "sender": { "id": "uuid", "nick": "Thor" },
            "createdAt": "2026-08-27T12:00:00+00:00"
        }
    ]
}
```

**Errores**: `403` si no es miembro del clan.

### `POST /api/clans/{clan}/messages`

Requiere autenticación. Envía un mensaje al chat del clan. Solo miembros del clan pueden enviar.

**Cuerpo de petición**

| Campo  | Reglas                        |
| ------ | ----------------------------- |
| `body` | obligatorio, string, max 1000 |

**Respuesta 201**

```json
{
    "message": {
        "id": "uuid",
        "body": "¿Listos para la batalla?",
        "sender": { "id": "uuid", "nick": "Thor" },
        "createdAt": "2026-08-27T12:00:00+00:00"
    }
}
```

**Errores**: `403` si no es miembro del clan.

---

## Transferencia de recursos

### `POST /api/clan/transfer`

Requiere autenticación. Transfiere recursos a otro miembro del mismo clan. Todos los campos de recursos son opcionales pero al menos uno debe ser mayor a 0.

**Cuerpo de petición**

| Campo                 | Reglas                                       |
| --------------------- | -------------------------------------------- |
| `recipient_player_id` | obligatorio, uuid, debe existir en `players` |
| `gold`                | opcional, entero, min 0                      |
| `wood`                | opcional, entero, min 0                      |
| `stone`               | opcional, entero, min 0                      |
| `iron`                | opcional, entero, min 0                      |
| `food`                | opcional, entero, min 0                      |

**Respuesta 200**

```json
{
    "message": "Recursos enviados correctamente.",
    "sender": {
        "gold": 11450,
        "wood": 7800,
        "stone": 6100,
        "iron": 4000,
        "food": 9200
    }
}
```

**Errores**: `422` destinatario no existe, no están en el mismo clan, no puedes enviarte a ti mismo, recursos insuficientes, no envía al menos un recurso.

## Errores comunes

| Código | Situación                                                                                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `401`  | Token ausente, inválido o revocado. `{ "message": "Unauthenticated." }`                                                                                                                                 |
| `403`  | Sin permisos: edificio/conversación/clan ajena (policy), ruta de admin sin rol `admin`, líder no puede salir del clan.                                                                                  |
| `404`  | Recurso no encontrado: clan, solicitud, conversación, ciudad ajena. Para no revelar existencia se devuelve `404` en vez de `403` en algunos casos.                                                      |
| `409`  | Conflicto: creación de mundo en curso, jugador ya pertenece a un clan, solicitud pendiente, límite de solicitudes (24h).                                                                                |
| `422`  | Validación fallida: `{ "message": "...", "errors": { "campo": ["..."] } }` (mensajes en español). Errores de lógica: clan lleno, cooldown de salida, recursos insuficientes, nombre/acrónimo duplicado. |
| `429`  | Demasiadas peticiones: `login`/`register` (6/min), mensajería (30/min), clanes (6/min), resto de la API autenticada (120/min).                                                                          |

## Coordenadas y mapas (SSOT)

- **Fichero único:** `app/Support/CityLayouts.php` — `const WORLD_SIZE`, `plots(map='bosque')` y `plotForKey(key, map)`. Único lugar para mover edificios o añadir mapas/edificios.
- **Tabla `buildings`:** columnas `id, city_id, building_type_id, level, damage, repair_started_at, repair_paid, upgrade_started_at, upgrade_finishes_at, upgrade_target_level` — sin `shape,x,y,width,height`.
- **Front:** `front-tgotg/game/plots.ts` deprecado a stub; `CityScene` lee `getCityBuildings()/getWorldSize()` de `game/city-data.ts` alimentados por `GET /api/city`. Validación `zod` en `front-tgotg/lib/validations/city.ts`.
- **Nuevo mapa:** añade `case 'desierto' => [...]` en `CityLayouts::plots()` y propaga el `map` a `WorldController::store`, `DemoWorldSeeder` y `CityController::show` sin nueva migración.

## Variables de entorno

Estas variables están en `back-tgotg/.env` (ver `.env.example`). Si algo no funciona tras un `401` revisa primero aquí.

| Variable                   | Para qué sirve                                                                                                                                                                                                                                                                                                                                         | Valor recomendado                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `CORS_ALLOWED_ORIGINS`     | Orígenes que puede llamar a la API (separados por coma). Se lee en `config/cors.php`.                                                                                                                                                                                                                                                                  | `http://localhost:3000,http://127.0.0.1:3000`   |
| `SANCTUM_STATEFUL_DOMAINS` | De qué dominios el navegador puede enviar la cookie de sesión. Debe incluir el front.                                                                                                                                                                                                                                                                  | `localhost:3000,127.0.0.1:3000` en local        |
| `SESSION_DOMAIN`           | Dominio de la cookie `tgotg_token`.                                                                                                                                                                                                                                                                                                                    | `localhost` en local                            |
| `SESSION_SAME_SITE`        | Protección CSRF de la cookie. Se lee vía `config('session.same_site')`.                                                                                                                                                                                                                                                                                | `lax`                                           |
| `SESSION_SECURE_COOKIE`    | Si es `true` la cookie solo viaja por HTTPS. Se lee vía `config('session.secure')`.                                                                                                                                                                                                                                                                    | `false` en local (`http`), `true` en producción |
| `FAST_BUILD_FACTOR`        | Atajo para probar la cola de construcción sin esperar horas. `0` = tiempo real (`minutos = base ×1.5^(n-1) ÷ speed_multiplier`). `0.1` = 10% (60min→6min), `0.02` = 2% (60min→~1min), `<0.02` = segundos (mín 5s). Solo con `APP_DEBUG=true`; en producción déjalo en `0`. Se lee vía `config('game_balance.fast_build_factor')` (no `env()` directo). | `0`                                             |
| `SANCTUM_TOKEN_EXPIRATION` | Cuánto dura la sesión antes de caducar.                                                                                                                                                                                                                                                                                                                | `1440` (24h)                                    |

## Usuario administrador (seeder)

`php artisan db:seed` crea la cuenta de administrador:

- **nick**: `Dios Supremo`
- **email**: `admin@example.com`
- **contraseña**: `password`
- **rol**: `admin`

> El rol `admin` solo se asigna por seeder con `forceFill(['role' => 'admin'])`: `role` **no** está en `$fillable` del modelo `User`, así que ninguna petición HTTP puede alterarlo. El registro público siempre crea usuarios `player`.
