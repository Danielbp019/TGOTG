import Phaser from "phaser"
import { CityScene } from "@/game/scenes/city-scene"

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#1e2a1e",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 2048,
    height: 1024,
  },
  scene: [CityScene],
}
