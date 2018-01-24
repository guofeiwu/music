<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart="touchProgressStart"
           @touchmove="touchProgressMove"
           @touchend="touchProgressEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const transform = prefixStyle('transform')
  const RPOGRESSBTNWIDTH = 16
  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    watch: {
      percent(newPercent) {
        if (newPercent >= 0) {
          let progressBarWidth = this.$refs.progressBar.clientWidth - RPOGRESSBTNWIDTH
          let currentProgressWidth = newPercent * progressBarWidth
          this._offset(currentProgressWidth)
        }
      }
    },
    created() {
      this.touch = {}
    },
    methods: {
      progressClick(e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offSetWidth = e.pageX - rect.left
        this._offset(offSetWidth)
        this._triggerPercent()
      },
      touchProgressStart(e) {
        this.touch.initialize = true
        this.touch.startX = e.touches[0].pageX
        this.touch.left = this.$refs.progress.clientWidth
      },
      touchProgressMove(e) {
        if (!this.touch.initialize) {
          return
        }
        let delta = e.touches[0].pageX - this.touch.startX
        let offsetWidth = Math.min(this.$refs.progressBar.clientWidth - RPOGRESSBTNWIDTH, Math.max(0, this.touch.left + delta))
        this._offset(offsetWidth)
      },
      touchProgressEnd() {
        this.touch.initialize = false
        this._triggerPercent()
      },
      _offset(currentProgressWidth) {
        this.$refs.progress.style.width = `${currentProgressWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${currentProgressWidth}px,0,0)`
      },
      _triggerPercent() {
        let progressBarWidth = this.$refs.progressBar.clientWidth - RPOGRESSBTNWIDTH
        let percent = this.$refs.progress.clientWidth / progressBarWidth
        this.$emit('changePercent', percent)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
