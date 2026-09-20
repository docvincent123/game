import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { FrontlineScene } from './FrontlineScene'

export function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hostRef.current) return

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      backgroundColor: '#07100d',
      width: 1600,
      height: 900,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: true,
        pixelArt: false,
      },
      scene: [FrontlineScene],
    })

    return () => game.destroy(true)
  }, [])

  return <div ref={hostRef} className="game-canvas" />
}