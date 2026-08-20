# TGOTG — Tareas pendientes

> Documento de trabajo del juego. La información de contexto, arquitectura y principios está en `AGENTS.md`.
> Aquí solo queda lo que falta por hacer.

## Reglas de juego (definidas)

### Producción y consumo de recursos

- Cada ciudad tiene su **producción individual** por recurso (oro, madera, piedra, hierro y comida) y sus **consumos** por recurso.
- Las tropas estacionadas en la ciudad **no** consumen comida; la **población** de cada ciudad sí.
- Cuando pasa el día, se calcula la **diferencia (producción − consumo)** de cada ciudad.
- El **excedente** producido de todas las ciudades del jugador se suma a sus **recursos generales**.
- Si el jugador pierde una ciudad **antes del reparto**, pierde el excedente pendiente de esa ciudad (no se transfiere).

### Recursos generales vs recursos de ciudad

- Cada ciudad gestiona su propio stock y su producción/consumo.
- El jugador tiene además unos **recursos generales** (a nivel de civilización), separados del stock de cada ciudad, donde se acumula el excedente del reparto diario.

### Fin de partida

- Al terminar la partida, el mundo se **paraliza** (estado `finished`): ya no acepta más movimientos.
- Se genera un **reporte** con las estadísticas de la partida (ganador, rankings, totales…), guardado en una tabla de histórico (`world_reports`).

### Reinicio de partida

- El reinicio **vacía las tablas de juego**: mundo, jugadores, ciudades, edificios, conversaciones y mensajes.
- Se **conservan**: la cuenta del jugador (`users`), sus estadísticas (`user_statistics`), los reportes históricos de partidas terminadas (`world_reports`) y los catálogos estáticos (`building_types`, `blessings`, `civilizations`).

### Estadísticas por cuenta

- Cada cuenta acumula de forma persistente (sobrevive a los reinicios): **partidas jugadas**, **bendición más usada** y **civilización más jugada**.

---

## Frontend / UI

- [ ] Al seleccionar "Ciudad" en el menú, mostrar el listado de ciudades disponibles.
- [ ] Unificar la vista de ciudad con la de construcción (cada construcción pertenece a una ciudad).
- [ ] En el panel de construcciones, mostrar un resumen de qué hace cada construcción.
- [ ] Al conectarse, mostrar un resumen de lo sucedido con las ciudades (ataques, daños, ganancias por defensa exitosa).

## Ciudades y colonización

- [ ] Fundar la primera ciudad es gratis.
- [ ] Para fundar una ciudad, consultar el mapa del mundo; cada zona ofrece bonos según su bioma.
- [ ] El jugador pone nombre a sus ciudades.

## Estilos y biomas

- [ ] Definir al menos 3 estilos de ciudad.
- [ ] Cada bioma otorga bonos extra de producción de algún recurso.
- [ ] Diferentes especializaciones de recursos y ventajas de producción.
- [ ] Sistema `bioma + estilo + edificio` que no duplique la lógica del juego.

## Reglas de juego

- [ ] Reglas de producción de recursos.
- [ ] El ayuntamiento determina el nivel máximo del resto de construcciones (ej. ayuntamiento 5 → construcciones 5).
- [ ] Niveles de edificios.
- [ ] Sistema de daño.
- [ ] Sistema de reparación.
- [ ] Sistema de turnos/acciones: número fijo de turnos/acciones cada cierto tiempo, acumulables.
- [ ] La producción de recursos puede ligarse al reparto de turnos/acciones.
- [ ] Comercio de recursos con el propio sistema (intercambiar unos recursos por otros).
- [ ] Las tropas en la ciudad no consumen comida; la población de cada ciudad sí.

## Ejército y combate

- [ ] Sistema de ejército.
- [ ] Cinco tipos de tropas.
- [ ] Reglas de combate (combates automáticos).
- [ ] Cada ciudad produce tropas; por defecto quedan en guardia de la ciudad.
- [ ] El jugador decide qué tropas mover al ejército; las del ejército no defienden la ciudad salvo que estén ubicadas en ella.
- [ ] Botón de disolver ejército y elegir ciudad destino de las tropas.
- [ ] Ataque desde el mapa: seleccionar una región y ver sus ciudades con un mensajes ("Defensa débil", "Defensa considerable", "Fuerzas superiores detectadas").
- [ ] Al atacar, avisar de un ejército adicional sin dar detalles y sin incluirlo en el % (o no mostrar %: solo el nivel del ayuntamiento).
- [ ] Resumen de batalla al finalizar (daños, ganancias, tropas perdidas) y combate por rounds con registro de acciones.
- [ ] Con 1 sola ciudad no se pierde nunca; con 2+, una ciudad atacada puede pasar al atacante (definir fórmula de probabilidad).
- [ ] El atacante recibe la ciudad con los destrozos del ataque (definir probabilidad de destrozos).

## Mapa mundial y PvP

- [ ] Mapa mundial.
- [ ] No mostrar ciudades con demasiada diferencia de nivel.
- [ ] PvP.
- [ ] Crear alianzas y enviar recursos entre jugadores de la misma alianza.
- [ ] Mensajería.

## Partidas

- [ ] Panel de inicio de partida: duraciones, multiplicadores y bendiciones de los dioses.
- [ ] Al terminar la partida, resumen de la mejor civilización por estadísticas.
- [ ] Antes de comenzar otra partida, borrar todos los datos (inicio limpio).

## Ciudad y Phaser

- [ ] Estados visuales de edificios (construcción, dañado, destruido): validar el sistema con el Ayuntamiento y reutilizarlo en el resto.
- [ ] Reparación y mejora (`repairing`, `upgrading`) si se necesitan.

## Backend (ETAPA 8 - en progreso)

Laravel proyecto corriendo con routes API implementadas:

- Autenticación Sanctum: register, login, logout, user actual
- World: crear/terminar contienda, duración y multiplicadores
- City: mostrar ciudad con recursos, producción por hora, edificios
- Building: reparación (paid/auto), progreso automático
- System: bendiciones, civilizaciones, tipos de edificio, opciones de juego
- Mensajería: conversaciones y mensajes entre jugadores
- Pendiente: reglas completas de producción, ejército y combate

## IA futura (post-MVP)

- [ ] Diseñar la arquitectura de agentes IA: `AI Provider → AI Agent → Game Actions`.
- [ ] Definir una interfaz común de acciones para jugadores humanos e IA (el servidor siempre valida igual).
- [ ] Estrategia de integración con proveedores de modelos (al menos 3), sin acoplar la arquitectura.
- [ ] Los secretos/API keys nunca deben estar disponibles para el frontend.
- [ ] Definir sistema de instrucciones/personajes de los dioses IA (personalidad, objetivos, prioridades, tolerancia al riesgo, límites).
