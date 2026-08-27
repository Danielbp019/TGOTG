# Frontend — El Juego de los Dioses

Interfaz del juego. App moderna con estética medieval, construida con **Next.js 16.3.0**, **React 19.2.8**, **Phaser 4.2.1**, **Tailwind 4.3.3** y **shadcn/ui (base-nova, neutral)**.

> Next 16: la protección de rutas vive en `proxy.ts` (reemplaza a `middleware.ts`). Ver `proxy.ts` + `AGENTS.md`.

---

## Prerrequisitos

- **Node LTS** + **pnpm 11.22.0** (no uses `npm` ni `yarn` en este repo).
- Backend corriendo en `http://localhost:8000` (`back-dev.cmd` en `back-tgotg/`) con MariaDB `tgotg_game` migrada y seedeada.

---

## Instalación y arranque

```bash
# desde front-tgotg/
pnpm install
cp .env.example .env   # ajusta si tu back no está en localhost:8000
pnpm dev               # http://localhost:3000
```

```bash
pnpm build   # compilación producción (Turbopack)
pnpm start   # servir build
pnpm lint    # eslint (next/core-web-vitals)
pnpm format  # prettier --write .
```

---

## Variables de entorno

| Variable              | Para qué sirve                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base de la API. Por defecto `http://localhost:8000/api` (ver `.env.example`). Debe coincidir con `APP_URL` del back para que la cookie funcione. |

La sesión es una cookie `HttpOnly` llamada `tgotg_token` que pone el backend al hacer `login`/`register`. El navegador la envía solo si el front usa `fetch(..., { credentials: "include" })` — ya está configurado en `lib/api.ts`. No la busques en `localStorage`.

---

## Rutas

```
app/layout.tsx                → Root (lang="es", fuentes Geist, TooltipProvider + AuthProvider)
proxy.ts                      → guard server-side: protege "/" , "/mensajes/*" , "/configuracion/*" si no hay cookie tgotg_token; redirige "/login" y "/register" a "/" si ya hay sesión
app/(game)/layout.tsx         → CityProvider + GameShell + BlessingDialog + CivilizationDialog
app/(game)/page.tsx           → Ciudad: CityCanvas (75vh, min-h-96) + CityStatus + ConstructionPanel
app/(game)/mensajes/page.tsx  → MessagesInbox
app/(game)/configuracion/page.tsx → WorldConfigPanel (solo admin)
app/(auth)/layout.tsx         → layout centrado medieval (max-w-sm)
app/(auth)/login/page.tsx     → LoginForm
app/(auth)/register/page.tsx  → RegisterForm
```

Ver detalle de endpoints de API en `../back-tgotg/README.md`.

---

## Arquitectura React ↔ Phaser

Regla de oro del proyecto: **React no pinta el mundo y Phaser no pinta UI**.

- **React** = interfaz, navegación, estado, validaciones.
- **Phaser** = render del mundo isométrico.

Puente único:

```
CityProvider (GET /api/city) → game/city-data.ts (setCityBuildings / setWorldSize)
       ↓
CityCanvas → phaser-game.tsx (new Phaser.Game) → game/scenes/city-scene.ts
```

- `game/main.ts` crea el `GameConfig` (`AUTO`, `Scale.FIT`, `2048×1024`, `background #1e2a1e`).
- `game/assets.ts` mapea sprites `public/game/buildings/*` (`{prefijo}1..5.png` + `Destruido.png`, `1` es construcción, `2` se reutiliza para nivel 1 y 2).
- `game/plots.ts` está deprecado: las coordenadas vienen del SSOT del back `App\Support\CityLayouts` vía `GET /api/city`.
- `EventBus` (`game/event-bus.ts`) solo para `current-scene-ready`.
- **Refresco de la ciudad sin polling**: `CityProvider` ya no consulta `/api/city` cada 5 s. Calcula el `upgradeFinishesAt` más próximo y programa la recarga para ese momento (chequeo local cada 1 s + buffer de 2 s por desfase de reloj). Cero peticiones mientras no haya mejoras en curso.

### Modo debug de Phaser (ciudad)

Dos capas independientes sobre la escena (`city-scene.ts`):

| Tecla | Qué muestra                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `O`   | Rejilla cartesiana: líneas cada 128 px, ejes rojos en el origen y etiquetas `(x, y)` en los cruces de 256 px                                      |
| `P`   | Contornos amarillos de las parcelas con etiqueta `tipo (x, y)`, ancla del sprite (origin 0.5, 1) y readout en vivo de las coordenadas del puntero |

Se pueden combinar; todo se dibuja a depth máximo y se limpia al alternar o al desmontar la escena. Útil para ajustar coordenadas en `App\Support\CityLayouts` (SSOT del back).

No mezcles lógica de UI dentro de `city-scene.ts` y viceversa.

---

## Estructura de carpetas

```
front-tgotg/
  app/                 # App Router (route groups (game) y (auth), layout, proxy)
  components/
    layout/            # GameShell, Sidebar, ServerClock
    navigation/        # MainMenu
    city/              # city-provider, city-title, city-status, city-canvas, construction-panel, repair-panel, create-city-dialog
    game/              # phaser-game, world-config-panel, onboarding-wizard, blessing-*
    resources/         # ResourceBar
    auth/              # auth-provider, login-form, register-form
    messages/          # messages-inbox, conversation-list, chat-viewer, new-conversation-dialog
    clans/             # clan-detail, clan-create-dialog, clan-join-form, clan-bulletin, clan-chat, clan-members-list, resource-transfer-dialog
    account/           # account-header, account-settings-dialog, tabs/profile-tab, tabs/danger-zone-tab
    ui/                # shadcn/ui (button, card, dialog, sheet, tabs…), confirm-dialog, form-dialog, skeleton
  game/                # Phaser (main, scenes/city-scene, assets, city-data, event-bus)
  data/                # resources, menu, icons, balance
  types/               # ResourceKey, BuildingType, PlotShape, Chat*
  lib/
    api.ts             # wrapper fetch (XSRF, credentials:include, ApiError, 401 → tgotg:unauthorized)
    validations/       # zod (auth, city, messages, clans, account, new-game) con z.infer
    blessing.ts        # evento tgotg:blessing-changed
    settings.ts        # TimeFormat 24h/12h en localStorage
    utils.ts           # cn (clsx + tailwind-merge)
  hooks/               # use-my-resources, use-user, etc. (lógica de negocio extraída de providers)
  public/game/         # terreno + edificios 1024×1024
```

---

## Autenticación (resumen humano)

- El backend emite `Set-Cookie: tgotg_token=...; HttpOnly; SameSite=Lax` al hacer `POST /api/auth/login` o `register`.
- El front no guarda el token en JS. `proxy.ts` lee la cookie en el servidor y decide redirigir (`/ → /login` si no hay cookie, `/login → /` si la hay).
- `AuthProvider` hidrata el usuario con `useQuery({ queryKey: ['user'], queryFn: () => api.get('/user') })` usando la cookie, pero **solo en rutas de juego**: en `/login` y `/register` no hay llamada al backend (evita un `401` inútil cada vez que entras a `/` sin sesión; el proxy ya decidió por ti). Mientras `isLoading` no fetchea ciudad ni bendiciones.
- Todos los diálogos/paneles que llaman a la API (`CityProvider`, `BlessingDialog`, `CivilizationDialog`, `ServerClock`, `ConstructionPanel`, etc.) esperan a `user` antes de fetchear → cero `api/*` en `/login`.
- **Roles**: `POST /api/worlds` requiere rol `admin`. Si el usuario no es admin, el backend devuelve `403`. El frontend solo muestra el panel de configuración de mundo a usuarios con `role: "admin"`.
- Como respaldo para Postman/tests sigue funcionando `Authorization: Bearer <token>` si lo envías a mano.

---

## Validaciones y estilo

- **zod obligatorio** en el front: esquemas en `lib/validations/` y tipos con `z.infer` (`AGENTS.md`).
- **react-hook-form** para todos los formularios: `useForm` + `zodResolver`. No crear forms con `useState` manual.
- **react-query** para data fetching: `useQuery`, `useMutation`, `useQueryClient`. No hacer `fetch()` directo.
- **Componentes reutilizables**: `ConfirmDialog` (confirmaciones destructivas), `FormDialog` (formularios en diálogos), `Skeleton` (estados de carga). Revisar `components/ui/` antes de crear nuevos.
- **Estética medieval** coherente; iconos `lucide-react` provisionales (no emojis).
- **Tailwind 4** (`app/globals.css` + `@import "tailwindcss"`), sin `tailwind.config.ts`; PostCSS es `@tailwindcss/postcss`.
- **shadcn/ui** `style: base-nova`, `baseColor: neutral`, `cssVariables: true` (`components.json`).
- **Formato**: `prettier` (`singleQuote, semi:false`) + `prettier-plugin-tailwindcss`; `eslint-config-next` + `eslint-config-prettier`.
- **Convenciones de archivos**: componentes `kebab-case.tsx`, hooks `use-{nombre}.ts`, validations `kebab-case.ts`.

---

## Troubleshooting

| Síntoma                                  | Qué mirar                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `401 Sesión caducada` en bucle           | Revisa `back-tgotg/.env` → `SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000` y `SESSION_DOMAIN=localhost`. Borra cookies y re-loguea.      |
| `403` al crear mundo                     | Solo los usuarios con rol `admin` pueden crear contiendas. El rol se asigna por seeder, no por la interfaz.                                       |
| `CORS blocked` / `Set-Cookie` no aparece | Back debe tener `supports_credentials: true` y front `NEXT_PUBLIC_API_URL` debe apuntar al mismo host/puerto del back.                            |
| `proxy` no redirige                      | Verifica que existe `proxy.ts` (no `middleware.ts`) y su `config.matcher` incluye `"/", "/login", "/mensajes/:path*"`.                            |
| Phaser no carga sprites                  | Revisa `public/game/buildings/*`; en la ciudad pulsa `O` (rejilla + coordenadas) o `P` (contornos de parcelas y puntero) para depurar posiciones. |
| `pnpm build` falla por tipos             | Corre `pnpm lint` y `pnpm format:check` antes; valida `zod` en `lib/validations/city.ts`.                                                         |

---

Ver API completa en `../back-tgotg/README.md`.
