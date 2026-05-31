// utils/soundPlayer.ts

export type SoundName =
  | 'dice_roll'
  | 'cheer'
  | 'game_start'
  | 'collide'
  | 'home_win'
  | 'pile_move'
  | 'safe_spot'
  | 'ui'
  | 'home'
  | 'girl1'
  | 'girl2'
  | 'girl3'

const soundMap: Record<SoundName, string> = {
  dice_roll: '/sfx/dice_roll.mp3',
  cheer: '/sfx/cheer.mp3',
  game_start: '/sfx/game_start.mp3',
  collide: '/sfx/collide.mp3',
  home_win: '/sfx/home_win.mp3',
  pile_move: '/sfx/pile_move.mp3',
  safe_spot: '/sfx/safe_spot.mp3',
  ui: '/sfx/ui.mp3',
  home: '/sfx/home.mp3',
  girl1: '/sfx/girl1.mp3',
  girl2: '/sfx/girl2.mp3',
  girl3: '/sfx/girl3.mp3',
}

// ✅ Track all active sounds by name
const activeSounds: Map<SoundName, HTMLAudioElement> = new Map()

const getSoundPath = (soundName: SoundName): string => {
  const path = soundMap[soundName]
  if (!path) throw new Error(`Sound ${soundName} not found`)
  return path
}

export const playSound = (
  soundName: SoundName,
  loop = false
): HTMLAudioElement | undefined => {
  try {
    const soundPath = getSoundPath(soundName)
    const audio = new Audio(soundPath)
    audio.loop = loop

    audio.play().catch((err: Error) => {
      console.error('Failed to play sound:', err)
    })

    // ✅ Store by name so we can stop individually or all at once
    activeSounds.set(soundName, audio)

    // ✅ Clean up from map when sound naturally ends
    audio.addEventListener('ended', () => {
      activeSounds.delete(soundName)
    })

    return audio
  } catch (error) {
    console.error('Cannot play sound file:', error)
  }
}

export const stopSound = (soundName: SoundName): void => {
  const audio = activeSounds.get(soundName)
  if (audio) {
    audio.pause()
    audio.currentTime = 0
    activeSounds.delete(soundName)
  }
}

export const stopAllSounds = (): void => {
  activeSounds.forEach((audio) => {
    audio.pause()
    audio.currentTime = 0
  })
  activeSounds.clear()
}