export interface Piece {
  id: string
  pos: number
  travelCount: number
}

export interface CurrentPosition {
  id: string
  pos: number
}

export interface GameState {
  player1: Piece[]
  player2: Piece[]
  player3: Piece[]
  player4: Piece[]




  humanPlayerNo: number
  rollingPlayerNo: number | null
  isBotPlaying: boolean
  turnTimeLeft: number









  chancePlayer: number
  diceNo: number
  isDiceRolled: boolean
  pileSelectionPlayer: number
  cellSelectionPlayer: number
  touchDiceBlock: boolean
  currentPositions: CurrentPosition[]
  fireworks: boolean
  winner: number | null
}