"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { playSound, stopAllSounds } from "@/lib/SoundUtility"
import { useGameStore } from "@/store/useGameStore"
import { useRouter } from "next/navigation"
import {
  selectDiceTouch,
  selectPlayer1,
  selectPlayer2,
  selectPlayer3,
  selectPlayer4,
} from "@/store/gameSelectors"
import AnimationPlayer from "@/components/animation"
import fireworkAnimation from "../../public/animation/firework.json"
import trophyAnimation from "../../public/animation/trophy.json"
import girlAnimation from "../../public/animation/girl.json"
import {
  colorPlayer,
  Plot1Data,
  Plot2Data,
  Plot3Data,
  Plot4Data,
} from "@/lib/PlotData"
import Pile from "@/components/pile"
import Pocket from "@/components/pocket"
import VerticalPath from "@/components/vertical-path"
import HorizontalPath from "@/components/horizontal-path"
import FourTriangles from "@/components/four-triangles"
import Dice from "@/components/dice"
import { Colors } from "@/lib/Colors"
import { LayoutGroup } from "framer-motion"
import { useLocalBots } from "@/hooks/useLocalBots"
import { useTurnCountdown } from "@/hooks/useTurnCountdown"
import TurnTimer from "@/components/turn-timer"
import { useHumanTimeout } from "@/hooks/useHumanTimeout"
import GameDebugPanel from "@/components/game-debug-panel"

const WinDialog = ({ winner }: { winner: number | null }) => {
  const resetGame = useGameStore((s) => s.resetGame)

  
  const router = useRouter()

  const handleNewGame = () => {
    stopAllSounds()
    resetGame()
    playSound("game_start")
  }

  const handleHome = () => {
    stopAllSounds()
    resetGame()
    router.replace("/")
  }

  return (
    <Dialog open={!!winner}>
      <DialogContent className="w-[96%] h-[75%] z-[9999] rounded-2xl border-2 border-yellow-400 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] p-5 [&>button:last-child]:hidden">
        <DialogTitle />
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden rounded-2xl">
          <AnimationPlayer
            animationData={fireworkAnimation}
            className="w-[500px]"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center">
            {winner && <Pile player={winner} color={colorPlayer[winner - 1]} />}
          </div>
          <p className="text-lg font-bold text-white">
            🥳 Congratulations! PLAYER {winner}
          </p>
          <AnimationPlayer
            animationData={trophyAnimation}
            className="h-48 w-48"
          />
          <Button
            onClick={handleNewGame}
            size="lg"
            className="w-full rounded-sm border border-yellow-400 bg-blue-900 text-yellow-400"
          >
            NEW GAME
          </Button>
          <Button
            onClick={handleHome}
            size="lg"
            className="w-full rounded-sm border border-yellow-400 bg-blue-900 text-yellow-400"
          >
            HOME
          </Button>
        </div>
        <div className="pointer-events-none absolute -right-28 -bottom-48 z-20">
          <AnimationPlayer
            animationData={girlAnimation}
            className="max-w-70 scale-x-[-1] -rotate-[20deg]"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Client() {
  useLocalBots()
  useTurnCountdown()
  useHumanTimeout()
  const [isOpen, setIsOpen] = useState(false)
  const [showStartOverlay, setShowStartOverlay] = useState(true)
  const router = useRouter()
  const resetGame = useGameStore((s) => s.resetGame)

  const player1 = useGameStore(selectPlayer1)
  const player2 = useGameStore(selectPlayer2)
  const player3 = useGameStore(selectPlayer3)
  const player4 = useGameStore(selectPlayer4)
  const isDiceTouch = useGameStore(selectDiceTouch)
  const winner = useGameStore((s) => s.winner)

  const handleMenuPress = () => {
    playSound("ui")
    setIsOpen(!isOpen)
  }

  const handleNewGame = () => {
    resetGame()
    playSound("game_start")
    setIsOpen(false)
    setShowStartOverlay(true)
    const timer = setTimeout(() => setShowStartOverlay(false), 2000)
    return () => clearTimeout(timer)
  }

  const handleHome = () => {
    router.replace("/")
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowStartOverlay(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        backgroundImage: "url('/images/bg.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="relative flex flex-col items-center justify-center"
    >

      <GameDebugPanel />

      <TurnTimer />



      {/* Start overlay */}
      {showStartOverlay && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ pointerEvents: "all" }}
        >
          <Image
            alt="start"
            src="/images/start.png"
            width={512}
            height={512}
            className="max-w-96"
            style={{ animation: "blink 0.5s step-start infinite" }}
          />
          <style>{`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Menu button */}
      <Dialog open={isOpen} onOpenChange={handleMenuPress}>
        <DialogTrigger>
          <div
            className="rounded-lg shadow-xl absolute top-2 left-2 w-full h-full"
            style={{
             
              width: "30px",
              height: "30px",
              backgroundImage: "url('/images/menu.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </DialogTrigger>
        <DialogContent className="bg-blue-900 z-[9999] p-10 [&>button:last-child]:hidden w-full h-[90%]">
          <DialogTitle />
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40"
          >
            ✕
          </button>
          <div className="flex min-h-40 flex-col gap-4">
            <Button
              onClick={handleMenuPress}
              size="lg"
              className="rounded-sm border border-yellow-400 bg-blue-900 text-yellow-400"
            >
              RESUME
            </Button>
            <Button
              onClick={handleNewGame}
              size="lg"
              className="rounded-sm border border-yellow-400 bg-blue-900 text-yellow-400"
            >
              NEW GAME
            </Button>
            <Button
              onClick={handleHome}
              size="lg"
              className="rounded-sm border border-yellow-400 bg-blue-900 text-yellow-400"
            >
              HOME
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── MAIN BOARD LAYOUT ─── */}
      <div className="flex w-full flex-col items-center justify-center">
        {/* Top row — Dice for player 2 and 3 */}
        <div
          className="relative z-[9999] flex w-full flex-row items-center justify-between py-2"
          style={{ pointerEvents: isDiceTouch ? "none" : "auto" }}
        >
          <Dice color={Colors.red} player={2} data={player2} />
          <Dice color={Colors.green} player={3} rotate data={player3} />
        </div>

        <LayoutGroup>
          {/* Ludo Board */}
          <div
            className="relative isolate z-0 overflow-visible"
            style={{
              width: "min(100vw, 60dvh)",
              height: "min(100vw, 60dvh)",
            }}
          >
            {/* Top row */}
            <div
              className="flex w-full flex-row overflow-visible"
              style={{ height: "40%" }}
            >
              <Pocket color={Colors.red} player={2} data={player2} />
              <VerticalPath cells={Plot2Data} color={Colors.green} />
              <Pocket color={Colors.green} player={3} data={player3} />
            </div>

            {/* Middle row */}
            <div
              className="flex w-full flex-row overflow-visible"
              style={{ height: "20%" }}
            >
              <HorizontalPath cells={Plot1Data} color={Colors.red} />

              <FourTriangles
                player1={player1}
                player2={player2}
                player3={player3}
                player4={player4}
              />

              <HorizontalPath cells={Plot3Data} color={Colors.yellow} />
            </div>

            {/* Bottom row */}
            <div
              className="flex w-full flex-row overflow-visible"
              style={{ height: "40%" }}
            >
              <Pocket color={Colors.blue} player={1} data={player1} />
              <VerticalPath cells={Plot4Data} color={Colors.blue} />
              <Pocket color={Colors.yellow} player={4} data={player4} />
            </div>
          </div>
        </LayoutGroup>

        {/* Bottom row — Dice for player 1 and 4 */}
        <div
          className="relative z-[9999] flex w-full flex-row items-center justify-between py-2"
          style={{ pointerEvents: isDiceTouch ? "none" : "auto" }}
        >
          <Dice color={Colors.blue} player={1} data={player1} />
          <Dice color={Colors.yellow} rotate player={4} data={player4} />
        </div>
      </div>

      <WinDialog winner={winner} />
    </div>
  )
}
