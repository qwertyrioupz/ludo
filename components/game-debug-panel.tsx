"use client"

import { useGameStore } from "@/store/useGameStore"

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
      return "Unknown"
  }
}

const GameDebugPanel = () => {
  const humanPlayerNo = useGameStore((s) => s.humanPlayerNo)
  const chancePlayer = useGameStore((s) => s.chancePlayer)
  const gameBalance = useGameStore((s) => s.gameBalance)

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-2 left-1/2 -translate-x-1/2 z-[999999] rounded-md bg-black/80 p-3 text-xs text-white shadow-xl">
      <div className="font-bold text-yellow-300">DEV DEBUG</div>

      <div>Human: {getPlayerName(humanPlayerNo)}</div>
      <div>Turn: {getPlayerName(chancePlayer)}</div>

      <div className="mt-2">
        Mode:{" "}
        <span className={gameBalance.userWinChanceGame ? "text-green-300" : "text-red-300"}>
          {gameBalance.userWinChanceGame ? "FAIR / WIN CHANCE" : "HARD / USER LOSE"}
        </span>
      </div>

      <div>Bot move: {Math.round(gameBalance.botSmartMoveChance * 100)}%</div>
      <div>Bot dice: {Math.round(gameBalance.botSmartDiceChance * 100)}%</div>
      <div>Timeout bad: {Math.round(gameBalance.humanTimeoutBadMoveChance * 100)}%</div>
    </div>
  )
}

export default GameDebugPanel