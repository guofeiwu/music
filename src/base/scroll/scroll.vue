<template>
  <div ref="wrapper">
    <slot>
    </slot>
  </div>
</template>
<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      },
      listenScroll: {
        type: Boolean,
        default: false
      },
      pullUp: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() {
        if (!this.$refs.wrapper) {
          return null
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
        if (this.listenScroll) {
          let self = this
          this.scroll.on('scroll', (pos) => {
            self.$emit('scroll', pos)
            // console.log(pos)
          })
        }

        if (this.pullUp) {
          let self = this
          this.scroll.on('scrollEnd', () => {
            if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
              self.$emit('scrollToEnd')
            }
          })
        }
      },
      disable() {
        this.scroll && this.scroll.disable()
      },
      enable() {
        this.scroll && this.scroll.enable()
      },
      refresh() {
        this.scroll && this.scroll.refresh()
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this._initScroll()
        }, 20)
      }
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">

</style>

