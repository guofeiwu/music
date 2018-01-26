<template>
  <scroll ref="suggest"
          class="suggest"
          :data="songsList"
          :pull-up="pullUp"
          @scrollToEnd="loadMore"
  >
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in songsList">
        <div class="icon">
          <i :class="getCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore"></loading>
    </ul>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import {getSearchResultList} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'

  const TYPE_SINGER = 'singer'
  export default {
    props: {
      query: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        songsList: [],
        page: 1,
        pageSize: 30,
        showSinger: true,
        pullUp: true,
        hasMore: true
      }
    },
    methods: {
      loadMore() {
        if (!this.hasMore) {
          return
        }
        this.page++
        getSearchResultList(this.query, this.page, this.showSinger, this.pageSize).then(res => {
          if (res.code === ERR_OK) {
            this.songsList = this.songsList.concat(this._normalResultList(res.data))
            this._checkMore(res.data)
          }
        })
      },
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      getCls(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      search(newQuery) {
        this.page = 1
        this.hasMore = true
        this.$refs.suggest.scrollTo(0, 0)
        getSearchResultList(newQuery, this.page, this.showSinger, this.pageSize).then(res => {
          if (res.code === ERR_OK) {
            this.songsList = this._normalResultList(res.data)
            this._checkMore(res.data)
          }
        })
      },
      _checkMore(data) {
        // 没有数据返回，或者当前返回的数据和之前返回的数据的总和大于或者等于总数 则没有更多
        if (!data.song.list.length || (data.song.curnum + this.pageSize * this.page) >= data.totalnum) {
          this.hasMore = false
        }
      },
      _normalResultList(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) {
          ret = ret.concat(this._noramlizeSongList(data.song.list))
        }
        return ret
      },
      _noramlizeSongList(list) {
        let ret = []
        list.forEach((item) => {
          if (item.songid && item.albummid) {
            ret.push(createSong(item))
          }
        })
        return ret
      }
    },
    watch: {
      query(newQuery) {
        this.search(newQuery)
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
