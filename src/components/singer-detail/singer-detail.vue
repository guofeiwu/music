<template>
  <transition name="slide">
    <div class="singer-detail">
      singer detail
    </div>
  </transition>
</template>
<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from 'api/singer'

  export default {
    computed: {
      ...mapGetters([
        'singer'
      ])
    },
    created() {
      this._getSongDetail()
    },
    methods: {
      _getSongDetail() {
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          console.log(res)
        })
      }
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .singer-detail
    position: fixed
    top: 0
    bottom: 0
    left: 0
    right: 0
    z-index: 100
    background: $color-background

  // 转场动画
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform translate3d(100%, 0, 0)
</style>
