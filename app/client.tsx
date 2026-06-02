"use client"

import AnimationPlayer from "@/components/animation"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"
import { useEffect, useState } from "react"

import { playSound, SoundName, stopAllSounds } from "@/lib/SoundUtility"
import { selectCurrentPositions } from "@/store/gameSelectors"
import { useGameStore } from "@/store/useGameStore"
import { useRouter } from "next/navigation"
import girlAnimation from "../public/animation/witch.json"

const ButtonsBlock = () => {
  const router = useRouter()

  const currentPosition = selectCurrentPositions()
  const resetGame = useGameStore((s) => s.resetGame)

  const startGame = async (isNew = false) => {
    stopAllSounds()
    if (isNew) {
      resetGame()
    }
    router.replace("/game")
    playSound("game_start")
  }

  const handleResumePress = () => startGame()
  const handleNewGamePress = () => startGame(true)

  return (
    <div className="flex min-h-40 flex-col gap-4">
      {currentPosition.length > 0 && (
        <Button
          onClick={handleResumePress}
          size="lg"
          className="rounded-sm border border-3 border-yellow-400 bg-blue-900 text-yellow-400"
        >
          RESUME
        </Button>
      )}
      <Button
        onClick={handleNewGamePress}
        size="lg"
        className="rounded-sm border border-3 border-yellow-400 bg-blue-900 text-yellow-400"
      >
        NEW GAME
      </Button>
      <Button
        onClick={() => alert("Coming Soon! Click New Game")}
        size="lg"
        className="rounded-sm border border-3 border-yellow-400 bg-blue-900 text-yellow-400"
      >
        VS CPU
      </Button>
      <Button
        onClick={() => alert("Coming Soon! Click New Game")}
        size="lg"
        className="rounded-sm border border-3 border-yellow-400 bg-blue-900 text-yellow-400"
      >
        2 VS 2
      </Button>
    </div>
  )
}

export default function Client() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    playSound("home", true)

    return () => {
      stopAllSounds()
    }
  }, [])

  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsLoading(false)
    }

    prepare()
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
      className="relative flex flex-col items-center justify-start gap-16 py-16"
    >
      <Image
        loading="eager"
        src={"/images/logo.png"}
        alt="logo"
        width={512}
        height={512}
        className="animate-scale max-w-48"
      />

      {isLoading ? (
        <div className="min-h-40">
          <Spinner className="h-8 w-8 text-white" />
        </div>
      ) : (
        <ButtonsBlock />
      )}

      <div
        onClick={() => {
          const random = Math.floor(Math.random() * 3) + 1
          playSound(`girl${random}` as SoundName)
        }}
        className="animate-walk"
      >
        <AnimationPlayer
          className="max-w-40 scale-x-[-1] -rotate-20"
          animationData={girlAnimation}
        />
      </div>

      <p className="absolute bottom-4 text-xs text-white">
        made with ❤️ by M.M
      </p>
    </div>
  )
}
