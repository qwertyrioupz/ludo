"use client"

import { useEffect, useRef } from "react"
import { useGameStore } from "@/store/useGameStore"
import { playSound } from "@/lib/SoundUtility"
import { handleForward } from "@/store/gameActions"
import {
  SafeSpots,
  StarSpots,
  startingPoints,
  turningPoints,
  victoryStart,
} from "@/lib/PlotData"

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

const getWorstMovableBoardPiece = (
  pieces: { id: string; pos: number; travelCount: number }[],
  diceNo: number
) => {
  const movableBoardPieces = pieces.filter((piece) => {
    if (piece.pos === 0) return false
    if (piece.travelCount >= 57) return false

    return piece.travelCount + diceNo <= 57
  })

  if (movableBoardPieces.length === 0) return null

  return [...movableBoardPieces].sort(
    (a, b) => a.travelCount - b.travelCount
  )[0]
}

const getLockedPiece = (
  pieces: { id: string; pos: number; travelCount: number }[]
) => {
  return pieces.find((piece) => piece.pos === 0) ?? null
}

const getFinalPosition = (playerNo: number, pos: number, diceNo: number) => {
  let finalPath = pos

  for (let i = 0; i < diceNo; i++) {
    let path = finalPath + 1

    if (turningPoints.includes(path) && turningPoints[playerNo - 1] === path) {
      path = victoryStart[playerNo - 1]
    }

    if (path === 53) path = 1

    finalPath = path
  }

  return finalPath
}

const isSafePosition = (pos: number) => {
  return SafeSpots.includes(pos) || StarSpots.includes(pos)
}

const hasEnemyOnPosition = (
  pos: number,
  humanAlpha: string,
  currentPositions: { id: string; pos: number }[]
) => {
  if (isSafePosition(pos)) return false

  return currentPositions.some(
    (item) => item.pos === pos && item.id[0] !== humanAlpha
  )
}

const getPlayerAlpha = (playerNo: number) => {
  return playerNo === 1
    ? "A"
    : playerNo === 2
      ? "B"
      : playerNo === 3
        ? "C"
        : "D"
}

const getWorstHumanBoardPiece = (
  pieces: { id: string; pos: number; travelCount: number }[],
  diceNo: number,
  playerNo: number,
  currentPositions: { id: string; pos: number }[]
) => {
  const humanAlpha = getPlayerAlpha(playerNo)

  const movableBoardPieces = pieces.filter((piece) => {
    if (piece.pos === 0) return false
    if (piece.travelCount >= 57) return false

    return piece.travelCount + diceNo <= 57
  })

  if (movableBoardPieces.length === 0) return null

  const scoredPieces = movableBoardPieces.map((piece) => {
    const finalPos = getFinalPosition(playerNo, piece.pos, diceNo)

    let badScore = 0

    // Bad for human: weak piece / low progress
    badScore += (57 - piece.travelCount) * 20

    // Good moves should be avoided
    if (piece.travelCount + diceNo === 57) {
      badScore -= 10000
    }

    if (hasEnemyOnPosition(finalPos, humanAlpha, currentPositions)) {
      badScore -= 8000
    }

    if (isSafePosition(finalPos)) {
      badScore -= 4000
    }

    // Small randomness
    badScore += Math.random() * 100

    return {
      piece,
      badScore,
    }
  })

  return scoredPieces.sort((a, b) => b.badScore - a.badScore)[0].piece
}

export const useHumanTimeout = () => {
  const isRunningRef = useRef(false)

  const turnTimeLeft = useGameStore((s) => s.turnTimeLeft)
  const chancePlayer = useGameStore((s) => s.chancePlayer)
  const humanPlayerNo = useGameStore((s) => s.humanPlayerNo)
  const isDiceRolled = useGameStore((s) => s.isDiceRolled)
  const winner = useGameStore((s) => s.winner)
  const isBotPlaying = useGameStore((s) => s.isBotPlaying)

  useEffect(() => {
    if (winner) return
    if (isBotPlaying) return
    if (turnTimeLeft > 0) return
    if (chancePlayer !== humanPlayerNo) return
    if (isRunningRef.current) return

    const runTimeoutAction = async () => {
      isRunningRef.current = true

      try {
        const state = useGameStore.getState()

        if (state.winner) return
        if (state.chancePlayer !== state.humanPlayerNo) return

        const playerNo = state.humanPlayerNo
        const playerKey = getPlayerKey(playerNo)

        /**
         * STEP 1:
         * Human did not roll before countdown ended.
         */
        if (!state.isDiceRolled) {
          const diceNo = rollDice()

          playSound("dice_roll")

          state.setRollingPlayerNo(playerNo)
          await delay(800)

          useGameStore.getState().updateDiceNo(diceNo)
          useGameStore.getState().setRollingPlayerNo(null)

          await delay(400)

          const latestState = useGameStore.getState()
          const latestPieces = latestState[playerKey]

          const lockedPiece = getLockedPiece(latestPieces)
          const worstBoardPiece = getWorstMovableBoardPiece(
            latestPieces,
            diceNo
          )

          const canMoveBoardPiece = !!worstBoardPiece
          const canUnlockPiece = diceNo === 6 && !!lockedPiece

          if (!canMoveBoardPiece && !canUnlockPiece) {
            await delay(600)
            latestState.updatePlayerChance(getNextPlayer(playerNo))
            return
          }

          if (canUnlockPiece) {
            latestState.enablePileSelection(playerNo)
          }

          if (canMoveBoardPiece) {
            latestState.enableCellSelection(playerNo)
          }

          return
        }

        /**
         * STEP 2:
         * Human rolled but did not move before countdown ended.
         */
        const latestState = useGameStore.getState()
        const diceNo = latestState.diceNo
        const pieces = latestState[playerKey]

        const lockedPiece = getLockedPiece(pieces)

        const shouldChooseBadMove =
          Math.random() < latestState.gameBalance.humanTimeoutBadMoveChance

        const worstBoardPiece = shouldChooseBadMove
          ? getWorstHumanBoardPiece(
              pieces,
              diceNo,
              playerNo,
              latestState.currentPositions
            )
          : getWorstMovableBoardPiece(pieces, diceNo)

        // Prefer worst board move first.
        if (worstBoardPiece) {
          await handleForward(playerNo, worstBoardPiece.id, worstBoardPiece.pos)
          return
        }

        // If no board piece can move and dice is 6, unlock one piece.
        if (diceNo === 6 && lockedPiece) {
          latestState.updatePlayerPieceValue({
            playerNo: playerKey,
            pieceId: lockedPiece.id,
            pos: startingPoints[playerNo - 1],
            travelCount: 1,
          })

          latestState.unfreezeDice()
          return
        }

        // No legal move, pass turn.
        await delay(500)
        latestState.updatePlayerChance(getNextPlayer(playerNo))
      } finally {
        useGameStore.getState().setRollingPlayerNo(null)
        isRunningRef.current = false
      }
    }

    runTimeoutAction()
  }, [
    turnTimeLeft,
    chancePlayer,
    humanPlayerNo,
    isDiceRolled,
    winner,
    isBotPlaying,
  ])
}
