// utils/scaling.ts

export const getDeviceWidth = (): number =>
  typeof window !== 'undefined' ? window.innerWidth : 0;

export const getDeviceHeight = (): number =>
  typeof window !== 'undefined' ? window.innerHeight : 0;