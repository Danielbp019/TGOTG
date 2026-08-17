# TGOTG — Tareas pendientes

> Documento de trabajo del juego. La información de contexto, arquitectura y principios está en `AGENTS.md`.
> Aquí solo queda lo que falta por hacer.

## Backend (ETAPA 8)

- [ ] Crear el proyecto Laravel definitivo (`back-tgotg`).
- [ ] Configurar autenticación Sanctum.
- [ ] Definir API para: usuario, ciudad, edificios, recursos, ejército.
- [ ] Sustituir progresivamente los datos mock por datos reales.
- [ ] Diseñar desde el inicio la separación jugador humano / jugador IA / identidad, sin crear todavía el sistema de IA.

## Ciudad y Phaser

- [ ] Día/noche: transición de iluminación, amanecer → día → atardecer → noche, con reloj local simulado.
- [ ] Estados visuales de edificios (construcción, dañado, destruido): validar el sistema con el Ayuntamiento y reutilizarlo en el resto.
- [ ] Reparación y mejora (`repairing`, `upgrading`) si se necesitan.

## Estilos y biomas

- [ ] Definir al menos 3 estilos de ciudad.
- [ ] Diferentes especializaciones de recursos y ventajas de producción.
- [ ] Sistema `bioma + estilo + edificio` que no duplique la lógica del juego.

## Reglas de juego (definir antes de implementar)

- [ ] Reglas de producción de recursos.
- [ ] Niveles de edificios.
- [ ] Sistema de daño.
- [ ] Sistema de reparación.
- [ ] Sistema de ejército.
- [ ] Tres tipos de tropas.
- [ ] Reglas de combate (combates automáticos).
- [ ] Mapa mundial.
- [ ] PvP.
- [ ] Alianzas.
- [ ] Mensajería.

## Arte y assets

- [ ] Buscar/seleccionar el estilo artístico.
- [ ] Conseguir assets provisionales.
- [ ] Crear/seleccionar Ayuntamiento, Mina, Aserradero, Cantera, Cuartel y Granja.
- [ ] Crear estados dañado/destruido.
- [ ] Iconos definitivos (cuando existan, reemplazar los de `lucide-react`).

## IA futura (post-MVP)

- [ ] Diseñar la arquitectura de agentes IA: `AI Provider → AI Agent → Game Actions`.
- [ ] Definir una interfaz común de acciones para jugadores humanos e IA (el servidor siempre valida igual).
- [ ] Estrategia de integración con proveedores de modelos (al menos 3), sin acoplar la arquitectura.
- [ ] Los secretos/API keys nunca deben estar disponibles para el frontend.
- [ ] Definir sistema de instrucciones/personajes de los dioses IA (personalidad, objetivos, prioridades, tolerancia al riesgo, límites).