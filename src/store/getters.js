export const singer = state => state.singer

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playList = state => state.playList

export const sequenceList = state => state.playList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

export const currentPlaySong = (state) => {
  return state.playList[state.currentIndex] || {}
}

export const songUrl = state => state.songUrl

export const disc = state => state.disc

export const topList = state => state.topList
