<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>
<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import musicList from 'components/music-list/music-list'
  import {getDiscSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default {
    computed: {
      title() {
        return this.disc.dissname
      },
      bgImage() {
        return this.disc.imgurl
      },
      ...mapGetters([
        'disc'
      ])
    },
    created() {
      this._getSongList()
    },
    data() {
      return {
        songs: []
      }
    },
    methods: {
      _getSongList() {
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }
        getDiscSongList(this.disc.dissid).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalSonglist(res.cdlist[0].songlist)
            console.log(this.songs)
          }
        })
      },
      _normalSonglist(list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.songmid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      musicList
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  // 转场动画
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform translate3d(100%, 0, 0)
</style>
