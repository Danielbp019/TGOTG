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
4. Usar componentes reutilizables (shadcn/ui).
5. Mantener todos los textos visibles en español.
6. Usar datos mock antes de conectar el backend.
7. No acoplar la lógica del juego a los assets gráficos.
8. No crear sistemas complejos sin necesidad.
9. Priorizar una interfaz funcional sobre efectos visuales.
10. Cada etapa debe dejar la aplicación ejecutable.
11. Todo dato de prueba va en `database/seeders` y `database/factories`, nunca hardcodeado en controladores. Los controladores son estándar y leen/escriben DB; el seed puebla la DB.

## Validaciones

- **Toda validación de datos en el frontend debe hacerse con `zod`**, para mantener el código ordenado y con un mismo estilo.
- Los esquemas deben vivir en `lib/validations/` y derivar tipos con `z.infer`.
- En el backend se usan las reglas nativas de Laravel.

## Búsqueda y lectura de archivos

- No buscar, listar ni leer dentro de `node_modules`, `.next`, `dist` ni `vendor` salvo necesidad estricta.
- Limitar las búsquedas al código fuente propio (app, components, lib, data, types, game, back-tgotg) para no desperdiciar contexto.
- Excepción: leer la documentación de la versión de Next.js en `node_modules/next/dist/docs/` cuando se requiera (ver `front-tgotg/AGENTS.md`).

## Documentación

- Consultar Context7 antes de asumir APIs de Next.js, React, Phaser, Tailwind, shadcn/ui, Laravel, Eloquent u otras librerías.
- Next.js 16: `proxy.ts` reemplaza a `middleware.ts` (ver `vercel/next.js` en Context7 `proxy.mdx` y `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.mdx`). No crear `middleware.ts`; usar `proxy.ts` con `export function proxy(request)` y `matcher`.

## Diseño visual

- Estética **medieval** coherente en toda la interfaz.
- No depender de emojis: los iconos definitivos serán assets gráficos (hoy se usa `lucide-react`).
- La IA debe aportar activamente en decisiones de diseño visual y UX (paneles, jerarquía, tipografía, paleta, botones, estados de interacción, iconografía, consistencia).
