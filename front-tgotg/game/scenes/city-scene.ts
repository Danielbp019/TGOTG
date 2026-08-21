import Phaser from 'phaser'
import { EventBus } from '@/game/event-bus'
import {
  allInteriorAssetPaths,
  buildingAssetPath,
  groundAsset,
} from '@/game/assets'
import { getCityBuildings, getWorldSize } from '@/game/city-data'
import type { PlotShape } from '@/types'

interface CitySlot {
  type: string
  name: string
  level: number
  damage: number
  x: number
  y: number
  shape: PlotShape
  width: number
  height: number
}

function toSlots(
  buildings: ReturnType<typeof getCityBuildings>
): CitySlot[] {
  return buildings.map((building) => ({
    type: building.key,
    name: building.name,
    level: building.level,
    damage: building.damage ?? 0,
    x: building.x,
    y: building.y,
    shape: building.shape,
    width: building.width,
    height: building.height,
  }))
}

export class CityScene extends Phaser.Scene {
  private readonly worldWidth = getWorldSize().width
  private readonly worldHeight = getWorldSize().height
  private readonly maxStars = 5
  private readonly skewY = 0.12
  /** Sprites de 1024×1024 anclados bottom-center */
  private readonly spriteSize = 1024

  private tooltip?: Phaser.GameObjects.Container
  private debugPlots?: Phaser.GameObjects.Graphics
  private showDebugPlots = false

  constructor() {
    super('CityScene')
  }

  preload() {
    this.load.image('ground', groundAsset)

    // Precarga todos los niveles interiores para poder resolver por level/daño en runtime
    for (const path of allInteriorAssetPaths()) {
      if (!this.textures.exists(path)) {
        this.load.image(path, path)
      }
    }
  }

  create() {
    // worldSize viene del backend (CityLayouts::WORLD_SIZE) vía city-provider → city-data
    const ws = getWorldSize()
    ;(this as unknown as { worldWidth: number }).worldWidth = ws.width
    ;(this as unknown as { worldHeight: number }).worldHeight = ws.height
    this.cameras.main.setBackgroundColor('#1e2a1e')

    this.add.image(this.worldWidth / 2, this.worldHeight / 2, 'ground')

    const buildings = getCityBuildings()
    const slots = toSlots(buildings)

    // Orden pintor: menor Y detrás, mayor Y delante — respeta FOSO→MURALLA→interiores
    slots.sort((a, b) => a.y - b.y)

    this.createPlots(slots)
    this.createBuildings(slots)
    this.createTooltip()
    this.setupDebugToggle()

    EventBus.emit('current-scene-ready', this)
  }

  private setupDebugToggle() {
    // Activo si ?debugPlots en URL o env
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const envFlag =
        (import.meta as unknown as { env?: Record<string, string> }).env
          ?.NEXT_PUBLIC_DEBUG_PLOTS === 'true'
      this.showDebugPlots = params.has('debugPlots') || envFlag
      if (this.debugPlots) {
        this.debugPlots.setVisible(this.showDebugPlots)
      }
    }

    this.input.keyboard?.on('keydown-P', () => {
      this.showDebugPlots = !this.showDebugPlots
      this.debugPlots?.setVisible(this.showDebugPlots)
    })
  }

  private createPlots(slots: CitySlot[]) {
    const graphics = this.add.graphics()
    graphics.lineStyle(2, 0x8b7d6b, 0.45)
    this.debugPlots = graphics

    slots.forEach((slot) => {
      const x = slot.x
      const y = slot.y
      const halfW = slot.width / 2
      const halfH = slot.height / 2

      let points: number[][]
      if (slot.shape === 'rect') {
        // Rect defensivo — eje horizontal continuo
        points = [
          [x - halfW, y],
          [x + halfW, y],
          [x + halfW, y - slot.height],
          [x - halfW, y - slot.height],
        ]
      } else {
        // Diamond isométrico — misma huella para P01-P07
        points = [
          [x, y - slot.height],
          [x + halfW, y - halfH],
          [x, y],
          [x - halfW, y - halfH],
        ]
      }

      const sheared = points.map(([px, py]) => this.shearPoint(px, py, x))

      graphics.beginPath()
      sheared.forEach(([px, py], index) => {
        if (index === 0) {
          graphics.moveTo(px, py)
        } else {
          graphics.lineTo(px, py)
        }
      })
      graphics.closePath()
      graphics.strokePath()

      // Marca de centro funcional (ancla bottom-center)
      graphics.fillStyle(0x8b7d6b, 0.9)
      graphics.fillCircle(x, y, 3)
    })

    graphics.setVisible(this.showDebugPlots)
    graphics.setDepth(5)
  }

  /** Aplica un shear vertical: la esquina izquierda sube y la derecha baja (perspectiva isométrica izquierda). */
  private shearPoint(px: number, py: number, cx: number): [number, number] {
    const dx = px - cx
    return [px, py + this.skewY * dx]
  }

  /** Escala para que sprite 1024 quepa en parcela con margen natural (parcelas medidas ~340×185) */
  private buildingScale(slot: CitySlot): number {
    if (slot.shape === 'diamond') {
      const byWidth = (slot.width * 0.88) / this.spriteSize
      const byHeight = (slot.height * 1.65) / this.spriteSize
      return Phaser.Math.Clamp(Math.min(byWidth, byHeight), 0.26, 0.34)
    }
    // Defensivas: rect sheared sin sprite aún; placeholder no escala sprite
    const byWidth = (slot.width * 0.62) / this.spriteSize
    const byHeight = (slot.height * 2.4) / this.spriteSize
    return Phaser.Math.Clamp(Math.min(byWidth, byHeight), 0.2, 0.36)
  }

  private createBuildings(slots: CitySlot[]) {
    slots.forEach((slot) => {
      const x = slot.x
      const y = slot.y
      const assetPath = buildingAssetPath(slot.type, slot.level, slot.damage)
      const hasSprite = !!assetPath && this.textures.exists(assetPath)

      let building: Phaser.GameObjects.Container

      if (hasSprite && assetPath) {
        const scale = this.buildingScale(slot)
        const image = this.add
          .image(0, 0, assetPath)
          .setOrigin(0.5, 1)
          .setScale(scale)

        // Nivel 0 (no construido) más tenue
        if (slot.level === 0) {
          image.setAlpha(0.55)
        }

        building = this.add.container(x, y, [image])
        building.setSize(slot.width, slot.height)
        building.setDepth(y)
      } else {
        // Placeholder defensivo (muralla/foso) o fallback interior sin sprite
        building = this.createDefensivePlaceholder(slot)
        building.setDepth(y)
      }

      building.setData('slot', slot)
      building.setData('hasSprite', hasSprite)
      building.setData('assetPath', assetPath)
      building.setInteractive(
        new Phaser.Geom.Rectangle(
          -slot.width / 2,
          -slot.height,
          slot.width,
          slot.height
        ),
        Phaser.Geom.Rectangle.Contains
      )

      building.on('pointerover', () => this.showBuilding(building))
      building.on('pointerout', () => this.hideBuilding(building))
    })
  }

  private createDefensivePlaceholder(slot: CitySlot): Phaser.GameObjects.Container {
    const isDefensive = slot.type === 'muralla' || slot.type === 'foso'
    const graphics = this.add.graphics()

    if (isDefensive) {
      // Rect defensivo sutil — no llena toda P08/P09 (spec)
      const w = slot.width * 0.62
      const h = slot.height * 0.92
      const halfW = w / 2

      // Puntos con shear, centrados en (0,0) bottom-center
      const points: Array<[number, number]> = [
        [-halfW, 0],
        [halfW, 0],
        [halfW, -h],
        [-halfW, -h],
      ]
      const sheared = points.map(
        ([px, py]) => new Phaser.Math.Vector2(px, py + this.skewY * px)
      )

      graphics.fillStyle(0x3a4a3a, 0.22)
      graphics.fillPoints(sheared, true)
      graphics.lineStyle(2, 0x8b7d6b, 0.32)
      graphics.strokePoints(sheared, true, true)

      // Línea central sutil para lectura de eje defensivo
      graphics.lineStyle(1, 0x8b7d6b, 0.18)
      graphics.beginPath()
      graphics.moveTo(-halfW * 0.9, -h / 2 + this.skewY * (-halfW * 0.9))
      graphics.lineTo(halfW * 0.9, -h / 2 + this.skewY * (halfW * 0.9))
      graphics.strokePath()
    } else {
      // Fallback interior sin sprite — diamond tenue al tamaño de parcela
      const halfW = slot.width / 2
      const halfH = slot.height / 2
      const points: Array<[number, number]> = [
        [0, -slot.height],
        [halfW, -halfH],
        [0, 0],
        [-halfW, -halfH],
      ]
      const sheared = points.map(
        ([px, py]) => new Phaser.Math.Vector2(px, py + this.skewY * px)
      )
      graphics.fillStyle(0x2c3e2c, 0.35)
      graphics.fillPoints(sheared, true)
      graphics.lineStyle(2, 0x8b7d6b, 0.35)
      graphics.strokePoints(sheared, true, true)
    }

    const labelText = isDefensive
      ? `${slot.name}\n(próximamente)`
      : `${slot.name}\nNivel ${slot.level}`
    const label = this.add
      .text(0, -slot.height / 2, labelText, {
        color: '#e8e8e8',
        fontFamily: 'Arial, sans-serif',
        fontSize: isDefensive ? '13px' : '15px',
        align: 'center',
      })
      .setOrigin(0.5)

    const container = this.add.container(slot.x, slot.y, [graphics, label])
    container.setSize(slot.width, slot.height)
    return container
  }

  /** Vértices de un placeholder de w×h con base en y=0, con shear vertical (izquierda arriba, derecha abajo). */
  private placeholderPoints(
    width: number,
    height: number
  ): Phaser.Math.Vector2[] {
    const halfW = width / 2
    const points: Array<[number, number]> = [
      [-halfW, 0],
      [halfW, 0],
      [halfW, -height],
      [-halfW, -height],
    ]
    return points.map(
      ([px, py]) => new Phaser.Math.Vector2(px, py + this.skewY * px)
    )
  }

  private showBuilding(building: Phaser.GameObjects.Container) {
    if (building.getData('hasSprite')) {
      building.setAlpha(0.85)
    }
    const slot = building.getData('slot') as CitySlot
    const hasSprite = building.getData('hasSprite') as boolean
    // Tooltip por encima del sprite escalado, no de la parcela cruda
    const scale = hasSprite ? this.buildingScale(slot) : 1
    const visualHeight = hasSprite ? this.spriteSize * scale * 0.72 : slot.height
    this.showTooltip(slot, building.x, building.y - visualHeight - 28)
  }

  private hideBuilding(building: Phaser.GameObjects.Container) {
    const slot = building.getData('slot') as CitySlot
    if (slot.level === 0 && building.getData('hasSprite')) {
      building.setAlpha(0.55)
    } else {
      building.setAlpha(1)
    }
    this.hideTooltip()
  }

  private createTooltip() {
    this.tooltip = this.add.container(0, 0)
    this.tooltip.setDepth(100)
    this.tooltip.setVisible(false)
  }

  private showTooltip(slot: CitySlot, x: number, y: number) {
    if (!this.tooltip) return

    const stars = '★'.repeat(Math.min(slot.level, this.maxStars))
    const emptyStars = '☆'.repeat(this.maxStars - stars.length)

    const text = this.add
      .text(0, 0, `${slot.name}\nNivel ${slot.level}\n${stars}${emptyStars}`, {
        color: '#f5efe0',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        align: 'center',
      })
      .setOrigin(0.5)

    const padding = 20
    const background = this.add
      .rectangle(
        0,
        0,
        text.width + padding * 2,
        text.height + padding * 2,
        0x1a241a,
        0.92
      )
      .setStrokeStyle(2, 0x8b7d6b)

    this.tooltip.add([background, text])

    const clampedX = Phaser.Math.Clamp(
      x,
      background.width / 2 + 10,
      this.worldWidth - background.width / 2 - 10
    )
    const clampedY = Phaser.Math.Clamp(
      y,
      background.height / 2 + 10,
      this.worldHeight - background.height / 2 - 10
    )

    this.tooltip.setPosition(clampedX, clampedY)
    this.tooltip.setVisible(true)
  }

  private hideTooltip() {
    this.tooltip?.removeAll(true)
    this.tooltip?.setVisible(false)
  }
}
