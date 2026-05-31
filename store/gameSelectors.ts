import { useGameStore } from "./useGameStore"

export const selectCurrentPositions = () => useGameStore.getState().currentPositions
export const selectCurrentPlayerChance = () => useGameStore.getState().chancePlayer
export const selectDiceRolled = () => useGameStore.getState().isDiceRolled
export const selectDiceNo = () => useGameStore.getState().diceNo

export const selectPlayer1 = () => useGameStore.getState().player1
export const selectPlayer2 = () => useGameStore.getState().player2
export const selectPlayer3 = () => useGameStore.getState().player3
export const selectPlayer4 = () => useGameStore.getState().player4

export const selectPileSelection = () => useGameStore.getState().pileSelectionPlayer
export const selectCellSelection = () => useGameStore.getState().cellSelectionPlayer
export const selectDiceTouch = () => useGameStore.getState().touchDiceBlock
export const selectFireworks = () => useGameStore.getState().fireworks

export const selectHumanPlayerNo = () => useGameStore.getState().humanPlayerNo
export const selectRollingPlayerNo = () => useGameStore.getState().rollingPlayerNo
export const selectIsBotPlaying = () => useGameStore.getState().isBotPlaying