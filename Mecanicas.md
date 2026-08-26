# TGOTG — Reglas y mecánicas del juego

> Documento de referencia del diseño de juego. Sirve como contexto para IA y como lectura para humanos: explica cómo se calculan las cosas y cuáles son los valores base.
> La información de arquitectura y principios de desarrollo está en `AGENTS.md`.
>
> **Convención de fuentes**: cada sección indica su fuente única de verdad (SSOT). Si este documento y el código discrepan, manda el código. Fuentes principales:
>
> - `back-tgotg/config/game_balance.php` — fórmulas y constantes de balance.
> - `back-tgotg/database/seeders/*` — catálogos sembrados en MariaDB (`building_types`, `unit_types`, `biomes`, `regions`, `civilizations`, `blessings`, `game_options`).
> - `back-tgotg/app/Support/*` — lógica compartida (`BuildingCosts`, `BuildingRepair`, `CityLayouts`, `CityState`, `StartingConfig`).

---

## 1. Conceptos fundamentales

- Cada jugador es un **dios menor** que guía una civilización durante una guerra entre dioses.
- Jerarquía: **cuenta** (`users`) → **jugador** (`players`, uno por mundo) → **ciudades** (`cities` → `buildings`).
- El jugador no controla unidades directamente: dirige economía, construcción, investigación, ejército, expansión y diplomacia.
- El mundo es **persistente** durante la partida: tiene duración (días), velocidad y estado (`running` / `finished`).
- Los recursos viven a dos niveles:
  - **Recursos generales** del jugador (`players.gold|wood|stone|iron|food`): bolsa de civilización donde se acumula el excedente diario.
  - **Stock y flujo por ciudad** (`cities.*_per_hour`): cada ciudad produce y consume individualmente.
  - Todo gasto (construir, mejorar, reparar) se descuenta de los **recursos generales**.

## 2. Recursos y economía

Fuente: `config/game_balance.php` (`production`, `gold`, `population`) · `app/Support/CityState.php`.

### 2.1 Producción base por ciudad (por hora, antes de bonos)

| Recurso | Base/h                                  |
| ------- | --------------------------------------- |
| Oro     | 0 (se calcula por impuestos, ver abajo) |
| Madera  | 35                                      |
| Piedra  | 30                                      |
| Hierro  | 15                                      |
| Comida  | 15                                      |

### 2.2 Producción por nivel de edificio productor

Cada nivel del edificio añade su producción al total de la ciudad:

| Edificio       | Recurso | Por nivel |
| -------------- | ------- | --------- |
| Granja         | Comida  | +45/h     |
| Aserradero     | Madera  | +25/h     |
| Mina de piedra | Piedra  | +30/h     |
| Mina de hierro | Hierro  | +10/h     |

Ejemplo: aserradero nivel 2 → madera/h = 35 + 25 × 2 = 85.

### 2.3 Oro (impuestos)

```
oro/h = población × (0,20 + 0,04 × nivel del ayuntamiento)
```

### 2.4 Población

```
consumo de comida/h = población × 0,15
tope de población   = 250 + 250 × nivel del ayuntamiento
crecimiento/h       = 1 % de la brecha restante hasta el tope
```

### 2.5 Bonos multiplicadores

Se aplican sobre la producción (y donde indique cada bono):

| Fuente              | Efecto                                                 | Fuente SSOT                                  |
| ------------------- | ------------------------------------------------------ | -------------------------------------------- |
| Bioma de la ciudad  | +10 % en un recurso concreto (ver §5.2)                | tabla `biomes` / `BiomeSeeder`               |
| Civilización        | Ver tabla en §8.2                                      | tabla `civilizations` / `CivilizationSeeder` |
| Bendición del dios  | +10 % según bendición elegida (ver §8.3)               | tabla `blessings` / `BlessingSeeder`         |
| Velocidad del mundo | Multiplica producción y acorta tiempos de construcción | `worlds.speed_multiplier`                    |

### 2.6 Nueva ciudad

Costo de fundar la 2.ª ciudad (cada ciudad adicional multiplica el costo):

```
base = 40 000 oro · 20 000 madera · 15 000 piedra · 10 000 hierro
coste de la n-ésima ciudad extra = base × growth_factor^(extra−1), growth_factor = 2
tiempo base = 12 h (escalado por velocidad del mundo)
```

## 3. Edificios

Fuentes: tabla `building_types` / `BuildingTypeSeeder` · `app/Support/BuildingCosts.php` · `config/game_balance.php` (`building`).

### 3.1 Catálogo (costos de nivel 1)

| Clave          | Nombre               | Categoría     |   Oro | Madera | Piedra | Hierro | Minutos | Reparación |
| -------------- | -------------------- | ------------- | ----: | -----: | -----: | -----: | ------: | ---------- |
| `ayuntamiento` | Ayuntamiento         | Principal     | 4 000 |    800 |    600 |    200 |     120 | Piedra     |
| `muralla`      | Muralla              | Defensa       | 3 000 |    600 |  1 000 |    150 |      90 | Piedra     |
| `foso`         | Foso                 | Defensa       | 2 500 |    400 |    800 |    100 |      60 | Piedra     |
| `granja`       | Granja               | Recursos      | 1 500 |    600 |    100 |      0 |      45 | Madera     |
| `aserradero`   | Aserradero           | Recursos      | 1 500 |    800 |    100 |     50 |      45 | Madera     |
| `minaPiedra`   | Mina de piedra       | Recursos      | 1 500 |    500 |    300 |    100 |      45 | Piedra     |
| `minaHierro`   | Mina de hierro       | Recursos      | 2 000 |    700 |    300 |    150 |      45 | Hierro     |
| `cuartel`      | Cuartel del ejército | Militar       | 3 000 |    700 |    400 |    300 |      60 | Hierro     |
| `laboratorio`  | Laboratorio          | Investigación | 3 500 |    600 |    500 |    400 |      90 | Hierro     |

### 3.2 Escalado por nivel (nivel máximo: 5)

```
materiales y oro del nivel n = coste base × 1,6^(n−1)   (redondeado a decenas)
tiempo del nivel n           = minutos base × 1,5^(n−1)
```

El backend calcula estos valores (`BuildingCosts::costForLevel()`) y los sirve en `GET /api/building-types` (campo `levels`). El frontend no duplica la fórmula.

### 3.3 Puntos de vida (HP)

```
HP = nivel × 1000
muralla y foso (defensivos): HP = nivel × 1000 × 1,5
```

### 3.4 Reglas vigentes de construcción

- No se puede mejorar un edificio dañado (`damage > 0`); hay que repararlo antes.
- No se puede mejorar mientras está en reparación o con otra mejora en curso.
- El tiempo de mejora se divide por la **velocidad del mundo**.
- Al completarse una mejora, la producción por nivel se suma a la ciudad (`CityState::applyProductionForUpgrade()`).

## 4. Reparaciones

Fuentes: `app/Support/BuildingRepair.php` · `config/game_balance.php` (`repair`).

Tras un asedio, los edificios sufren `% de daño`. Los puntos a reparar se calculan contra el HP total:

```
puntos = ceil(damage % × HP del edificio / 100)
```

| Modo       | Costo                        | Velocidad             |
| ---------- | ---------------------------- | --------------------- |
| Pagada     | 3 oro + 1 material por punto | 10 % del HP por hora  |
| Automática | Gratis                       | 1,5 % del HP por hora |

- El material depende del edificio (columna `repair_material`, ver §3.1).
- Un edificio con `damage ≥ 30` se muestra destruido (sprite `*Destruido.png`) hasta repararse.

## 5. Mapa mundial y ciudad isométrica

### 5.1 Regiones

Fuente: tabla `regions` / `RegionSeeder`.

- 6 regiones (`region1`…`region6`, etiquetas «Región 1»…«Región 6»).
- Cada región define un **polígono** (coordenadas en espacio 2048×1024 sobre el arte del mapa) y un `sort_order` que fija su orden estable en la API y la UI.
- Cada región concede acceso a 3 biomas:

| Región   | Biomas disponibles            |
| -------- | ----------------------------- |
| Región 1 | Bosque, Colina rica, Costa    |
| Región 2 | Pradera, Bosque, Colina rica  |
| Región 3 | Montaña, Bosque, Costa        |
| Región 4 | Montaña, Colina rica, Pradera |
| Región 5 | Bosque, Pradera, Colina rica  |
| Región 6 | Pradera, Montaña, Costa       |

### 5.2 Biomas

Fuente: tabla `biomes` / `BiomeSeeder`.

| Clave        | Nombre      | Bono de producción |
| ------------ | ----------- | ------------------ |
| `pradera`    | Pradera     | +10 % comida       |
| `bosque`     | Bosque      | +10 % madera       |
| `montaña`    | Montaña     | +10 % piedra       |
| `colinaRica` | Colina rica | +10 % hierro       |
| `costa`      | Costa       | +10 % oro          |

### 5.3 Ciudad isométrica

Fuente: `app/Support/CityLayouts.php` (SSOT único de coordenadas).

- Mundo interior de 2048×1024 px; parcelas predefinidas por edificio (`key`, x, y, forma, ancho, alto).
- Las coordenadas **no** se guardan en la tabla `buildings`: el backend las resuelve contra `CityLayouts` y las inyecta en `GET /api/city`.
- Para mover un edificio o añadir mapas solo se edita `CityLayouts::plots()`; el front lo refleja sin cambios.

## 6. Combate _(diseñado — pendiente de implementar)_

Fuente: `config/game_balance.php` (`combat`, `damage`, `protection`). Valores aprobados, sistema aún no desarrollado (ver §10).

- Variación aleatoria de ataque y defensa: **±10 %** (suerte).
- Defensa base de toda ciudad: **10**.

```
defensa de la ciudad = 10 + 90 × nivel de muralla + 40 × nivel de foso
penalización al atacante por nivel de foso del defensor = −4 % por nivel
saqueo al ganar = 40 % de cada recurso
escudo tras perder una batalla defensiva = 12 h (× velocidad del mundo)
```

Daños al perder la defensa `[base, por punto de exceso]`:

| Elemento                         | Fórmula de daño                       |
| -------------------------------- | ------------------------------------- |
| Muralla                          | 20 % base + 0,5 % por punto de exceso |
| Foso                             | 15 % base + 0,4 % por punto de exceso |
| Daño colateral (otros edificios) | 5 % base + 0,2 % por punto, tope 60 % |

## 7. Unidades _(catálogo sembrado — sistema pendiente de implementar)_

Fuentes: tabla `unit_types` / `UnitTypeSeeder`. El entrenamiento requiere el nivel de cuartel indicado.

| Unidad     | Tier | Ataque | Defensa |   Oro | Comida | Hierro | Upkeep comida/h | Entrenamiento | Cuartel |
| ---------- | ---: | -----: | ------: | ----: | -----: | -----: | --------------: | ------------: | ------: |
| Miliciano  |    1 |     25 |      25 |    50 |     20 |     10 |             0,2 |         5 min |   Nvl 1 |
| Espadachín |    2 |     50 |      55 |   120 |     35 |     25 |             0,4 |        10 min |   Nvl 2 |
| Arquero    |    3 |     85 |      95 |   260 |     60 |     55 |             0,7 |        20 min |   Nvl 3 |
| Caballero  |    4 |    180 |     130 |   550 |    110 |    120 |             1,2 |        40 min |   Nvl 4 |
| Campeón    |    5 |    380 |     300 | 1 100 |    200 |    260 |             2,0 |        80 min |   Nvl 5 |

Regla definida: las tropas estacionadas en la ciudad **no consumen comida**; la **población** sí (§2.4).

Poder defensivo de una ciudad (referencia usada hoy en la UI):

```
poder defensivo = defensa de la ciudad + tropas estacionadas × 25 (ataque del miliciano T1)
```

## 8. Civilizaciones, bendiciones y opciones de mundo

### 8.1 Opciones de mundo

Fuente: tabla `game_options` / `GameOptionSeeder`.

- Duraciones: Rápida (7 días) · Normal (30 días) · Épica (90 días).
- Multiplicadores: 1x · 2x · 3x (producción y tiempos).

### 8.2 Civilizaciones

Fuente: tabla `civilizations` / `CivilizationSeeder`. El bono mecánico vive en el campo JSON `bonus`.

| Civilización | Beneficio                            | Bonus                                                       |
| ------------ | ------------------------------------ | ----------------------------------------------------------- |
| Humanos      | +5 % a todos los recursos            | `production_bonus` 5 % en todo                              |
| Elfos        | +15 % comida y madera                | `production_bonus` comida/madera 15 %                       |
| Orcos        | +15 % poder de ataque                | `attack_bonus` 15 %                                         |
| Enanos       | +10 % piedra y hierro, +10 % defensa | `production_bonus` piedra/hierro 10 %, `defense_bonus` 10 % |

### 8.3 Bendiciones

Fuente: tabla `blessings` / `BlessingSeeder`. Se eligen al crear la partida y pueden cambiarse.

| Bendición          | Beneficio                     |
| ------------------ | ----------------------------- |
| Cosecha abundante  | +10 % producción de comida    |
| Forja implacable   | +10 % madera, piedra y hierro |
| Hijos de la guerra | +10 % poder de ataque         |
| Muralla eterna     | +10 % defensa de las ciudades |

## 9. Ciclo de partida

### 9.1 Ciudad inicial

Fuente: `app/Support/StartingConfig.php` (todos los valores se derivan de `config('game_balance')`).

Edificios iniciales: ayuntamiento Nvl 3, granja Nvl 2, aserradero Nvl 2, mina de piedra Nvl 1, mina de hierro Nvl 2, muralla Nvl 2, foso Nvl 1. Población inicial 340, felicidad 72, tropas estacionadas 124.

| Valor inicial                                           |                               Cantidad |
| ------------------------------------------------------- | -------------------------------------: |
| Oro / Madera / Piedra / Hierro / Comida (stock general) | 12 450 / 8 300 / 6 200 / 4 100 / 9 700 |
| Oro/h · Madera/h · Piedra/h · Hierro/h · Comida/h       |               109 · 85 · 60 · 35 · 105 |
| Consumo de comida/h                                     |                                     51 |
| Defensa                                                 |                                    230 |
| Poder defensivo                                         |                                  3 330 |

### 9.2 Reparto diario

- Cuando pasa el día, cada ciudad calcula la **diferencia (producción − consumo)** por recurso.
- El **excedente** de todas las ciudades se suma a los **recursos generales** del jugador.
- Si el jugador pierde una ciudad antes del reparto, pierde el excedente pendiente de esa ciudad.

### 9.3 Fin de partida

- El mundo pasa a estado `finished` y se paraliza (no acepta más movimientos).
- Se genera un **reporte** (ganador, rankings, totales…) guardado en `world_reports`.

### 9.4 Reinicio de partida

- Se vacían las tablas de juego: mundo, jugadores, ciudades, edificios, conversaciones y mensajes.
- Se conservan: cuentas (`users`), estadísticas (`user_statistics`), reportes históricos (`world_reports`) y catálogos estáticos (`building_types`, `blessings`, `civilizations`, …).

### 9.5 Estadísticas persistentes por cuenta

- Sobreviven a los reinicios: **partidas jugadas**, **bendición más usada**, **civilización más jugada**.

---

## 10. Pendientes por hacer

### Ejército y combate

- [ ] Sistema de ejército completo (el catálogo de unidades ya está sembrado, ver §7).
- [ ] Implementar las reglas de combate automáticas con las fórmulas definidas en §6.
- [ ] Combate por rounds con registro de acciones y resumen final (daños, ganancias, tropas perdidas).
- [ ] Cada ciudad produce tropas; por defecto quedan en guardia de la ciudad.
- [ ] El jugador decide qué tropas mover al ejército; las del ejército no defienden la ciudad salvo que estén ubicadas en ella.
- [ ] Botón de disolver ejército y elegir ciudad destino de las tropas.
- [ ] Ataque desde el mapa: seleccionar región y ver sus ciudades con mensajes («Defensa débil», «Defensa considerable», «Fuerzas superiores detectadas»).
- [ ] Al atacar, avisar de un ejército adicional sin dar detalles.
- [ ] Con 1 sola ciudad no se pierde nunca; con 2+, una ciudad atacada puede pasar al atacante (definir fórmula de probabilidad).
- [ ] El atacante recibe la ciudad con los destrozos del ataque (definir probabilidad de destrozos).
- [ ] El tipo de unidades debe relacionarse con las civilizaciones (humanos solo unidades humanas, etc.).

### Economía y reglas de juego

- [ ] Implementar el reparto diario de excedente ligado al paso del día (§9.2).
- [ ] El ayuntamiento determina el nivel máximo del resto de construcciones (ej. ayuntamiento 5 → construcciones 5).
- [ ] Sistema de turnos/acciones: número fijo por paso del día, acumulables.
- [ ] Comercio de recursos con el propio sistema (intercambiar unos recursos por otros, tabla de valor de intercambios).
- [ ] Aplicar mecánicamente los bonus de civilización/bendición/bioma en producción y combate si aún no lo están.

### Mapa mundial y PvP

- [ ] No mostrar ciudades con demasiada diferencia de nivel.
- [ ] PvP.
- [ ] Crear alianzas y enviar recursos entre jugadores de la misma alianza.

### Partidas

- [ ] Al terminar la partida, resumen de la mejor civilización por estadísticas.
- [ ] Antes de comenzar otra partida, borrar todos los datos (inicio limpio).

### Ciudad y presentación

- [ ] Variantes visuales por bioma/estilo si se añaden nuevos mapas.
- [ ] Sustituir iconos provisionales (`lucide-react`) por assets gráficos definitivos.

### IA futura (post-MVP)

- [ ] Diseñar la arquitectura de agentes IA: `AI Provider → AI Agent → Game Actions`.
- [ ] Definir una interfaz común de acciones para jugadores humanos e IA (el servidor siempre valida igual).
- [ ] Estrategia de integración con proveedores de modelos (al menos 3), sin acoplar la arquitectura.
- [ ] Los secretos/API keys nunca deben estar disponibles para el frontend.
- [ ] Definir sistema de instrucciones/personajes de los dioses IA (personalidad, objetivos, prioridades, tolerancia al riesgo, límites).
