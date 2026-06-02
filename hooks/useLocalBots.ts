"use client"

import { useEffect, useRef } from "react"
import { useGameStore } from "@/store/useGameStore"
import { handleForward } from "@/store/gameActions"

import {
  SafeSpots,
  StarSpots,
  startingPoints,
  turningPoints,
  victoryStart,
} from "@/lib/PlotData"

import { playSound } from "@/lib/SoundUtility"
import { TURN_SECONDS } from "@/lib/consts"

const randomDelay = (minSeconds = 1, maxSeconds = TURN_SECONDS) => {
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

const getPlayerAlpha = (playerNo: number) => {
  return playerNo === 1
    ? "A"
    : playerNo === 2
      ? "B"
      : playerNo === 3
        ? "C"
        : "D"
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
  botAlpha: string,
  currentPositions: { id: string; pos: number }[]
) => {
  if (isSafePosition(pos)) return false

  return currentPositions.some(
    (item) => item.pos === pos && item.id[0] !== botAlpha
  )
}

const hasHumanOnPosition = (
  pos: number,
  humanAlpha: string,
  currentPositions: { id: string; pos: number }[]
) => {
  if (isSafePosition(pos)) return false

  return currentPositions.some(
    (item) => item.pos === pos && item.id[0] === humanAlpha
  )
}

const chooseBotPiece = (
  pieces: { id: string; pos: number; travelCount: number }[],
  diceNo: number,
  playerNo: number,
  humanPlayerNo: number,
  currentPositions: { id: string; pos: number }[],
  smartMoveChance: number
) => {
  const movablePieces = getMovablePieces(pieces, diceNo)

  if (movablePieces.length === 0) return null

  const botAlpha = getPlayerAlpha(playerNo)
  const humanAlpha = getPlayerAlpha(humanPlayerNo)

  const scoredPieces = movablePieces.map((piece) => {
    const isLocked = piece.pos === 0
    const finalPos = isLocked
      ? startingPoints[playerNo - 1]
      : getFinalPosition(playerNo, piece.pos, diceNo)

    let score = 0

    // 1. Finish
    if (!isLocked && piece.travelCount + diceNo === 57) {
      score += 10000
    }

    // 2. Kill human
    if (hasHumanOnPosition(finalPos, humanAlpha, currentPositions)) {
      score += 8000
    }

    // 3. Kill any enemy
    if (hasEnemyOnPosition(finalPos, botAlpha, currentPositions)) {
      score += 6000
    }

    // 4. Move to safe/star spot
    if (!isLocked && isSafePosition(finalPos)) {
      score += 2500
    }

    // 5. Unlock piece
    if (isLocked && diceNo === 6) {
      score += 1800
    }

    // 6. Prefer piece closer to home
    if (!isLocked) {
      score += piece.travelCount * 20
    }

    // small randomness so bots do not look perfect every time
    score += Math.random() * 200

    return {
      piece,
      score,
    }
  })

  const sortedPieces = scoredPieces.sort((a, b) => b.score - a.score)

  if (Math.random() < smartMoveChance) {
    return sortedPieces[0].piece
  }

  // 20% random legal move so bots do not look perfect
  return movablePieces[Math.floor(Math.random() * movablePieces.length)]
}

const getBestDiceForBot = (
  playerNo: number,
  pieces: { id: string; pos: number; travelCount: number }[],
  humanPlayerNo: number,
  currentPositions: { id: string; pos: number }[]
) => {
  const botAlpha = getPlayerAlpha(playerNo)
  const humanAlpha = getPlayerAlpha(humanPlayerNo)

  const diceScores = [1, 2, 3, 4, 5, 6].map((diceNo) => {
    const movablePieces = getMovablePieces(pieces, diceNo)

    if (movablePieces.length === 0) {
      return {
        diceNo,
        score: 0,
      }
    }

    const bestMoveScore = movablePieces.reduce((bestScore, piece) => {
      const isLocked = piece.pos === 0

      const finalPos = isLocked
        ? startingPoints[playerNo - 1]
        : getFinalPosition(playerNo, piece.pos, diceNo)

      let score = 0

      // Best: finish a piece
      if (!isLocked && piece.travelCount + diceNo === 57) {
        score += 10000
      }

      // Very good: kill human
      if (hasHumanOnPosition(finalPos, humanAlpha, currentPositions)) {
        score += 8500
      }

      // Good: kill any enemy
      if (hasEnemyOnPosition(finalPos, botAlpha, currentPositions)) {
        score += 6500
      }

      // Good: land safe/star
      if (!isLocked && isSafePosition(finalPos)) {
        score += 2500
      }

      // Good: unlock
      if (isLocked && diceNo === 6) {
        score += 2000
      }

      // Prefer advanced pieces
      if (!isLocked) {
        score += piece.travelCount * 20
      }

      return Math.max(bestScore, score)
    }, 0)

    return {
      diceNo,
      score: bestMoveScore + Math.random() * 100,
    }
  })

  const sortedDice = diceScores.sort((a, b) => b.score - a.score)

  if (sortedDice[0].score <= 0) {
    return rollDice()
  }

  return sortedDice[0].diceNo
}

const rollBotDice = (
  playerNo: number,
  pieces: { id: string; pos: number; travelCount: number }[],
  humanPlayerNo: number,
  currentPositions: { id: string; pos: number }[],
  smartDiceChance: number
) => {
  if (Math.random() > smartDiceChance) {
    return rollDice()
  }

  return getBestDiceForBot(playerNo, pieces, humanPlayerNo, currentPositions)
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

          await delay(randomDelay(2, TURN_SECONDS - 2))
          if (cancelled) break

          const diceNo = rollBotDice(
            playerNo,
            pieces,
            state.humanPlayerNo,
            state.currentPositions,
            state.gameBalance.botSmartDiceChance
          )

          playSound("dice_roll")

          // bot dice animation
          useGameStore.getState().setRollingPlayerNo(playerNo)
          await delay(800)
          if (cancelled) break

          useGameStore.getState().updateDiceNo(diceNo)
          useGameStore.getState().setRollingPlayerNo(null)

          await delay(randomDelay(2, TURN_SECONDS - 2))
          if (cancelled) break

          const selectedPiece = chooseBotPiece(
            pieces,
            diceNo,
            playerNo,
            state.humanPlayerNo,
            state.currentPositions,
            state.gameBalance.botSmartMoveChance
          )

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
