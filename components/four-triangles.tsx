// components/FourTriangles.tsx
"use client"

import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { useGameStore } from "@/store/useGameStore"
import AnimationPlayer from "@/components/animation"
import fireworkAnimation from "@/public/animation/firework.json"
import Pile from "@/components/pile"
import { selectFireworks } from "@/store/gameSelectors"
import { Colors } from "@/lib/Colors"

interface Piece {
  id: string
  pos: number
  travelCount: number
}

interface PlayerPiecesProps {
  player: Piece[]
  style: React.CSSProperties
  pieceColor: string
  translate: "translateX" | "translateY"
}

interface FourTrianglesProps {
  player1: Piece[]
  player2: Piece[]
  player3: Piece[]
  player4: Piece[]
}

const getPlayerNoFromPieceId = (pieceId: string): number => {
  if (pieceId[0] === "A") return 1
  if (pieceId[0] === "B") return 2
  if (pieceId[0] === "C") return 3
  return 4
}

const PlayerPieces = memo(
  ({ player, style, pieceColor, translate }: PlayerPiecesProps) => {
    return (
      <div
        className="absolute z-[99998] flex h-[34px] w-[34px] items-center justify-center overflow-visible"
        style={style}
      >
        {player.map((piece, index) => (
          <div
            key={piece.id}
            className="absolute flex h-full w-full items-center justify-center overflow-visible"
            style={{
              transform: `scale(0.75) ${translate}(${12 * index}px)`,
            }}
          >
            <Pile
              cell={true}
              player={getPlayerNoFromPieceId(piece.id)}
              onPress={() => {}}
              pieceId={piece.id}
              color={pieceColor}
            />
          </div>
        ))}
      </div>
    )
  }
)

PlayerPieces.displayName = "PlayerPieces"

const FourTriangles = memo(
  ({ player1, player2, player3, player4 }: FourTrianglesProps) => {
    const size = 300
    const isFirework = useGameStore(selectFireworks)
    const [blast, setBlast] = useState(false)
    const updateFireworks = useGameStore((s) => s.updateFireworks)

    useEffect(() => {
      if (!isFirework) return

      setBlast(true)

      const timer = setTimeout(() => {
        setBlast(false)
        updateFireworks(false)
      }, 5000)

      return () => clearTimeout(timer)
    }, [isFirework, updateFireworks])

    const playersData = useMemo(
      () => [
        {
          // player1 = blue = bottom triangle
          player: player1,
          style: {
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
          } as React.CSSProperties,
          pieceColor: Colors.blue,
          translate: "translateX" as const,
        },
        {
          // player2 = red = left triangle
          player: player2,
          style: {
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
          } as React.CSSProperties,
          pieceColor: Colors.red,
          translate: "translateY" as const,
        },
        {
          // player3 = green = top triangle
          player: player3,
          style: {
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
          } as React.CSSProperties,
          pieceColor: Colors.green,
          translate: "translateX" as const,
        },
        {
          // player4 = yellow = right triangle
          player: player4,
          style: {
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
          } as React.CSSProperties,
          pieceColor: Colors.yellow,
          translate: "translateY" as const,
        },
      ],
      [player1, player2, player3, player4]
    )

    const renderPlayerPieces = useCallback(
      (data: (typeof playersData)[0], index: number) => (
        <PlayerPieces
          key={index}
          player={data.player.filter((item) => item.travelCount === 57)}
          style={data.style}
          pieceColor={data.pieceColor}
          translate={data.translate}
        />
      ),
      []
    )

    return (
      <div
        className="relative z-0 flex h-full w-[20%] items-center justify-center overflow-visible bg-white"
        style={{
          borderWidth: 0.8,
          borderColor: Colors.borderColor,
          borderStyle: "solid",
        }}
      >
        {blast && (
          <div className="pointer-events-none absolute inset-0 z-[9999] h-full w-full">
            <AnimationPlayer
              animationData={fireworkAnimation}
              className="h-full w-full"
            />
          </div>
        )}

        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="relative z-0 h-full w-full"
          preserveAspectRatio="none"
        >
          {/* top = player3 = green */}
          <polygon
            points={`0,0 ${size / 2},${size / 2} ${size},0`}
            fill={Colors.green}
          />

          {/* right = player4 = yellow */}
          <polygon
            points={`${size},0 ${size},${size} ${size / 2},${size / 2}`}
            fill={Colors.yellow}
          />

          {/* bottom = player1 = blue */}
          <polygon
            points={`0,${size} ${size / 2},${size / 2} ${size},${size}`}
            fill={Colors.blue}
          />

          {/* left = player2 = red */}
          <polygon
            points={`0,0 ${size / 2},${size / 2} 0,${size}`}
            fill={Colors.red}
          />
        </svg>

        {playersData.map(renderPlayerPieces)}
      </div>
    )
  }
)

FourTriangles.displayName = "FourTriangles"

export default FourTriangles