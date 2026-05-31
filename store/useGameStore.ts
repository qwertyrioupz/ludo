import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { initialState } from "./initialState"
import { GameState } from "./types"

interface GameActions {
  resetGame: () => void
  updateDiceNo: (diceNo: number) => void
  updatePlayerChance: (chancePlayer: number) => void
  updatePlayerPieceValue: (payload: {
    playerNo: keyof Pick<GameState, "player1" | "player2" | "player3" | "player4">
    pieceId: string
    pos: number
    travelCount: number
  }) => void
  disableTouch: () => void
  unfreezeDice: () => void
  enablePileSelection: (playerNo: number) => void
  enableCellSelection: (playerNo: number) => void
  updateFireworks: (value: boolean) => void
  announceWinner: (playerNo: number) => void
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set) => ({
      ...initialState,

      resetGame: () => set(initialState),

      updateDiceNo: (diceNo) => set({ diceNo, isDiceRolled: true }),

      updatePlayerChance: (chancePlayer) =>
        set({ chancePlayer, touchDiceBlock: false, isDiceRolled: false }),

      updatePlayerPieceValue: ({ playerNo, pieceId, pos, travelCount }) =>
        set((state) => {
          const pieces = state[playerNo].map((p) =>
            p.id === pieceId ? { ...p, pos, travelCount } : p
          )

          const currentPositions = [...state.currentPositions]
          const index = currentPositions.findIndex((p) => p.id === pieceId)

          if (pos === 0) {
            if (index !== -1) currentPositions.splice(index, 1)
          } else {
            if (index !== -1) {
              currentPositions[index] = { id: pieceId, pos }
            } else {
              currentPositions.push({ id: pieceId, pos })
            }
          }

          return { [playerNo]: pieces, currentPositions, pileSelectionPlayer: -1 }
        }),

      disableTouch: () =>
        set({ touchDiceBlock: true, cellSelectionPlayer: -1, pileSelectionPlayer: -1 }),

      unfreezeDice: () => set({ touchDiceBlock: false, isDiceRolled: false }),

      enablePileSelection: (playerNo) =>
        set({ touchDiceBlock: true, pileSelectionPlayer: playerNo }),

      enableCellSelection: (playerNo) =>
        set({ touchDiceBlock: true, cellSelectionPlayer: playerNo }),

      updateFireworks: (fireworks) => set({ fireworks }),

      announceWinner: (winner) => set({ winner }),
    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)