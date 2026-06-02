import { TURN_SECONDS } from "@/lib/consts"
import { GameState } from "./types"

const randomHumanPlayerNo = () => Math.floor(Math.random() * 4) + 1

export const createInitialState = (): GameState => {
  const humanPlayerNo = randomHumanPlayerNo()

  const userWinChanceGame = Math.random() < 0.2

  const gameBalance = userWinChanceGame
    ? {
        userWinChanceGame: true,
        botSmartMoveChance: 0.6,
        botSmartDiceChance: 0.15,
        humanTimeoutBadMoveChance: 0.6,
      }
    : {
        userWinChanceGame: false,
        botSmartMoveChance: 0.85,
        botSmartDiceChance: 0.4,
        humanTimeoutBadMoveChance: 0.95,
      }

  return {
    player1: [
      { id: "A1", pos: 0, travelCount: 0 },
      { id: "A2", pos: 0, travelCount: 0 },
      { id: "A3", pos: 0, travelCount: 0 },
      { id: "A4", pos: 0, travelCount: 0 },
    ],
    player2: [
      { id: "B1", pos: 0, travelCount: 0 },
      { id: "B2", pos: 0, travelCount: 0 },
      { id: "B3", pos: 0, travelCount: 0 },
      { id: "B4", pos: 0, travelCount: 0 },
    ],
    player3: [
      { id: "C1", pos: 0, travelCount: 0 },
      { id: "C2", pos: 0, travelCount: 0 },
      { id: "C3", pos: 0, travelCount: 0 },
      { id: "C4", pos: 0, travelCount: 0 },
    ],
    player4: [
      { id: "D1", pos: 0, travelCount: 0 },
      { id: "D2", pos: 0, travelCount: 0 },
      { id: "D3", pos: 0, travelCount: 0 },
      { id: "D4", pos: 0, travelCount: 0 },
    ],

    // hidden human color
    humanPlayerNo,
    rollingPlayerNo: null,
    isBotPlaying: false,
    turnTimeLeft: TURN_SECONDS,
    gameBalance,

    // blue always starts
    chancePlayer: 1,

    diceNo: 1,
    isDiceRolled: false,
    pileSelectionPlayer: -1,
    cellSelectionPlayer: -1,
    touchDiceBlock: false,
    currentPositions: [],
    fireworks: false,
    winner: null,
  }
}

export const initialState: GameState = createInitialState()
