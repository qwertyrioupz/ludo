"use client"

import { useEffect, useRef } from "react"
import { useGameStore } from "@/store/useGameStore"
import { playSound } from "@/lib/SoundUtility"
import { TURN_SECONDS } from "@/lib/consts"



export const useTurnCountdown = () => {
  const chancePlayer = useGameStore((s) => s.chancePlayer)
  const humanPlayerNo = useGameStore((s) => s.humanPlayerNo)
  const isDiceRolled = useGameStore((s) => s.isDiceRolled)
  const winner = useGameStore((s) => s.winner)
  const setTurnTimeLeft = useGameStore((s) => s.setTurnTimeLeft)

  const previousPlayerRef = useRef<number | null>(null)
  const lastDangerSecondRef = useRef<number | null>(null)

  useEffect(() => {
    if (winner) {
      setTurnTimeLeft(0)
      return
    }

    setTurnTimeLeft(TURN_SECONDS)
    lastDangerSecondRef.current = null

    const isNewHumanTurn =
      chancePlayer === humanPlayerNo &&
      previousPlayerRef.current !== chancePlayer &&
      !isDiceRolled

    if (isNewHumanTurn) {
      playSound("safe_spot")
    }

    previousPlayerRef.current = chancePlayer

    const interval = window.setInterval(() => {
      const state = useGameStore.getState()

      if (state.winner) {
        window.clearInterval(interval)
        return
      }

      const nextTime = Math.max(0, state.turnTimeLeft - 1)

      const dangerSeconds = [5, 2]

      if (
        dangerSeconds.includes(nextTime) &&
        lastDangerSecondRef.current !== nextTime
      ) {
        playSound("danger")
        lastDangerSecondRef.current = nextTime
      }

      state.setTurnTimeLeft(nextTime)
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [chancePlayer, humanPlayerNo, isDiceRolled, winner, setTurnTimeLeft])
}
