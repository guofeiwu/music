import {commonParams, ERR_OK} from './config'
import axios from 'axios'

export function getSongUrlDetail(songmid) {
  const url = '/getSongUrl'
  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq',
    cid: 205361747,
    needNewCode: 0,
    format: 'json',
    uin: 0,
    songmid: songmid,
    filename: `C400${songmid}.m4a`,
    guid: 440627422
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getSongUrl(res) {
  const url = 'http://dl.stream.qqmusic.qq.com/'
  if (res.code === ERR_OK) {
    let item = res.data.items[0]
    let result = url + item.filename + '?vkey=' + item.vkey + '&guid=440627422&uin=0&fromtag=66'
    return result
  }
}

export function getLyric(songmid) {
  const url = '/getSongLyric'
  const data = Object.assign({}, commonParams, {
    pcachetime: +new Date(),
    songmid: songmid,
    g_tk: 5381,
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0,
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
