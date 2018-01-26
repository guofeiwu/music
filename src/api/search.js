import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

export function getSearchResultList(keyword, pageNum, zhida) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  const data = Object.assign({}, commonParams, {
    g_tk: 1154588721,
    format: 'jsonp',
    platform: 'h5',
    needNewCode: 1,
    w: keyword,
    zhidaqu: 1,
    catZhida: zhida ? 1 : 0,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage: 20,
    n: 20,
    p: pageNum,
    remoteplace: 'txt.mqq.all',
    _: +new Date()
  })
  return jsonp(url, data, options)
}

export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
  const data = Object.assign({}, commonParams, {
    g_tk: 1154588721,
    needNewCode: 1
  })
  return jsonp(url, data, options)
}
