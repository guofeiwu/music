import 'babel-polyfill' // es6一些api的使用，一定要放在最前面
import Vue from 'vue'
import App from './App'
import router from './router'
import lazyLoader from 'vue-lazyload'
import 'common/stylus/index.styl'
import fastclick from 'fastclick'  // 解决移动端点击事件300毫秒延迟

fastclick.attach(document.body)

Vue.use(lazyLoader, {
  loading: require('common/image/default.png')
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: b => b(App)
})
