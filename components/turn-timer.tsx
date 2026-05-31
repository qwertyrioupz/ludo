"use client"

import { useGameStore } from "@/store/useGameStore"
import { Colors } from "@/lib/Colors"

const getPlayerColor = (playerNo: number) => {
  switch (playerNo) {
    case 1:
      return Colors.blue
    case 2:
      return Colors.red
    case 3:
      return Colors.green
    case 4:
      return Colors.yellow
    default:
      return Colors.blue
  }
}

const getPlayerName = (playerNo: number) => {
  switch (playerNo) {
    case 1:
      return "Blue"
    case 2:
      return "Red"
    case 3:
      return "Green"
    case 4:
      return "Yellow"
    default:
      return "Player"
  }
}

const TurnTimer = () => {
  const turnTimeLeft = useGameStore((s) => s.turnTimeLeft)
  const chancePlayer = useGameStore((s) => s.chancePlayer)
  const humanPlayerNo = useGameStore((s) => s.humanPlayerNo)
  const winner = useGameStore((s) => s.winner)

  if (winner) return null

  const isHumanTurn = chancePlayer === humanPlayerNo
  const playerColor = getPlayerColor(chancePlayer)
  const playerName = getPlayerName(chancePlayer)

  return (
    <div className="pointer-events-none absolute left-1/2 top-2 z-[999999] -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-4 py-2 text-white shadow-2xl backdrop-blur-md">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: playerColor }}
        />

        <span className="text-xs font-bold uppercase tracking-wide">
          {isHumanTurn ? "Your turn" : `${playerName} turn`}
        </span>

        <span
          className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-black ${
            turnTimeLeft <= 5
              ? "bg-red-600 text-white animate-pulse"
              : "bg-white text-black"
          }`}
        >
          {turnTimeLeft}
        </span>
      </div>
    </div>
  )
}

export default TurnTimer