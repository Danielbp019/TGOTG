# TGOTG — El Juego de los Dioses

Juego de estrategia medieval persistente por navegador, con una experiencia visual moderna.

## Lore

- Ambientación de fantasía medieval. Cada jugador es un **dios menor** que guía una civilización durante una gran guerra para demostrar cuál merece ser la mejor.
- El jugador no controla unidades directamente: dirige ciudades, economía, construcciones, investigación, ejército, expansión, diplomacia y estrategia.

## Stack tecnológico

- **Frontend** (`front-tgotg/`): React + TypeScript, Next.js, Tailwind CSS, shadcn/ui, Phaser 4.
- **Backend** (`back-tgotg/`): Laravel (PHP 8.x), Eloquent ORM, MariaDB, Composer, autenticación Sanctum.
- **Gestión de paquetes**: `pnpm` exclusivamente en el frontend; `composer` en el backend. No usar npm ni yarn.
- **Monorepo**: un único repositorio; cada carpeta contiene solo su parte (frontend / backend).

## Idioma

- Idioma predeterminado de la interfaz: **español**. Todos los textos visibles en español.
- La arquitectura debe permitir i18n futuro, pero inicialmente solo español.
- Responde en idioma español.

## Arquitectura

- React controla interfaz, navegación y estado; Phaser controla la representación visual del mundo.
- No mezclar lógica de interfaz con lógica de renderizado de Phaser.
- La UI debe mantenerse desacoplada de la representación visual del mundo.
- Componentes modulares, sin componentes gigantes:
  `components/{layout, ui (shadcn), resources, navigation, city, account}`, `game/`, `data/`, `types/`, `hooks/`, `lib/`.

## Dominio

- Recursos: Oro, Madera, Piedra, Hierro, Comida.
- Edificios MVP: Ayuntamiento, Mina, Aserradero, Cantera, Cuartel, Granja.
- La ciudad es una vista 2D con apariencia isométrica sobre parcelas predefinidas.

## Principios de desarrollo

1. No implementar funcionalidades futuras antes de necesitarlas.
2. Mantener React y Phaser separados conceptualmente.
3. Usar TypeScript en todo el frontend.
4. Mantener todos los textos visibles en español.
5. Usar datos mock antes de conectar el backend.
6. No acoplar la lógica del juego a los assets gráficos.
7. No crear sistemas complejos sin necesidad.
8. Priorizar una interfaz funcional sobre efectos visuales.
9. Cada etapa debe dejar la aplicación ejecutable.
10. Todo dato de prueba va en `database/seeders` y `database/factories`, nunca hardcodeado en controladores. Los controladores son estándar y leen/escriben DB; el seed puebla la DB.
11. Da respuestas breves en lo posible.

## Calidad de código y reutilización

### Librerías obligatorias

- **Formularios**: `react-hook-form` + `@hookform/resolvers/zod` + `zod`.
  No crear forms con `useState` manual.
- **Data fetching**: `@tanstack/react-query` (`useQuery`, `useMutation`, `useQueryClient`).
  No hacer `fetch()` directo.
- **Validación**: Zod schemas en `lib/validations/{dominio}.ts`, tipos con `z.infer<typeof schema>`.
  Nunca duplicar un schema.

### Reutilización antes de crear

- **Usar siempre los componentes shadcn/ui instalados**: `Card`, `Button`, `Badge`, `Input`, `Label`, etc.
  No crear `<div className="rounded-xl border p-4">` cuando existe `Card`.
  No crear `<button className="...">` cuando existe `Button`.
  Revisar `components/ui/` antes de crear cualquier elemento de UI.
- Diálogo de confirmación → `ConfirmDialog` (`components/ui/confirm-dialog.tsx`)
- Formulario en diálogo → `FormDialog` (`components/ui/form-dialog.tsx`)
- Estado de carga → `Skeleton` (`components/ui/skeleton.tsx`). Nunca `<p>Cargando...</p>`
- No usar `confirm()` del navegador

### Formato de imports

- Usar `import * as React from 'react'` consistente
- Imports de shadcn: `@/components/ui/{componente}`
- Imports de API: `@/lib/api`
- Imports de validación: `@/lib/validations/{dominio}`

### Convenciones de archivos

- Componentes: `kebab-case.tsx` (ej. `clan-detail.tsx`)
- Hooks: `use-{nombre}.ts` (ej. `use-my-resources.ts`)
- Validations: `kebab-case.ts` (ej. `auth.ts`, `clans.ts`)
- Named exports en componentes; default exports solo en pages/layouts de Next.js

## Validaciones

- En el frontend se usa `zod` (ver "Calidad de código y reutilización").
- En el backend se usan las reglas nativas de Laravel.

## Búsqueda y lectura de archivos

- No buscar, listar ni leer dentro de `node_modules`, `.next`, `dist` ni `vendor` salvo necesidad estricta.
- Limitar las búsquedas al código fuente propio (app, components, lib, data, types, game, back-tgotg) para no desperdiciar contexto.
- Excepción: leer la documentación de la versión de Next.js en `node_modules/next/dist/docs/` cuando se requiera (ver `front-tgotg/AGENTS.md`).

## Documentación

- Consultar Context7 antes de asumir APIs de Next.js, React, Phaser, Tailwind, shadcn/ui, Laravel, Eloquent u otras librerías.
- Next.js 16: `proxy.ts` reemplaza a `middleware.ts` (ver `vercel/next.js` en Context7 `proxy.mdx` y `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.mdx`). No crear `middleware.ts`; usar `proxy.ts` con `export function proxy(request)` y `matcher`.
- Los README de `front-tgotg/` y `back-tgotg/` contienen la documentación específica de cada parte del sistema. Consultarlos para entender la estructura, convenciones y particularidades de cada módulo.

## Diseño visual

- Estética **medieval** coherente en toda la interfaz.
- No depender de emojis: los iconos definitivos serán assets gráficos (hoy se usa `lucide-react`).
- La IA debe aportar activamente en decisiones de diseño visual y UX (paneles, jerarquía, tipografía, paleta, botones, estados de interacción, iconografía, consistencia).
