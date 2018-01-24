<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentPlaySong.name"></h1>
          <h2 class="subtitle" v-html="currentPlaySong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart="middleTouchStart"
             @touchmove="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="clcRotate">
                <img class="image" :src="currentPlaySong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{currentPlayLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentNum === index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{formatTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @changePercent="changeSongPercent"></progress-bar>
            </div>
            <span class="time time-r"> {{formatTime(currentPlaySong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="clsDisable">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="clsDisable">
              <i :class="playIcon" @click="playAndPause"> </i>
            </div>
            <div class="icon i-right" :class="clsDisable">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class="getFavoriteIcon(currentPlaySong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="clcRotate" width="40" height="40" :src="currentPlaySong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentPlaySong.name"></h2>
          <p class="desc" v-html="currentPlaySong.singer"></p>
        </div>
        <progress-circle :redius="redius" :percent="percent">
          <div class="control">
            <i :class="playIconMini" @click.stop="playAndPause" class="icon-mini"></i>
          </div>
        </progress-circle>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" :src="songUrl" autoplay="autoplay" @play="ready" @error="error" @timeupdate="updateTime"
           @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import {getSongUrlDetail, getSongUrl} from 'api/song'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {playMode} from 'common/js/config'
  import {shuffle} from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')
  export default {
    data() {
      return {
        songReady: false,
        currentTime: 0,
        redius: 32,
        currentLyric: null,
        currentNum: 0,
        currentShow: 'cd',
        currentPlayLyric: ''
      }
    },
    computed: {
      clsDisable() {
        return this.songReady ? '' : 'disable'
      },
      clcRotate() {
        return this.playing ? 'play' : 'play pause'
      },
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      playIconMini() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      percent() {
        let currentPercent = this.currentTime / this.currentPlaySong.duration
        return currentPercent
      },
      iconMode() {
        return this.mode === playMode.random ? 'icon-random' : this.mode === playMode.sequence ? 'icon-sequence' : 'icon-loop'
      },
      ...mapGetters([
        'fullScreen',
        'playList',
        'currentPlaySong',
        'songUrl',
        'playing',
        'currentIndex',
        'sequenceList',
        'mode'
      ])
    },
    mounted() {
      // console.log(this.songUrl)
    },
    watch: {
      currentPlaySong(newSong, oldSong) {
        if (newSong.id === oldSong.id) {
          return
        }
        // 切换歌曲时候将之前的歌词停掉
        if (this.currentLyric) {
          this.currentLyric.stop()
        }
        setTimeout(() => {
          let songmid = newSong.mid
          getSongUrlDetail(songmid).then(res => {
            let songUrl = getSongUrl(res)
            this.setSongUrl(songUrl)
          })
          // 获取歌词
          this.getSongLyric()
        }, 1000)
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll
    },
    created() {
      this.touch = {}
    },
    methods: {
      middleTouchStart(e) {
        this.touch.initialized = true
        let touches = e.touches[0]
        this.touch.startX = touches.pageX
        this.touch.startY = touches.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initialized) {
          return
        }
        let touches = e.touches[0]
        let deltaX = touches.pageX - this.touch.startX
        let deltaY = touches.pageY - this.touch.startY
        // 当中轴方向的滑动的距离大于横轴方法的滑动距离就什么也不做
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        // 起始位置为 0 ，向左滑动 ，坐标为负的屏幕的宽度
        let left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        let offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / -window.innerWidth)
        this.touch.opacity = 1 - this.touch.percent
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd() {
        let offsetWidth
        let opacity
        // 当显示的是 cd 界面时候
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            this.currentShow = 'lyric'
            opacity = 0
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
        this.touch.initialized = false
      },
      getSongLyric() {
        this.currentPlaySong.getLyric().then(res => {
          this.currentLyric = new Lyric(res, this.lyricHandler)
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null
          this.currentPlayLyric = ''
          this.currentNum = 0
        })
      },
      lyricHandler({lineNum, txt}) {
        this.currentNum = lineNum
        if (lineNum > 5) {
          let ele = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(ele, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.currentPlayLyric = txt
      },
      changeMode() {
        let mode = (this.mode + 1) % 3
        this.setPlayMode(mode)
        let list = null
        if (this.mode === playMode.random) {
          // 将播放列表重置
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        // 设置 播放列表时候 index 发生了变化
        // 重置播放列表
        this.resetCurrentIndex(list)
        this.setPlayList(list)
      },
      resetCurrentIndex(list) {
        let index = list.findIndex((item) => {
          return item.id === this.currentPlaySong.id
        })
        this.setCurrentIndex(index)
      },
      changeSongPercent(percent) {
        const currentTime = this.currentPlaySong.duration * percent
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) {
          this.$refs.audio.play()
          this.setPlayState(!this.playing)
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      formatTime(inteval) {
        // 向下取整
        inteval = inteval | 0
        let minutes = inteval / 60 | 0
        let second = this._pad(inteval % 60)
        return `${minutes}:${second}`
      },
      _pad(num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len = len + 1
        }
        return num
      },
      updateTime(e) {
        this.currentTime = e.target.currentTime
      },
      end() {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        // 如果歌词存在 则将歌词偏移到最上
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      prev() {
        if (!this.songReady) {
          return
        }
        if (this.playList.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index <= 0) {
            index = this.playList.length - 1
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.setPlayState(!this.playing)
          }
        }
      },

      next() {
        if (!this.songReady) {
          return
        }
        if (this.playList.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if (index === this.playList.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.setPlayState(!this.playing)
          }
        }
      },
      ready() {
        this.songReady = true
      },
      error() {
        this.songReady = true
      },
      // 播放 暂停
      playAndPause() {
        if (!this.songReady) {
          return
        }
        const audio = this.$refs.audio
        this.playing ? audio.pause() : audio.play()
        this.setPlayState(!this.playing)
        // 暂停播放
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      back() {
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },

      enter(el, done) {
        let {x, y, scale} = this._getPosAndScale()
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      getFavoriteIcon(song) {
//        if (this.isFavorite(song)) {
//          return 'icon-favorite'
//        }
        return 'icon-not-favorite'
      },
      // 获取位置
      _getPosAndScale() {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - paddingBottom - width / 2
        return {
          x,
          y,
          scale
        }
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setSongUrl: 'SET_SONG_URL',
        setPlayState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_MODE',
        setPlayList: 'SET_PLAY_LIST'
      })
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &., &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
