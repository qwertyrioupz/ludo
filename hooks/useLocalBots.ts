"use client"

import { useEffect, useRef } from "react"
import { useGameStore } from "@/store/useGameStore"
import { handleForward } from "@/store/gameActions"
import { startingPoints } from "@/lib/PlotData"
import { playSound } from "@/lib/SoundUtility"


const randomDelay = (minSeconds = 2, maxSeconds = 15) => {
  const min = minSeconds * 1000
  const max = maxSeconds * 1000

  return Math.floor(Math.random() * (max - min + 1)) + min
}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type PlayerKey = "player1" | "player2" | "player3" | "player4"

const getPlayerKey = (playerNo: number): PlayerKey => {
  return `player${playerNo}` as PlayerKey
}

const getNextPlayer = (playerNo: number) => {
  return playerNo >= 4 ? 1 : playerNo + 1
}

const rollDice = () => {
  return Math.floor(Math.random() * 6) + 1
}

const getMovablePieces = (
  pieces: { id: string; pos: number; travelCount: number }[],
  diceNo: number
) => {
  return pieces.filter((piece) => {
    if (piece.travelCount >= 57) return false

    if (piece.pos === 0) {
      return diceNo === 6
    }

    return piece.travelCount + diceNo <= 57
  })
}

const chooseBotPiece = (
  pieces: { id: string; pos: number; travelCount: number }[],
  diceNo: number
) => {
  const movablePieces = getMovablePieces(pieces, diceNo)

  if (movablePieces.length === 0) return null

  const finishingPiece = movablePieces.find(
    (piece) => piece.pos !== 0 && piece.travelCount + diceNo === 57
  )

  if (finishingPiece) return finishingPiece

  const lockedPiece = movablePieces.find((piece) => piece.pos === 0)

  if (lockedPiece && Math.random() < 0.55) {
    return lockedPiece
  }

  return [...movablePieces].sort((a, b) => b.travelCount - a.travelCount)[0]
}

export const useLocalBots = () => {
  const isRunningRef = useRef(false)

  const chancePlayer = useGameStore((s) => s.chancePlayer)
  const humanPlayerNo = useGameStore((s) => s.humanPlayerNo)
  const winner = useGameStore((s) => s.winner)

  useEffect(() => {
    if (winner) return
    if (chancePlayer === humanPlayerNo) return
    if (isRunningRef.current) return

    let cancelled = false

    const runBots = async () => {
      isRunningRef.current = true
      useGameStore.getState().setBotPlaying(true)

      try {
        while (!cancelled) {
          const state = useGameStore.getState()

          if (state.winner) break
          if (state.chancePlayer === state.humanPlayerNo) break

          const playerNo = state.chancePlayer
          const playerKey = getPlayerKey(playerNo)
          const pieces = state[playerKey]

          await delay(randomDelay(2, 13))
          if (cancelled) break

          const diceNo = rollDice()

          playSound("dice_roll")

          // bot dice animation
          useGameStore.getState().setRollingPlayerNo(playerNo)
          await delay(800)
          if (cancelled) break

          useGameStore.getState().updateDiceNo(diceNo)
          useGameStore.getState().setRollingPlayerNo(null)

          await delay(randomDelay(2, 13))
          if (cancelled) break

          const selectedPiece = chooseBotPiece(pieces, diceNo)

          if (!selectedPiece) {
            useGameStore.getState().updatePlayerChance(getNextPlayer(playerNo))
            await delay(500)
            continue
          }

          if (selectedPiece.pos === 0 && diceNo === 6) {
            useGameStore.getState().updatePlayerPieceValue({
              playerNo: playerKey,
              pieceId: selectedPiece.id,
              pos: startingPoints[playerNo - 1],
              travelCount: 1,
            })

            useGameStore.getState().unfreezeDice()
            await delay(700)
            continue
          }

          await handleForward(playerNo, selectedPiece.id, selectedPiece.pos)

          await delay(600)
        }
      } finally {
        useGameStore.getState().setRollingPlayerNo(null)
        useGameStore.getState().setBotPlaying(false)
        isRunningRef.current = false
      }
    }

    runBots()

    return () => {
      cancelled = true
      useGameStore.getState().setRollingPlayerNo(null)
      useGameStore.getState().setBotPlaying(false)
      isRunningRef.current = false
    }
  }, [chancePlayer, humanPlayerNo, winner])
}