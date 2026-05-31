// components/Dice.tsx
"use client"

import React, { memo, useEffect, useRef, useState } from "react"
import { useGameStore } from "@/store/useGameStore"

import { playSound } from "@/lib/SoundUtility"
import AnimationPlayer from "@/components/animation"
import diceRollAnimation from "@/public/animation/diceroll.json"
import Image from "next/image"
import { selectCurrentPlayerChance, selectDiceNo, selectDiceRolled } from "@/store/gameSelectors"
import { Colors } from "@/lib/Colors"

interface Piece {
  id: string
  pos: number
  travelCount: number
}

interface DiceProps {
  color: string
  rotate?: boolean
  player: number
  data: Piece[]
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getDiceImage = (diceNo: number): string => `/images/dice/${diceNo}.png`



const getPileImage = (color: string): string => {
  switch (color) {
    case Colors.blue:
      return "/images/piles/blue.png"
    case Colors.red:
      return "/images/piles/red.png"
    case Colors.green:
      return "/images/piles/green.png"
    case Colors.yellow:
      return "/images/piles/yellow.png"
    default:
      return "/images/piles/green.png"
  }
}

const Dice = memo(({ color, rotate, player, data }: DiceProps) => {
  const currentPlayerChance = useGameStore(selectCurrentPlayerChance)
  const isDiceRolled         = useGameStore(selectDiceRolled)
  const diceNo               = useGameStore(selectDiceNo)
  const playerKey            = `player${currentPlayerChance}` as "player1" | "player2" | "player3" | "player4"
  const playerPieces         = useGameStore((s) => s[playerKey])

  const {
    updateDiceNo,
    updatePlayerChance,
    enablePileSelection,
    enableCellSelection,
  } = useGameStore()

  const [diceRolling, setDiceRolling] = useState(false)
  const arrowRef = useRef<HTMLDivElement>(null)
  const animRef  = useRef<number>(null)
  const posRef   = useRef(0)
  const dirRef   = useRef(1)

  // Arrow bounce animation
  useEffect(() => {
    const animate = () => {
      posRef.current += dirRef.current * 0.5
      if (posRef.current > 10 || posRef.current < -10) dirRef.current *= -1
      if (arrowRef.current) {
        arrowRef.current.style.transform = `translateX(${posRef.current}px)`
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [currentPlayerChance, isDiceRolled])

  const handleDicePress = async () => {
    const newDiceNo = Math.floor(Math.random() * 6) + 1
    playSound("dice_roll")
    setDiceRolling(true)
    await delay(800)
    updateDiceNo(newDiceNo)
    setDiceRolling(false)

    const isAnyPieceAlive  = data?.findIndex((i) => i.pos !== 0 && i.pos !== 57)
    const isAnyPieceLocked = data?.findIndex((i) => i.pos === 0)

    if (isAnyPieceAlive === -1) {
      if (newDiceNo === 6) {
        enablePileSelection(player)
      } else {
        let chancePlayer = player + 1
        if (chancePlayer > 4) chancePlayer = 1
        await delay(600)
        updatePlayerChance(chancePlayer)
      }
    } else {
      const canMove = playerPieces.some(
        (pile) => pile.travelCount + newDiceNo <= 57 && pile.pos !== 0
      )

      if (
        (!canMove && newDiceNo === 6 && isAnyPieceLocked === -1) ||
        (!canMove && newDiceNo !== 6 && isAnyPieceLocked !== -1) ||
        (!canMove && newDiceNo !== 6 && isAnyPieceLocked === -1)
      ) {
        let chancePlayer = player + 1
        if (chancePlayer > 4) chancePlayer = 1
        await delay(600)
        updatePlayerChance(chancePlayer)
        return
      }

      if (newDiceNo === 6) enablePileSelection(player)
      enableCellSelection(player)
    }
  }

  const isMyTurn = currentPlayerChance === player

  return (
    <div
      className="relative flex flex-row items-center justify-center"
      style={{ transform: rotate ? "scaleX(-1)" : "scaleX(1)" }}
    >
      {/* Pile icon block */}
      <div className="border-3 border-r-0 border-[#f0ce2c]">
        <div
          className="flex items-center justify-center px-[3px]"
          style={{
            background: "linear-gradient(to right, #0052be, #5f9fcb, #97c6c9)",
            padding: 1,
            borderWidth: 3,
            borderRightWidth: 0,
            borderColor: "#f0ce2c",
          }}
        >
          <Image
            src={getPileImage(color)}
            alt="pile"
            width={35}
            height={35}
          />
        </div>
      </div>

      {/* Dice block */}
      <div
        className="border-3 border-[#f0ce2c] rounded-none"
      >
        <div
          style={{
            background: "linear-gradient(to right, #aac8ab, #aac8ab)",
            borderWidth: 3,
            borderColor: "#f0ce2c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="flex items-center justify-center rounded-none border"
            style={{
              backgroundColor: "#e8c0c1",
              width: 55,
              height: 55,
              padding: 4,
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            {isMyTurn && !diceRolling && (
              <button
                disabled={isDiceRolled}
                onClick={handleDicePress}
                className="flex items-center justify-center disabled:opacity-50"
              >
                <Image
                  src={getDiceImage(diceNo)}
                  alt={`dice-${diceNo}`}
                  width={45}
                  height={45}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Arrow bounce */}
      {isMyTurn && !isDiceRolled && (
        <div ref={arrowRef}>
          <Image src="/images/arrow.png" alt="arrow" width={50} height={30} />
        </div>
      )}

      {/* Dice rolling animation */}
      {isMyTurn && diceRolling && (
        <div className="absolute -top-[25px]" style={{ width: 80, height: 80 }}>
          <AnimationPlayer animationData={diceRollAnimation} loop={false} className="h-full w-full" />
        </div>
      )}
    </div>
  )
})

Dice.displayName = "Dice"
export default Dice