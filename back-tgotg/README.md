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

## Autorización (Policies)

La comprobación de propiedad no se hace "a mano" en los controladores; vive en policies:

- `BuildingPolicy::manage` — un edificio solo se repara/mejora si pertenece a la ciudad del jugador en la contienda `running` actual (`403` en caso contrario).
- `ConversationPolicy::participate` — solo los dos participantes de una conversación pueden leerla, escribir o borrarla (`404`, para no revelar existencia).

## Rate limiting

| Grupo                           | Límite  |
| ------------------------------- | ------- | ----- |
| `POST /api/auth/register        | login`  | 6/min |
| Resto de endpoints autenticados | 120/min |
| Endpoints de mensajería         | 30/min  |

Al superarlo la API responde `429`.

## Integridad y concurrencia

Las operaciones que tocan recursos del juego son atómicas:

- **Mejora/reparación de edificios** (`CityController`): la validación de recursos y los descuentos ocurren dentro de una transacción con `lockForUpdate` sobre la fila de la ciudad → peticiones paralelas no pueden duplicar gastos ni dejar recursos en negativo.
- **Creación de mundo** (`WorldController::store`): cierra mundos anteriores, borra sus jugadores (cascada) y crea el nuevo mundo/player/ciudad/edificios dentro de una sola transacción protegida con `Cache::lock('tgotg:world-create-lock')`; si otra creación está en curso responde `409`.
- El mundo "actual" se memoiza por petición (`ResolvesCurrentPlayer`) para no repetir consultas.

## Endpoints

| Método | Ruta                                         | Auth | Descripción                                                              |
| ------ | -------------------------------------------- | ---- | ------------------------------------------------------------------------ |
| GET    | `/api/ping`                                  | No   | Comprobación de que la API responde.                                     |
| POST   | `/api/auth/register`                         | No   | Crea una cuenta y deja la sesión en cookie `tgotg_token`.                |
| POST   | `/api/auth/login`                            | No   | Inicia sesión y deja la sesión en cookie `tgotg_token`.                  |
| POST   | `/api/auth/logout`                           | Sí   | Cierra sesión, revoca el token y borra la cookie.                        |
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
| POST   | `/api/city/buildings/{building}/upgrade`     | Sí   | Inicia la mejora/construcción de un edificio (cola temporizada).         |
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

Requiere autenticación (cookie `tgotg_token` o `Authorization: Bearer`). Devuelve la ciudad del jugador con todos sus datos. Las coordenadas `shape,x,y,width,height` y `worldSize` **no se leen de la tabla `buildings`** — la tabla solo guarda `level/damage/repair_*/upgrade_*`; el controlador las resuelve contra el SSOT `App\Support\CityLayouts` y las inyecta en la respuesta. `StartingConfig::buildings()` es alias deprecado.

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

Requiere autenticación. Crea una nueva contienda (partida).

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

## Errores comunes

| Código | Situación                                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| `401`  | Token ausente, inválido o revocado. `{ "message": "Unauthenticated." }`                                        |
| `422`  | Validación fallida: `{ "message": "...", "errors": { "campo": ["..."] } }` (mensajes en español)               |
| `429`  | Demasiadas peticiones: `login`/`register` (6/min), mensajería (30/min), resto de la API autenticada (120/min). |

## Coordenadas y mapas (SSOT)

- **Fichero único:** `app/Support/CityLayouts.php` — `const WORLD_SIZE`, `plots(map='bosque')` y `plotForKey(key, map)`. Único lugar para mover edificios o añadir mapas/edificios. `StartingConfig::buildings(map)` delega allí.
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
