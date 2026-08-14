# Juego web estratégico — Documento de desarrollo

## 1. Objetivo

Crear un juego web de estrategia persistente inspirado en los antiguos juegos de navegador, pero con una experiencia visual moderna.

El juego debe combinar:

- Mundo persistente.
- Ciudades.
- Recursos.
- Construcciones.
- Investigación.
- Ejército.
- Combates automáticos.
- Alianzas.
- Mapa mundial.
- PvP.
- Mensajería.

La prioridad inicial no es tener mucho contenido, sino construir una base técnica y visual escalable.

---

## 2. Decisiones actuales

### Frontend

- React.
- TypeScript.
- pnpm.
- Phaser 4 para la representación de la ciudad y posteriormente del mapa.
- La interfaz administrativa será HTML/CSS/React.
- Phaser se utilizará para la parte visual interactiva del juego.

### Backend

- Express.js.
- TypeScript.
- Drizzle ORM.
- MariaDB como base de datos relacional.

Express será responsable de la API, autenticación, reglas del juego y acceso a datos.

Drizzle será la capa ORM/acceso tipado a la base de datos.

### Idioma

El idioma predeterminado de la interfaz es **español**.

La arquitectura debe permitir internacionalización futura, aunque inicialmente solo se implementará español.

### Gestión de paquetes

Usar exclusivamente **pnpm**.

No utilizar npm ni yarn en las instrucciones del proyecto.

### Estructura del repositorio

Todo el proyecto estará dentro de un único repositorio:

```text
juego/
├── back-express/
└── front-next/
```

`back-express` contiene exclusivamente el backend Express.

`front-next` contiene exclusivamente la aplicación Next.js.

---

# 3. Arquitectura general

La aplicación debe separarse conceptualmente en dos partes:

```text
React
├── interfaz general
├── navegación
├── barra superior
├── barra lateral
├── recursos
├── información de ciudad
├── ejército
├── investigación
├── construcción
├── mensajes
└── ventanas/modales

Phaser 4
├── representación de ciudad
├── edificios
├── parcelas
├── animaciones
├── cámara
├── zoom
├── efectos
├── partículas
├── ciclo día/noche
└── posteriormente mapa mundial
```

React controla la interfaz y el estado de navegación.

Phaser controla la representación gráfica del mundo del juego.

No mezclar innecesariamente la lógica de interfaz con la lógica de renderizado de Phaser.

---

# 4. Estructura visual principal

La pantalla principal debe tener una estructura de tres zonas principales:

```text
┌─────────────────────────────────────────────────────────────┐
│                     BARRA SUPERIOR                          │
│ Logo / nombre                     Usuario / Cuenta / Salir  │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│ BARRA         │                                             │
│ LATERAL       │                 CIUDAD                      │
│               │                                             │
│ Recursos      │              Phaser 4                       │
│               │                                             │
│ Ciudad        │                                             │
│ Ejército      │                                             │
│ Investigación │                                             │
│ Construcción  │                                             │
│ Alianzas      │                                             │
│ Mensajes      │                                             │
│               ├─────────────────────────────────────────────┤
│               │ INFORMACIÓN DE LA CIUDAD                    │
│               │ Producción / Estado / Ejército              │
└───────────────┴─────────────────────────────────────────────┘
```

## 4.1 Barra superior

Debe permanecer fija mientras el usuario navega por la aplicación.

Contenido inicial:

- Nombre/logo del juego.
- Nombre del usuario.
- Acceso a cuenta.
- Configuración.
- Cerrar sesión.

La barra no debe desaparecer al hacer scroll.

## 4.2 Barra lateral

Debe permanecer visible.

### Recursos

Mostrar inicialmente:

- Oro.
- Madera.
- Piedra.
- Hierro.
- Comida.

Cada recurso debe tener:

- Icono.
- Cantidad actual.
- Opcionalmente producción por hora.

Ejemplo:

```text
🪙 Oro
12.450
+120/h
```

No depender de emojis en la versión final. Los iconos definitivos serán assets gráficos.

### Menú principal

Inicialmente:

- Ciudad.
- Ejército.
- Construcción.
- Investigación.
- Mapa.
- Alianzas.
- Mensajes.

Los elementos todavía no implementados deben poder mostrarse como deshabilitados o quedar fuera del menú hasta que exista su funcionalidad.

---

# 5. Zona central: ciudad

La zona central será inicialmente el foco principal del proyecto.

Debe contener una escena Phaser 4.

La ciudad será inicialmente una vista 2D con apariencia isométrica.

No se requiere un mundo 3D.

## Objetivos visuales

La ciudad debe:

- Mostrar edificios.
- Mostrar espacios vacíos/parcela.
- Permitir seleccionar edificios.
- Permitir hacer zoom.
- Permitir desplazamiento de cámara.
- Tener una estética coherente.
- Poder incorporar animaciones posteriormente.

No buscar gráficos AAA.

Priorizar:

1. claridad;
2. legibilidad;
3. sensación de progreso;
4. consistencia visual;
5. buen rendimiento.

---

# 6. Sistema de parcelas

La ciudad debe utilizar posiciones/parcela predefinidas.

Ejemplo conceptual:

```text
       [01]       [02]

 [03]       [04]       [05]

       [06]       [07]

 [08]       [09]       [10]
```

Cada parcela puede contener:

- Vacía.
- En construcción.
- Edificio construido.
- Edificio dañado.
- Edificio destruido.

Esto simplifica:

- posicionamiento;
- guardado;
- renderizado;
- colisiones;
- diseño;
- escalabilidad.

---

# 7. Sistema visual de edificios

No crear una imagen para cada nivel individual.

Utilizar estados visuales.

Ejemplo para una mina:

```text
mine_empty
mine_building
mine_small
mine_large
mine_damaged
mine_destroyed
```

Los niveles del juego pueden agruparse visualmente.

Ejemplo:

```text
Nivel 1-4   → pequeña
Nivel 5-9   → mediana
Nivel 10+   → grande
```

El nivel real será un dato del juego.

La imagen es solamente su representación visual.

## Estados generales

Inicialmente:

```text
empty
construction
normal
damaged
destroyed
```

Posteriormente se puede añadir:

```text
repairing
upgrading
```

---

# 8. Edificios iniciales

MVP:

1. Ayuntamiento.
2. Mina.
3. Aserradero.
4. Cantera.
5. Cuartel.
6. Granja.

No crear todavía todas las variantes gráficas.

Primero desarrollar el sistema con un edificio de prueba.

El primer edificio recomendado para prototipar es el Ayuntamiento.

---

# 9. Zona inferior de información

Debajo de la escena de la ciudad debe existir un panel informativo.

Inicialmente contendrá:

### Producción

- Producción de oro.
- Producción de madera.
- Producción de piedra.
- Producción de hierro.
- Producción de comida.

### Estado de la ciudad

Inicialmente:

- Población, si se decide utilizarla.
- Felicidad/moral, si se decide utilizarla.
- Defensa.
- Estado general.

No implementar estadísticas que todavía no tengan reglas de juego definidas.

### Ejército

Mostrar inicialmente:

- Tropas estacionadas.
- Fuerza defensiva.
- Estado general del ejército.

Los valores serán inicialmente simulados.

---

# 10. Recursos iniciales

El MVP contempla:

- Oro.
- Madera.
- Piedra.
- Hierro.
- Comida.

El sistema económico todavía no debe implementarse en esta primera etapa visual.

Primero utilizar datos mock.

Ejemplo:

```ts
const resources = {
  gold: 12450,
  wood: 8300,
  stone: 6200,
  iron: 4100,
  food: 9700,
};
```

Más adelante estos datos vendrán del backend.

---

# 11. Ciclo día/noche

Debe formar parte de la visión visual, pero no es necesario implementarlo en la primera pantalla funcional.

Conceptualmente:

```text
amanecer
   ↓
día
   ↓
atardecer
   ↓
noche
```

El sistema debe intentar reutilizar la misma ciudad.

No crear una imagen completa diferente de la ciudad para cada hora.

Se utilizarán:

- fondos;
- iluminación;
- overlays;
- sprites;
- partículas;
- luces de edificios.

---

# 12. Arte y assets

El proyecto no dependerá inicialmente de que el desarrollador sea artista.

Se utilizarán assets 2D compatibles con el estilo elegido.

Los edificios se manejarán como sprites/recursos independientes.

La lógica no debe depender de nombres concretos de archivos de arte más allá de una capa de configuración.

Ejemplo conceptual:

```ts
buildingVisuals = {
  mine: {
    empty: "...",
    construction: "...",
    small: "...",
    large: "...",
    damaged: "...",
    destroyed: "...",
  },
};
```

Esto permitirá reemplazar los gráficos posteriormente sin reescribir la lógica del juego.

---

# 13. Estilos y biomas

El juego tendrá posteriormente diferentes estilos de ciudad y biomas.

Objetivo inicial:

- Al menos 3 estilos de ciudad.
- Diferentes especializaciones de recursos.
- Posibilidad de que diferentes ciudades tengan ventajas de producción.

No implementar todavía los tres estilos.

Primero crear un estilo visual funcional.

El sistema debe diseñarse para permitir posteriormente:

```text
bioma + estilo + edificio
```

sin duplicar la lógica del juego.

---

# 14. Alcance de la primera etapa

## ETAPA 1 — Shell de la aplicación

Objetivo:

Construir únicamente la interfaz principal de React.

Todavía no implementar lógica real del juego.

### Debe existir

- Proyecto React + TypeScript.
- Sistema de estilos.
- Layout principal.
- Barra superior fija.
- Barra lateral fija.
- Zona central.
- Panel inferior.
- Navegación visual.
- Datos mock.
- Interfaz en español.

### No implementar todavía

- Login real.
- Backend.
- Base de datos.
- API.
- Phaser.
- Economía real.
- Combates.
- Persistencia.

Resultado esperado:

Una pantalla estática pero visualmente coherente que represente la futura interfaz del juego.

---

# 15. ETAPA 2 — Integración de Phaser 4

Objetivo:

Insertar Phaser 4 dentro de la zona central de React.

Debe existir:

- Canvas Phaser.
- Escena básica.
- Fondo.
- Cámara.
- Zoom.
- Movimiento de cámara.

Todavía no implementar edificios reales.

Resultado esperado:

La aplicación React contiene una escena Phaser funcional.

---

# 16. ETAPA 3 — Ciudad prototipo

Crear una ciudad pequeña.

Debe existir:

- Terreno.
- Grid/parcela.
- Espacios vacíos.
- Ayuntamiento.
- Selección de parcela.
- Selección de edificio.

El Ayuntamiento inicialmente puede utilizar gráficos provisionales.

---

# 17. ETAPA 4 — Estados visuales

Implementar el sistema:

```text
vacío
↓
construcción
↓
construido
↓
dañado
↓
destruido
```

Crear primero únicamente el Ayuntamiento.

Una vez validado el sistema, reutilizarlo para los demás edificios.

---

# 18. ETAPA 5 — Edificios MVP

Añadir:

- Mina.
- Aserradero.
- Cantera.
- Cuartel.
- Granja.

Cada uno debe utilizar el mismo sistema general de estados visuales.

---

# 19. ETAPA 6 — Información de ciudad

Conectar la parte inferior de la interfaz con datos mock.

Mostrar:

- Producción.
- Estado.
- Ejército.
- Edificio seleccionado.

Al seleccionar un edificio en Phaser, React debe actualizar el panel correspondiente.

---

# 20. ETAPA 7 — Día/noche

Implementar:

- transición de iluminación;
- amanecer;
- día;
- atardecer;
- noche.

No necesita estar conectado todavía con el tiempo real del servidor.

Puede utilizar un reloj local simulado.

---

# 21. ETAPA 8 — Backend

Después de validar toda la interfaz visual:

Elegir definitivamente:

- Laravel, o
- Express.

Crear API para:

- usuario;
- ciudad;
- edificios;
- recursos;
- ejército.

Los datos mock deberán sustituirse progresivamente por datos reales.

---

# 22. Arquitectura de componentes

La estructura debe mantenerse modular.

Ejemplo inicial:

```text
src/
├── app/
├── components/
│   ├── layout/
│   ├── resources/
│   ├── navigation/
│   ├── city/
│   └── account/
├── game/
│   ├── PhaserGame/
│   ├── scenes/
│   ├── buildings/
│   └── assets/
├── data/
├── types/
├── hooks/
└── lib/
```

La estructura puede modificarse si el framework elegido requiere otra organización.

No crear componentes gigantes.

---

# 23. Framework de React

## Decisión

Usaremos **Next.js + TypeScript**.

Motivos:

- Ya existe experiencia previa con Next.js.
- Proporciona routing y estructura de aplicación.
- Facilita la organización de una aplicación grande.
- Permite mantener una arquitectura clara alrededor de React.
- Phaser se integrará como una parte cliente de la aplicación.

No utilizar React sin framework para este proyecto.

# 24. Principios de desarrollo

1. No implementar funcionalidades futuras antes de necesitarlas.
2. Mantener React y Phaser separados conceptualmente.
3. Utilizar TypeScript.
4. Usar componentes reutilizables.
5. Mantener todos los textos visibles en español.
6. Usar datos mock antes de conectar el backend.
7. No acoplar la lógica del juego a los assets gráficos.
8. No crear sistemas complejos sin necesidad.
9. Priorizar una interfaz funcional sobre efectos visuales.
10. Cada etapa debe dejar la aplicación ejecutable.

---

# 25. Diseño visual medieval y uso de Context7

Todo el juego tendrá una estética **medieval**.

No se requiere encontrar una librería React que ya tenga una estética medieval completa. La interfaz se construirá sobre componentes estándar y se personalizará visualmente mediante un sistema propio de estilos.

La IA debe ayudar activamente con las decisiones de diseño visual y UX, especialmente en:

- distribución de paneles;
- jerarquía visual;
- tipografía;
- paleta de colores;
- bordes, marcos y texturas;
- botones;
- paneles;
- estados de interacción;
- iconografía;
- consistencia entre pantallas.

### Context7

Cuando se necesite documentación actualizada de Next.js, React, Phaser, Zustand, Drizzle, Express, Tailwind u otra librería/framework, utilizar el MCP de **Context7** disponible en el entorno de desarrollo.

La IA debe consultar documentación oficial/versionada mediante Context7 antes de asumir APIs, configuraciones o patrones que puedan haber cambiado. Context7 está diseñado precisamente para proporcionar documentación y ejemplos actualizados de las librerías al agente.

Regla de trabajo:

> Si una tarea depende de una API, configuración o patrón específico de una librería, consultar Context7 antes de implementarla.

# 26. Lore y concepto del juego

## Nombre provisional

**El Juego de los Dioses**

## Ambientación

El juego será de **fantasía medieval**.

Cada jugador representa a un **dios menor** que ha sido llamado a guiar una civilización durante una gran guerra para demostrar cuál civilización merece ser proclamada como la mejor.

El jugador no controla directamente cada unidad. Su papel es el de una entidad superior que dirige:

- ciudades;
- economía;
- construcciones;
- investigación;
- ejército;
- expansión territorial;
- diplomacia;
- estrategia militar.

Este concepto debe influir principalmente en la narrativa, presentación y ambientación, sin obligar a que toda la interfaz tenga una apariencia fantástica excesivamente recargada.

## Separación entre UI y mundo del juego

La interfaz administrativa debe mantenerse desacoplada de la representación visual del mundo.

Ejemplo:

```text
UI React
    ↓
Datos y acciones del juego
    ↓
Estado del juego
    ↓
Representación Phaser
```

Esto permitirá cambiar posteriormente el estilo visual de la ciudad, el mapa o los edificios sin tener que rediseñar la lógica de administración.

La interfaz puede ser funcional, clara y medieval en su presentación, mientras que el mundo del juego puede evolucionar hacia una representación visual más elaborada.

---

# 27. Jugadores controlados por IA

## Objetivo futuro

Cuando el juego base esté terminado, debe existir la posibilidad de incorporar **jugadores controlados por modelos de IA** como participantes adicionales dentro del mismo mundo que los jugadores humanos.

La IA no debe ser un simple bot que ejecute reglas preprogramadas. El objetivo es permitir que un modelo de lenguaje pueda tomar decisiones estratégicas utilizando las mismas acciones disponibles para un jugador humano.

## Principio arquitectónico

La IA debe utilizar una interfaz de acciones del juego, no manipular directamente la base de datos.

```text
Modelo de IA
     ↓
Agente de juego
     ↓
API de acciones permitidas
     ↓
Reglas del juego
     ↓
Estado de la civilización
```

Ejemplos de acciones futuras:

- consultar estado de la ciudad;
- consultar recursos;
- construir edificio;
- investigar tecnología;
- entrenar tropas;
- mover ejército;
- atacar;
- defender;
- enviar mensajes;
- interactuar diplomáticamente.

El servidor seguirá siendo la autoridad y validará todas las acciones exactamente igual que para un jugador humano.

## Proveedores de modelos

Como posible característica futura, se podrá permitir que el propietario de una partida configure claves API de diferentes proveedores de modelos y cree jugadores de IA utilizando esos modelos.

La idea inicial contempla soportar **al menos tres proveedores/modelos diferentes**, pero la arquitectura no debe quedar acoplada a proveedores concretos.

Debe existir una abstracción similar a:

```text
AI Provider
    ↓
AI Agent
    ↓
Game Actions
```

Los secretos/API keys nunca deben estar disponibles para el frontend ni almacenarse sin protección.

## Diseño desde el principio

Aunque esta funcionalidad no se implementará en el MVP, el backend debe mantener una separación suficiente entre:

- jugador humano;
- jugador IA;
- identidad de jugador;
- acciones disponibles;
- estado de la civilización.

No crear todavía el sistema de IA. Solo evitar decisiones arquitectónicas que hagan imposible incorporarlo posteriormente.

## Instrucciones de los agentes

En una etapa posterior se diseñarán instrucciones específicas para los jugadores IA que definan:

- personalidad;
- objetivos;
- prioridades económicas;
- comportamiento militar;
- diplomacia;
- tolerancia al riesgo;
- conocimiento disponible;
- límites de actuación;
- frecuencia de toma de decisiones.

Las instrucciones no deben permitir que el modelo ignore las reglas del servidor.

# 28. Pendientes

## Arquitectura

- [ ] Definir sistema de estilos/UI.
- [ ] Definir estrategia de internacionalización futura.

## Diseño

- [ ] Definir identidad visual concreta.
- [ ] Definir resolución/aspecto objetivo.
- [ ] Definir diseño definitivo de la barra superior.
- [ ] Definir diseño definitivo de la barra lateral.
- [ ] Definir panel inferior de información.
- [ ] Definir estilo isométrico.
- [ ] Definir primer bioma.
- [ ] Definir primer estilo arquitectónico.

## Phaser

- [ ] Crear proyecto Phaser 4.
- [ ] Integrar Phaser 4 con Next.js.
- [ ] Crear primera escena.
- [ ] Crear cámara.
- [ ] Crear zoom.
- [ ] Crear sistema de parcelas.
- [ ] Crear primer edificio.
- [ ] Implementar estados visuales.
- [ ] Implementar selección de edificios.

## Juego

- [ ] Definir reglas de producción.
- [ ] Definir niveles de edificios.
- [ ] Definir sistema de daño.
- [ ] Definir sistema de reparación.
- [ ] Definir sistema de ejército.
- [ ] Definir tres tipos de tropas.
- [ ] Definir reglas de combate.
- [ ] Definir mapa mundial.
- [ ] Definir PvP.
- [ ] Definir alianzas.
- [ ] Definir mensajería.

## Arte

- [ ] Buscar/seleccionar estilo artístico.
- [ ] Conseguir assets provisionales.
- [ ] Crear/seleccionar Ayuntamiento.
- [ ] Crear/seleccionar Mina.
- [ ] Crear/seleccionar Aserradero.
- [ ] Crear/seleccionar Cantera.
- [ ] Crear/seleccionar Cuartel.
- [ ] Crear/seleccionar Granja.
- [ ] Crear estados dañados/destruidos.
- [ ] Definir tres estilos de ciudad.

## IA futura

- [ ] Diseñar arquitectura de agentes IA.
- [ ] Definir interfaz común de acciones para jugadores humanos e IA.
- [ ] Definir estrategia de integración con proveedores de modelos.
- [ ] Definir sistema de instrucciones/personajes para los dioses IA.
