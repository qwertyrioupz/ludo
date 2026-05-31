// components/Cell.tsx
"use client"

import React, { memo, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { ArrowSpot, SafeSpots, StarSpots } from "@/lib/PlotData"
import Pile from "@/components/pile"
import { useGameStore } from "@/store/useGameStore"
import { handleForward } from "@/store/gameActions"
import {
  selectCurrentPlayerChance,
  selectCurrentPositions,
} from "@/store/gameSelectors"
import { Colors } from "@/lib/Colors"

interface CellProps {
  id: number
  color: string
  cell?: boolean
}

interface Piece {
  id: string
  pos: number
}

const getArrowRotation = (id: number): string => {
  if (id === 38) return "rotate-180"
  if (id === 25) return "rotate-90"
  if (id === 51) return "-rotate-90"
  return "rotate-0"
}

const getPlayerNoFromPieceId = (pieceId: string): 1 | 2 | 3 | 4 => {
  if (pieceId[0] === "A") return 1
  if (pieceId[0] === "B") return 2
  if (pieceId[0] === "C") return 3
  return 4
}

const getPieceColor = (pieceId: string): string => {
  const playerNo = getPlayerNoFromPieceId(pieceId)

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

const getPriorityOrder = (currentPlayerChance: number): number[] => {
  const base = [1, 2, 3, 4]
  return [
    currentPlayerChance,
    ...base.filter((playerNo) => playerNo !== currentPlayerChance),
  ]
}

const getVisiblePieces = (
  pieces: Piece[],
  currentPlayerChance: number
): Piece[] => {
  if (pieces.length <= 1) return pieces

  const priorityOrder = getPriorityOrder(currentPlayerChance)

  const grouped = new Map<number, Piece[]>()

  for (const playerNo of priorityOrder) {
    grouped.set(playerNo, [])
  }

  for (const piece of pieces) {
    const playerNo = getPlayerNoFromPieceId(piece.id)
    grouped.get(playerNo)?.push(piece)
  }

  const queues = priorityOrder
    .map((playerNo) => [...(grouped.get(playerNo) ?? [])])
    .filter((group) => group.length > 0)

  const selected: Piece[] = []

  // Pass 1: prioritize color variation (one piece per player/color first)
  for (const queue of queues) {
    if (selected.length >= 4) break
    const piece = queue.shift()
    if (piece) selected.push(piece)
  }

  // Pass 2: if still less than 4, fill with remaining pieces
  while (selected.length < 4) {
    let added = false

    for (const queue of queues) {
      if (selected.length >= 4) break
      const piece = queue.shift()
      if (piece) {
        selected.push(piece)
        added = true
      }
    }

    if (!added) break
  }

  return selected
}

const getStackTransform = (count: number, index: number) => {
  if (count <= 1) {
    return { x: 0, y: 0, scale: 1 }
  }

  if (count === 2) {
    const positions = [
      { x: -8, y: 0, scale: 0.84 },
      { x: 8, y: 0, scale: 0.84 },
    ]
    return positions[index]
  }

  if (count === 3) {
    const positions = [
      { x: 0, y: -8, scale: 0.8 },
      { x: -8, y: 8, scale: 0.8 },
      { x: 8, y: 8, scale: 0.8 },
    ]
    return positions[index]
  }

  const positions = [
    { x: -8, y: -8, scale: 0.76 },
    { x: 8, y: -8, scale: 0.76 },
    { x: -8, y: 8, scale: 0.76 },
    { x: 8, y: 8, scale: 0.76 },
  ]

  return positions[index] ?? { x: 0, y: 0, scale: 0.76 }
}

const Cell = memo(({ id, color }: CellProps) => {
  const plottedPieces = useGameStore(selectCurrentPositions)
  const currentPlayerChance = useGameStore(selectCurrentPlayerChance)

  const isSafeSpot = useMemo(() => SafeSpots.includes(id), [id])
  const isStarSpot = useMemo(() => StarSpots.includes(id), [id])
  const isArrowSpot = useMemo(() => ArrowSpot.includes(id), [id])

  const piecesAtPosition = useMemo(
    () => plottedPieces.filter((item) => item.pos === id),
    [plottedPieces, id]
  )

  const visiblePieces = useMemo(
    () => getVisiblePieces(piecesAtPosition, currentPlayerChance),
    [piecesAtPosition, currentPlayerChance]
  )

  const handlePress = useCallback(
    (playerNo: number, pieceId: string) => {
      handleForward(playerNo, pieceId, id)
    },
    [id]
  )

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-visible"
      style={{
        backgroundColor: isSafeSpot ? color : "white",
        borderWidth: 0.4,
        borderColor: Colors.borderColor,
        borderStyle: "solid",
      }}
    >
      {/* Star background */}
      {isStarSpot && (
        <span className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center text-[22px] text-black/20">
          ★
        </span>
      )}

      {/* Arrow background */}
      {isArrowSpot && (
        <span
          className={`pointer-events-none absolute inset-0 z-0 flex items-center justify-center text-[20px] text-black/35 ${getArrowRotation(
            id
          )}`}
        >
          ➤
        </span>
      )}

      {/* Visible stacked pieces */}
      {visiblePieces.map((piece, index) => {
        const playerNo = getPlayerNoFromPieceId(piece.id)
        const pieceColor = getPieceColor(piece.id)
        const isActivePlayerPile = currentPlayerChance === playerNo
        const { x, y, scale } = getStackTransform(visiblePieces.length, index)

        return (
          <motion.div
            key={piece.id}
            layoutId={`pile-${piece.id}`}
            className="pointer-events-auto absolute inset-0 flex items-center justify-center overflow-visible"
            style={{
              zIndex: isActivePlayerPile ? 999999 : 100 + index,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
              mass: 0.8,
            }}
          >
            <div
              className="flex h-full w-full items-center justify-center overflow-visible"
              style={{
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
              }}
            >
              <Pile
                cell={true}
                player={playerNo}
                onPress={() => handlePress(playerNo, piece.id)}
                pieceId={piece.id}
                color={pieceColor}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
})

Cell.displayName = "Cell"

export default Cell