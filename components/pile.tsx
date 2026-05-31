// components/Pile.tsx
"use client"

import { Colors } from "@/lib/Colors"
import {
  selectCellSelection,
  selectDiceNo,
  selectPileSelection,
} from "@/store/gameSelectors"
import { useGameStore } from "@/store/useGameStore"
import Image from "next/image"
import { useCallback, useMemo } from "react"

interface PileProps {
  cell?: boolean
  pieceId?: string
  color: string
  player: number
  onPress?: () => void
}

const Pile = ({ cell, pieceId, color, player, onPress }: PileProps) => {
  const currentPlayerPileSelection = useGameStore(selectPileSelection)
  const currentPlayerCellSelection = useGameStore(selectCellSelection)
  const diceNo = useGameStore(selectDiceNo)

  const playerPieces = useGameStore(
    (s) => s[`player${player}` as keyof typeof s]
  ) as { id: string; travelCount: number }[] | undefined

  const isPileEnabled = player === currentPlayerPileSelection
  const isCellEnabled = player === currentPlayerCellSelection

  const isForwardable = useCallback(() => {
    if (!cell) return true
    if (!pieceId) return false

    const piece = playerPieces?.find((item) => item.id === pieceId)
    return !!piece && piece.travelCount + diceNo <= 57
  }, [cell, pieceId, playerPieces, diceNo])

  const isEnabled = cell ? isCellEnabled && isForwardable() : isPileEnabled

  const pileImage = useMemo(() => {
    switch (color) {
      case Colors.green:
        return "/images/piles/green.png"
      case Colors.red:
        return "/images/piles/red.png"
      case Colors.yellow:
        return "/images/piles/yellow.png"
      case Colors.blue:
        return "/images/piles/blue.png"
      default:
        return "/images/piles/green.png"
    }
  }, [color])

return (
  <button
    type="button"
    disabled={!isEnabled}
    onClick={onPress}
    className="relative flex h-full w-full items-center justify-center overflow-visible disabled:cursor-default"
  >
    <div className="relative flex aspect-square h-[75%] max-h-[34px] min-h-[20px] items-center justify-center overflow-visible">
      {isEnabled && (
        <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-dashed border-gray-600 animate-spin" />
      )}

<Image
  src={pileImage}
  alt={`pile-${color}`}
  width={65}
  height={65}
  className={`relative z-[99999] h-full w-full object-contain ${
    cell
      ? "scale-[1.15] -translate-y-2"
      : "scale-[1.35] -translate-y-[8px]"
  }`}
  draggable={false}
/>
    </div>
  </button>
)
}

export default Pile
