import { Colors } from "./Colors";

export const imageMap = {
  1: '/images/dice/1.png',
  2: '/images/dice/2.png',
  3: '/images/dice/3.png',
  4: '/images/dice/4.png',
  5: '/images/dice/5.png',
  6: '/images/dice/6.png',

  [Colors.green]: '/images/piles/green.png',
  [Colors.red]: '/images/piles/red.png',
  [Colors.yellow]: '/images/piles/yellow.png',
  [Colors.blue]: '/images/piles/blue.png',
} as const;

export const getImage = (name: string | number): string | null =>
  imageMap[name as keyof typeof imageMap] ?? null;