<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import MusicList from 'components/music-list/music-list'
  import {getTopSongList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default {
    computed: {
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        return this.songs.length > 0 ? this.songs[0].image : ''
      },
      ...mapGetters([
        'topList'
      ])
    },
    data() {
      return {
        songs: [],
        rank: true
      }
    },
    created() {
      this._getTopSongList()
    },
    methods: {
      _getTopSongList() {
        if (!this.topList.id) {
          this.$router.push({
            path: '/rank'
          })
          return
        }
        getTopSongList(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            console.log(res.songlist)
            this.songs = this._normalizeSongList(res.songlist)
          }
        })
      },
      _normalizeSongList(list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.data.albummid && musicData.data.songid) {
            ret.push(createSong(musicData.data))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
