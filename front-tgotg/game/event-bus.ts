import Phaser from 'phaser'

export const EventBus = new Phaser.Events.EventEmitter()

export type CurrentSceneCallback = (scene: Phaser.Scene) => void
