"use client"

import Lottie from "lottie-react"

interface Props {
  animationData: object
  className?: string
  loop?: boolean
}

export default function AnimationPlayer({ animationData, className, loop = true }: Props) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      className={className}
    />
  )
}