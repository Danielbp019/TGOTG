import Phaser from 'phaser'
import { CityScene } from '@/game/scenes/city-scene'

// WORLD_SIZE es fallback; el valor real viene del backend vía CityLayouts y se
// inyecta en city-data. Para el config inicial de Phaser usamos el fallback
// y CityScene lo re-sincroniza en create() con getWorldSize().
const FALLBACK_WORLD_SIZE = { width: 2048, height: 1024 } as const

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#1e2a1e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: FALLBACK_WORLD_SIZE.width,
    height: FALLBACK_WORLD_SIZE.height,
  },
  scene: [CityScene],
}
