// components/Pocket.tsx
"use client"

import React, { memo } from "react"
import { useGameStore } from "@/store/useGameStore"
import { startingPoints } from "@/lib/PlotData"
import Pile from "@/components/pile"
import { Colors } from "@/lib/Colors"
import { motion } from "framer-motion"

interface PieceData {
  id: string
  pos: number
  travelCount: number
}

interface PlotProps {
  pieceNo: number
  player: number
  color: string
  data: PieceData[]
  handlePress: (value: PieceData) => void
}

interface PocketProps {
  color: string
  player: number
  data: PieceData[]
}

const Plot = ({ pieceNo, player, color, data, handlePress }: PlotProps) => {
  return (
    <div
      className="flex h-[80%] w-[36%] items-center justify-center rounded-full"
      style={{
        backgroundColor: color,
        borderColor: Colors.borderColor,
        borderWidth: 0.4,
      }}
    >
      {data && data[pieceNo]?.pos === 0 && (
        <motion.div
          layoutId={`pile-${data[pieceNo].id}`}
          className="relative z-[99999] flex h-full w-full items-center justify-center overflow-visible"
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 24,
            mass: 0.8,
          }}
        >
          <Pile
            player={player}
            color={color}
            onPress={() => handlePress(data[pieceNo])}
          />
        </motion.div>
      )}
    </div>
  )
}

const Pocket = memo(({ color, player, data }: PocketProps) => {
  const { updatePlayerPieceValue, unfreezeDice } = useGameStore()

  const handlePress = (value: PieceData) => {
    const playerNo = value?.id?.slice(0, 1)
    let playerKey: "player1" | "player2" | "player3" | "player4"

    switch (playerNo) {
      case "A":
        playerKey = "player1"
        break
      case "B":
        playerKey = "player2"
        break
      case "C":
        playerKey = "player3"
        break
      default:
        playerKey = "player4"
        break
    }

    const playerIndex = parseInt(playerKey.match(/\d+/)![0], 10) - 1

    updatePlayerPieceValue({
      playerNo: playerKey,
      pieceId: value.id,
      pos: startingPoints[playerIndex],
      travelCount: 1,
    })

    unfreezeDice()
  }

  return (
    <div
      className="flex h-full w-[40%] items-center justify-center"
      style={{
        backgroundColor: color,
        borderColor: Colors.borderColor,
        borderWidth: 0.4,
      }}
    >
      {/* Inner white frame */}
      <div
        className="flex h-[70%] w-[70%] flex-col justify-between p-[15px]"
        style={{
          backgroundColor: "white",
          borderColor: Colors.borderColor,
          borderWidth: 0.4,
        }}
      >
        {/* Top row */}
        <div className="flex h-[40%] w-full flex-row items-center justify-between">
          <Plot
            pieceNo={0}
            player={player}
            color={color}
            data={data}
            handlePress={handlePress}
          />
          <Plot
            pieceNo={1}
            player={player}
            color={color}
            data={data}
            handlePress={handlePress}
          />
        </div>

        {/* Bottom row */}
        <div className="flex h-[40%] w-full flex-row items-center justify-between">
          <Plot
            pieceNo={2}
            player={player}
            color={color}
            data={data}
            handlePress={handlePress}
          />
          <Plot
            pieceNo={3}
            player={player}
            color={color}
            data={data}
            handlePress={handlePress}
          />
        </div>
      </div>
    </div>
  )
})

Pocket.displayName = "Pocket"
export default Pocket
