# El Juego de los Dioses (TGOTG)

### Un juego de estrategia medieval persistente, directamente desde tu navegador.

¿Crees que puedes guiar a una civilización hasta la gloria? En **El Juego de los Dioses** no controlas soldados uno a uno: eres una entidad superior que moldea el destino de todo un pueblo. Construye ciudades, gestiona recursos, investiga tecnologías, forja un ejército y demuestra a los demás dioses por qué tu civilización merece ser la mejor.

---

## El mundo

Estamos en medio de una gran guerra. Los dioses menores de todo el reino han sido llamados a guiar a sus civilizaciones y competir por un único título: ser proclamadas **la mejor civilización**.

No serás un general en el campo de batalla. Serás algo mayor:

- **Diriges ciudades**, no unidades.
- **Decides la economía**: qué construir, qué investigar, qué producir.
- **Planeas la estrategia**: expansión, defensa, diplomacia y guerra.
- **Tu mundo perdura**: un mundo persistente donde cada decisión deja huella.

El destino de tu civilización descansa sobre ti. ¿Responderás a la llamada?

---

## Características

- **Mundo persistente** que evoluciona con cada jugador.
- **Ciudades vivas** con vista isométrica y sistema de parcelas.
- **5 recursos** que gestionar: oro, madera, piedra, hierro y comida.
- **Construcción y mejora** de edificios.
- **Investigación** de tecnologías para desbloquear nuevas posibilidades.
- **Ejército y combates automáticos**: entrena, defiende y ataca.
- **Alianzas, mapa mundial y PvP**: el reino es un tablero compartido.
- **Mensajería** entre dioses para forjar (o romper) pactos.
- **Interfaz medieval** moderna, pensada para ser clara y envolvente.

> En desarrollo activo. Las características se incorporan por etapas y la aplicación queda siempre ejecutable.

---

## Edificios

Cada construcción tiene un propósito dentro de tu civilización:

| Edificio             | Tipo          | Descripción                                                                           |
| -------------------- | ------------- | ------------------------------------------------------------------------------------- |
| Ayuntamiento         | Principal     | El corazón de la ciudad. Gobierna el asentamiento y desbloquea el resto de edificios. |
| Muralla              | Defensa       | Fortifica la ciudad y eleva su defensa frente a los asedios.                          |
| Foso                 | Defensa       | Dificulta los ataques enemigos y debilita a quienes intenten asaltar tus muros.       |
| Mina de hierro       | Recursos      | Extrae hierro, el material imprescindible para entrenar y equipar a tus tropas.       |
| Mina de piedra       | Recursos      | Extrae piedra, clave para las construcciones y las defensas.                          |
| Aserradero           | Recursos      | Produce madera, la base de casi toda construcción.                                    |
| Granja               | Recursos      | Produce comida para alimentar a tu población y sostener a tu ejército.                |
| Cuartel del ejército | Militar       | Entrena y aloja a tus tropas, tu garantía para defender y atacar.                     |
| Laboratorio          | Investigación | El centro de la investigación, donde se desbloquean nuevas tecnologías y mejoras.     |

---

## Coordenadas y mapas — fuente única

Las **coordenadas de los edificios nunca se guardan en la base de datos**. La tabla `buildings` solo persiste `level`, `damage` y estado de reparación; `shape`, `x`, `y`, `width`, `height` y `worldSize` viven **solo en código**:

* **SSOT backend:** `back-tgotg/app/Support/CityLayouts.php` — `WORLD_SIZE` (2048×1024) + `plots(map = 'bosque'): list<{key,level,x,y,shape,width,height}>` y `plotForKey(key, map)`. `StartingConfig::buildings()` es alias `@deprecated` para compatibilidad.
* **API:** `GET /api/city` resuelve cada `Building` contra `CityLayouts::plotForKey()` y devuelve `CityBuilding {id,key,name,category,level,damage,repairing,repairPaid,shape,x,y,width,height}` + `worldSize`. El front **solo lee** — `front-tgotg/game/plots.ts` está deprecado a stub sin datos.
* **Render:** `CityScene` (`front-tgotg/game/scenes/city-scene.ts`) usa `getCityBuildings()` / `getWorldSize()` de `game/city-data.ts` alimentados por `city-provider` tras `fetchCity()`. No define parcelas.

**Para mover un edificio:** edita `CityLayouts::plots()` (un sitio) y el front lo refleja sin tocar DB ni frontend.

**Para añadir un mapa/edificios:** añade un `case 'desierto' => [...]` en `CityLayouts::plots()` y pásale el `map` a `CityLayouts::plots(map)` / `plotForKey(key, map)` y a `WorldController::store` / `DemoWorldSeeder`. No requiere nueva migración. Validaciones `zod` en `front-tgotg/lib/validations/city.ts`.

---

## Tecnología

- **Frontend** (`front-tgotg/`): React + TypeScript, Next.js, Tailwind CSS, shadcn/ui y Phaser 4 para la representación del mundo.
- **Backend** (`back-tgotg/`): Laravel (PHP 8.x), Eloquent ORM, MariaDB y autenticación Sanctum.

---

## Instalación

### Requisitos previos

- **Frontend**: [Node.js](https://nodejs.org) y [pnpm](https://pnpm.io).
- **Backend**: [PHP 8.x](https://www.php.net), [Composer](https://getcomposer.org) y [MariaDB](https://mariadb.org).

### Frontend

```bash
cd front-tgotg
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd back-tgotg
composer install
cp .env.example .env        # configura tus credenciales de base de datos
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

---

Hecho para los dioses y las civilizaciones que los veneran. ¡Que comience la guerra!
