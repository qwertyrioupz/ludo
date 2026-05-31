import { useGameStore } from "./useGameStore"
import {
  SafeSpots,
  StarSpots,
  startingPoints,
  turningPoints,
  victoryStart,
} from "../lib/PlotData"
import { playSound } from "../lib/SoundUtility"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function checkWinningCriteria(pieces: { travelCount: number }[]) {
  return pieces.every((p) => p.travelCount >= 57)
}

export async function handleForward(playerNo: number, id: string, pos: number) {
  const store = useGameStore.getState()
  const {
    currentPositions,
    diceNo,
    disableTouch,
    updatePlayerPieceValue,
    updatePlayerChance,
    unfreezeDice,
    updateFireworks,
    announceWinner,
  } = store


  const alpha =
    playerNo === 1 ? "A" : playerNo === 2 ? "B" : playerNo === 3 ? "C" : "D"
  const playerKey = `player${playerNo}` as
    | "player1"
    | "player2"
    | "player3"
    | "player4"

  const piecesAtPosition = currentPositions.filter((item) => item.pos === pos)
  const pieceRef = piecesAtPosition.find((item) => item.id[0] === alpha)

  if (!pieceRef) return

  disableTouch()

  let finalPath = pos
  let travelCount =
    useGameStore.getState()[playerKey].find((p) => p.id === id)?.travelCount ??
    0

  for (let i = 0; i < diceNo; i++) {
    const state = useGameStore.getState()
    const playerPiece = state[playerKey].find((p) => p.id === id)
    if (!playerPiece) continue

    let path = playerPiece.pos + 1

    if (turningPoints.includes(path) && turningPoints[playerNo - 1] === path) {
      path = victoryStart[playerNo - 1]
    }

    if (path === 53) path = 1

    finalPath = path
    travelCount += 1

    updatePlayerPieceValue({
      playerNo: playerKey,
      pieceId: id,
      pos: path,
      travelCount,
    })
    playSound("pile_move")
    await delay(200)
  }

  const updatedState = useGameStore.getState()
  const updatedPositions = updatedState.currentPositions
  const finalPlot = updatedPositions.filter((item) => item.pos === finalPath)
  const ids = finalPlot.map((item) => item.id[0])
  const uniqueIds = new Set(ids)
  const areDifferentIds = uniqueIds.size > 1

  if (SafeSpots.includes(finalPath) || StarSpots.includes(finalPath)) {
    playSound("safe_spot")
  }

  if (
    areDifferentIds &&
    !SafeSpots.includes(finalPath) &&
    !StarSpots.includes(finalPath)
  ) {
    const enemyPiece = finalPlot.find((p) => p.id[0] !== id[0])
    if (!enemyPiece) return

    const enemyId = enemyPiece.id[0]
    const no =
      enemyId === "A" ? 1 : enemyId === "B" ? 2 : enemyId === "C" ? 3 : 4
    const enemyKey = `player${no}` as
      | "player1"
      | "player2"
      | "player3"
      | "player4"
    const backwardPath = startingPoints[no - 1]

    const enemyFullPiece = useGameStore
      .getState()
      [enemyKey].find((p) => p.id === enemyPiece.id)
    let i = enemyFullPiece?.pos ?? enemyPiece.pos
    playSound("collide")

    while (i !== backwardPath) {
      updatePlayerPieceValue({
        playerNo: enemyKey,
        pieceId: enemyPiece.id,
        pos: i,
        travelCount: 0,
      })
      await delay(150)
      i--
      if (i === 0) i = 52
    }

    updatePlayerPieceValue({
      playerNo: enemyKey,
      pieceId: enemyPiece.id,
      pos: 0,
      travelCount: 0,
    })
    unfreezeDice()
    return
  }

  if (diceNo === 6 || travelCount === 57) {
    updatePlayerChance(playerNo)

    if (travelCount === 57) {
      playSound("home_win")
      const allPieces = useGameStore.getState()[playerKey]

      if (checkWinningCriteria(allPieces)) {
        announceWinner(playerNo)
        playSound("cheer", true)
        return
      }

      updateFireworks(true)
      unfreezeDice()
      return
    }
  } else {
    let chancePlayer = playerNo + 1
    if (chancePlayer > 4) chancePlayer = 1
    updatePlayerChance(chancePlayer)
  }
}
