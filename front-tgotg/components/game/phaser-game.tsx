'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import Phaser from 'phaser'
import { gameConfig } from '@/game/main'
import { EventBus } from '@/game/event-bus'
import { setCityBuildings } from '@/game/city-data'
import type { CityBuilding } from '@/lib/api'

export interface IRefPhaserGame {
  game: Phaser.Game | null
  scene: Phaser.Scene | null
}

interface PhaserGameProps {
  currentActiveScene?: (scene: Phaser.Scene) => void
  buildings?: CityBuilding[]
}

export const PhaserGame = forwardRef<IRefPhaserGame, PhaserGameProps>(
  function PhaserGame({ currentActiveScene, buildings = [] }, ref) {
    const gameRef = useRef<Phaser.Game | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      get game() {
        return gameRef.current
      },
      get scene() {
        return gameRef.current?.scene.getScene('CityScene') ?? null
      },
    }))

    useEffect(() => {
      setCityBuildings(buildings)
    }, [buildings])

    useEffect(() => {
      if (!containerRef.current) return

      gameRef.current = new Phaser.Game({
        ...gameConfig,
        parent: containerRef.current,
      })

      const handleSceneReady = (scene: Phaser.Scene) => {
        currentActiveScene?.(scene)
      }

      EventBus.on('current-scene-ready', handleSceneReady)

      return () => {
        EventBus.off('current-scene-ready', handleSceneReady)
        try {
          const sound = gameRef.current?.sound as
            | { context?: AudioContext; stopAll?: () => void }
            | undefined
          if (sound?.context?.state !== 'closed') sound?.stopAll?.()
        } catch {}
        gameRef.current?.destroy(true)
        gameRef.current = null
      }
    }, [currentActiveScene])

    return <div ref={containerRef} className="size-full" id="game-container" />
  }
)
