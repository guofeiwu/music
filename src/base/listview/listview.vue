<template>
  <scroll class="listview"
          :data="data"
          @scroll="scroll"
          ref="listView">
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li v-for="item in group.items" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart.stop.prevent="onSideTouchScroll" @touchmove.stop.prevent="onSideTouchMove">
      <ul>
        <li v-for="(item, index) in sideIndex" :data-index="index" class="item"
            :class="{'current':currentIndex === index }">
          {{item}}
        </li>
      </ul>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>
<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {getData} from 'common/js/dom'

  const ANCHOR_HEIGHT = 18
  //  const TITLE_HEIGHT = 30
  export default {
    created() {
      this.probeType = 3
      this.listenScroll = true
      this.touch = {}
      this.listHeight = []
    },
    data() {
      return {
        currentIndex: 0,
        scrollY: -1,
        diff: -1
      }
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    methods: {
      onSideTouchScroll(e) {
//        console.log(e)
//        console.log(e.target)
        let anchorIndex = getData(e.target, 'index')
        // 记录按下的位置
        this.touch.y1 = e.touches[0].pageY
        // record down position
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      onSideTouchMove(e) {
        // 记录滑到的位置
        this.touch.y2 = e.touches[0].pageY
        // | 0 表示向下取整
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        // record the stop position
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        this._scrollTo(anchorIndex)
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
      _scrollTo(index) {
        console.log(index)
        // console.log(this.currentPageIndex)
        if (!index && index !== 0) {
          console.log('is null')
          return
        }
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]
        // 0 是表示一个动画的时间
        this.$refs.listView.scrollToElement(this.$refs.listGroup[index], 0)
      },
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 1; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      }
    },
    components: {
      Scroll,
      Loading
    },
    computed: {
      sideIndex() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      scrollY(newY) {
        console.log('newY' + newY)
        const listHeight = this.listHeight
        // 当滑动到顶部 newY>0
        if (newY > 0) {
          this.currentPageIndex = 0
          return
        }
        // 在中间滚动
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if (-newY > height1 && -newY < height2) {
            this.currentPageIndex = i
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        this.currentPageIndex = listHeight.length - 2
      }
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
