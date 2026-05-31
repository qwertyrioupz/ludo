import { GameState } from "./types"

export const initialState: GameState = {
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



// import { GameState } from "./types"

// export const initialState: GameState = {
//   player1: [
//     { id: "A1", pos: 57, travelCount: 57 },
//     { id: "A2", pos: 57, travelCount: 57 },
//     { id: "A3", pos: 57, travelCount: 57 },

//     // visible on board
//     { id: "A4", pos: 51, travelCount: 51 },
//   ],

//   player2: [
//     { id: "B1", pos: 0, travelCount: 0 },
//     { id: "B2", pos: 0, travelCount: 0 },
//     { id: "B3", pos: 0, travelCount: 0 },
//     { id: "B4", pos: 0, travelCount: 0 },
//   ],

//   player3: [
//     { id: "C1", pos: 0, travelCount: 0 },
//     { id: "C2", pos: 0, travelCount: 0 },
//     { id: "C3", pos: 0, travelCount: 0 },
//     { id: "C4", pos: 0, travelCount: 0 },
//   ],

//   player4: [
//     { id: "D1", pos: 0, travelCount: 0 },
//     { id: "D2", pos: 0, travelCount: 0 },
//     { id: "D3", pos: 0, travelCount: 0 },
//     { id: "D4", pos: 0, travelCount: 0 },
//   ],

//   chancePlayer: 1,
//   diceNo: 6,
//   isDiceRolled: false,
//   pileSelectionPlayer: -1,
//   cellSelectionPlayer: 1,
//   touchDiceBlock: false,

//   // IMPORTANT: add A4 here
//   currentPositions: [{ id: "A4", pos: 51 }],

//   fireworks: false,
//   winner: null,
// }