import { Howl } from 'howler'

type SoundName =
  | 'ambientDrone'
  | 'celloSwell'
  | 'metallicShimmer'
  | 'chimeSoft'
  | 'waterPing'
  | 'celloSustain'
  | 'etherealPad'
  | 'stringPull'
  | 'harmonicChime'
  | 'validationClick'
  | 'orchestralSwell'
  | 'descendingTone'
  | 'constructionLayers'
  | 'grandReveal'
  | 'luxeAmbient'
  | 'fadeExhale'

interface SoundConfig {
  src: string
  loop?: boolean
  volume?: number
}

const SOUND_MAP: Record<SoundName, SoundConfig> = {
  ambientDrone: { src: '/assets/audio/ambient-drone.mp3', loop: true, volume: 0.15 },
  celloSwell: { src: '/assets/audio/cello-swell.mp3', volume: 0.6 },
  metallicShimmer: { src: '/assets/audio/metallic-shimmer.mp3', loop: true, volume: 0.3 },
  chimeSoft: { src: '/assets/audio/chime-soft.mp3', volume: 0.4 },
  waterPing: { src: '/assets/audio/water-ping.mp3', volume: 0.5 },
  celloSustain: { src: '/assets/audio/cello-sustain.mp3', volume: 0.5 },
  etherealPad: { src: '/assets/audio/ethereal-pad.mp3', loop: true, volume: 0.1 },
  stringPull: { src: '/assets/audio/string-pull.mp3', volume: 0.4 },
  harmonicChime: { src: '/assets/audio/harmonic-chime.mp3', volume: 0.5 },
  validationClick: { src: '/assets/audio/validation-click.mp3', volume: 0.6 },
  orchestralSwell: { src: '/assets/audio/orchestral-swell.mp3', volume: 0.7 },
  descendingTone: { src: '/assets/audio/descending-tone.mp3', volume: 0.3 },
  constructionLayers: { src: '/assets/audio/construction-layers.mp3', volume: 0.4 },
  grandReveal: { src: '/assets/audio/grand-reveal.mp3', volume: 0.7 },
  luxeAmbient: { src: '/assets/audio/luxe-ambient.mp3', loop: true, volume: 0.2 },
  fadeExhale: { src: '/assets/audio/fade-exhale.mp3', volume: 0.3 },
}

class AudioManagerClass {
  private sounds: Map<SoundName, Howl> = new Map()
  private _muted = false

  async preload(): Promise<void> {
    const entries = Object.entries(SOUND_MAP) as [SoundName, SoundConfig][]
    const promises = entries.map(
      ([name, config]) =>
        new Promise<void>((resolve) => {
          const howl = new Howl({
            src: [config.src],
            loop: config.loop ?? false,
            volume: config.volume ?? 0.5,
            preload: true,
            onload: () => resolve(),
            onloaderror: () => {
              console.warn(`Audio not found: ${config.src} — skipping`)
              resolve()
            },
          })
          this.sounds.set(name, howl)
        })
    )
    await Promise.all(promises)
  }

  play(name: SoundName): number | undefined {
    const sound = this.sounds.get(name)
    if (!sound || this._muted) return undefined
    return sound.play()
  }

  stop(name: SoundName): void {
    this.sounds.get(name)?.stop()
  }

  fade(name: SoundName, from: number, to: number, duration: number): void {
    this.sounds.get(name)?.fade(from, to, duration)
  }

  stopAll(): void {
    this.sounds.forEach((sound) => sound.stop())
  }

  set muted(value: boolean) {
    this._muted = value
    Howler.mute(value)
  }

  get muted(): boolean {
    return this._muted
  }
}

export const AudioManager = new AudioManagerClass()
export type { SoundName }
