<template>
  <div class="music-list" ref="musicList">
    <div class="back" @click="back()">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper" ref="playBtn" @click="randomPlay">
        <div class="play">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll :data="songs" class="list" :probe-type="probeType"
            :listen-scroll="listenScroll" ref="list" @scroll="scrollSongs">
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="playSong" :rank="rank"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Loading from 'base/loading/loading'
  import {prefixStyle} from 'common/js/dom'
  import {mapActions, mapMutations} from 'vuex'
  //  import {getSongUrlDetail, getSongUrl} from 'api/song'
  import {playListMixin} from 'common/js/mixin'

  const BANNER_HEIGHT = 40
  const transform = prefixStyle('transform')
  export default {
    mixins: [playListMixin],
    mounted() {
      // 设置列表距离顶部的距离
      this.imageHeight = this.$refs.bgImage.clientHeight
      this.minImageHeight = -this.imageHeight + BANNER_HEIGHT
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    components: {
      Scroll,
      SongList,
      Loading
    },
    props: {
      songs: {
        type: Array,
        default: null
      },
      title: {
        type: String,
        default: ''
      },
      bgImage: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      },
      singer(song) {
        let singers = []
        song.singer.forEach((item) => {
          singers.push(item.name)
        })
        return singers.join('/')
      }
    },
    watch: {
      scrollY(newY) {
        let zIndex = 0
        let scale = 1
        let translateY = Math.max(this.minImageHeight, newY)
        this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
        let percent = Math.abs(newY / this.imageHeight)
        // 向下拉
        if (newY > 0) {
          zIndex = 10
          scale = scale + percent
        }
        if (newY < this.minImageHeight) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${BANNER_HEIGHT}px`
          this.$refs.playBtn.style.display = 'none'
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        this.$refs.bgImage.style.zIndex = zIndex
        // 设置缩放
        this.$refs.bgImage.style[transform] = `scale(${scale})`
      }
    },
    methods: {
      handlePlaylist(playList) {
        let bottom = playList.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      randomPlay() {
        this.randomPlaySong({
          list: this.songs
        })
      },
      back() {
        this.$router.back()
      },
      scrollSongs(pos) {
        this.scrollY = pos.y
      },
      playSong(item, index) {
//        let songmid = item.mid
//        getSongUrlDetail(songmid).then(res => {
//          let songUrl = getSongUrl(res)
//          this.setSongUrl(songUrl)
//          this.startPlaySong({
//            list: this.songs,
//            index
//          })
//        })
        this.startPlaySong({
          list: this.songs,
          index
        })
      },
      ...mapActions([
        'startPlaySong',
        'randomPlaySong'
      ]),
      ...mapMutations({
        setSongUrl: 'SET_SONG_URL'
      })
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
