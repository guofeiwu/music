<template>
  <div class="singer" ref="singer">
    <list-view :data="singerList" v-on:select="singerDetail" ref="singerList"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
  import ListView from 'base/listview/listview'
  import Singer from 'common/js/singer'
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {mapMutations} from 'vuex'
  import {playListMixin} from 'common/js/mixin'

  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10
  export default {
    mixins: [playListMixin],
    data() {
      return {
        singerList: []
      }
    },
    mounted() {
      this._getSingerList()
    },
    methods: {
      handlePlaylist(playList) {
        let bottom = playList.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.singerList.refresh()
      },
      singerDetail(singer) {
        console.log(singer.name)
//        this.$router.push({
//          name: 'singer',
//          params: {id: singer.id}
//        })
        this.$router.push({path: `/singer/${singer.id}`})
        this.setSinger(singer)
      },
      _getSingerList() {
        getSingerList().then(res => {
          if (res.code === ERR_OK) {
            this.singerList = this._formatData(res.data.list)
          }
        })
      },
      // 处理数据
      _formatData(data) {
        // 定义一个map
        const map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        // forEach是针对数组的方法
        data.forEach((item, index) => {
          // 遍历数据，前10条为热门
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }))
          }
          const key = item.Findex
          // 看map对象中是否存在 对应的key
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        })
        // 为了等到有序的map， 处理map
        let ret = []
        let hot = []
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      ListView
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
