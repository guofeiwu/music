import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

export function getRankList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'
  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    uin: 0,
    onlysong: 0,
    platform: 'h5',
    needNewCode: 0
  })

  return jsonp(url, data, options)
}

export function getTopSongList(topid) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'
  const data = Object.assign({}, commonParams, {
    topid,
    g_tk: 1154588721,
    platform: 'h5',
    needNewCode: 1,
    format: 'json',
    page: 'detail',
    tpl: 3,
    type: 'top'
  })
  return jsonp(url, data, options)
}
