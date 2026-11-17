export const AUDIO_SLOTS = ['music-1', 'voice', 'music-2'] as const
export const PHOTO_SLOTS = ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5', 'photo-6'] as const

export type AudioSlot = (typeof AUDIO_SLOTS)[number]
export type PhotoSlot = (typeof PHOTO_SLOTS)[number]
export type MediaSlot = AudioSlot | PhotoSlot

export const SLOT_LABELS: Record<MediaSlot, string> = {
  'music-1': 'First romantic music',
  voice: 'Your recorded voice message',
  'music-2': 'Cake celebration music',
  'photo-1': 'Photograph 1',
  'photo-2': 'Photograph 2',
  'photo-3': 'Photograph 3',
  'photo-4': 'Photograph 4',
  'photo-5': 'Photograph 5',
  'photo-6': 'Photograph 6',
}

export const AUDIO_FILES: Record<AudioSlot, string[]> = {
  'music-1': ['music-1.mp3', 'music-1.wav', 'music-1.m4a', 'music-1.ogg'],
  voice: ['voice-message.mp3', 'voice-message.wav', 'voice-message.m4a', 'voice-message.ogg'],
  'music-2': ['music-2.mp3', 'music-2.wav', 'music-2.m4a', 'music-2.ogg'],
}

export const PHOTO_FILES: Record<PhotoSlot, string[]> = {
  'photo-1': ['photo-1.jpg', 'photo-1.jpeg', 'photo-1.png', 'photo-1.webp'],
  'photo-2': ['photo-2.jpg', 'photo-2.jpeg', 'photo-2.png', 'photo-2.webp'],
  'photo-3': ['photo-3.jpg', 'photo-3.jpeg', 'photo-3.png', 'photo-3.webp'],
  'photo-4': ['photo-4.jpg', 'photo-4.jpeg', 'photo-4.png', 'photo-4.webp'],
  'photo-5': ['photo-5.jpg', 'photo-5.jpeg', 'photo-5.png', 'photo-5.webp'],
  'photo-6': ['photo-6.jpg', 'photo-6.jpeg', 'photo-6.png', 'photo-6.webp'],
}

export const FILES_BY_SLOT: Record<MediaSlot, string[]> = { ...AUDIO_FILES, ...PHOTO_FILES }

export function isAudioSlot(slot: MediaSlot): slot is AudioSlot {
  return (AUDIO_SLOTS as readonly string[]).includes(slot)
}

export const ALL_SLOTS: MediaSlot[] = [...AUDIO_SLOTS, ...PHOTO_SLOTS]
