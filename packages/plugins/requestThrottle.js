import Cache from './cache.js'
const axios = require('axios')
const { Base64 } = require('js-base64')
// axios中用于取消请求的对象
const CancelToken = axios.CancelToken
const source = CancelToken.source()
// 缓存请求数据的对象
let cache = null
const _throttleConfig = {
  post: {
    cacheable: true, //是否缓存post请求
    dataPropertyCount: 5, //缓存请求中允许data对象最多有几个属性
    dataLength: 512, //缓存请求中允许data转为字符串后的最大字节
  },
  cache: {
    max: 10, //缓存中最大条数（超过时拒绝缓存）
    duration: 2000, //缓存过期时间(单位：ms)
  },
  interval: 50, //被取消的请求从缓存中迭代获取的时间间隔(单位：ms)
}

// 通过请求的config来获取缓存key，如果返回的key为null则表示该请求不缓存
const getHashKeyWithConfig = (config) => {
  const { url, method } = config || {}
  if (!url || !method) {
    return null
  }
  // 如果缓存超限了（查询cache是否超限的方法可能会导致缓存中的过期数据被刷新），停止缓存
  if (cache.overSize()) {
    return null
  }
  // 缓存所有get请求
  if (method.toLowerCase() == 'get') {
    const reqHashKey = Base64.encode(url)
    return reqHashKey
  } else if (_throttleConfig.post.cacheable && method.toLowerCase() == 'post') {
    // [post请求]：没有data传参的缓存
    if (!config.data) {
      return Base64.encode(url)
    } else if (
      Object.keys(config.data).length < _throttleConfig.post.dataPropertyCount
    ) {
      // [post请求]：有data传参，但是data中的属性少于指定个数，而且data转换为字符串以后字节长度小于指定长度的缓存
      const dataStr = JSON.stringify(config.data)
      if (dataStr.length < _throttleConfig.post.dataLength) {
        return `${Base64.encode(url)}${Base64.encode(dataStr)}`
      }
    }
  }
  return null
}

// 是否要取消掉请求：当前有缓存相同请求时会取消该请求
const shouldCancelRequest = (config) => {
  const reqHashKey = getHashKeyWithConfig(config)
  // 获取到key了，说明该请求支持缓存
  if (reqHashKey) {
    const cached = cache.get(reqHashKey)
    // 缓存中有则直接取消请求
    if (cached) {
      config.cancelToken = source.token
      // 取消请求时传递key作为Cancel类型异常的message属性
      source.cancel(reqHashKey)
    } else {
      // 缓存中没有，则将key加入缓存（缓存的值先标记为true，当response中拿到返回值后更新缓存的值为response）
      cache.set(reqHashKey, true)
    }
  }
}

const use = (axiosInstance, config) => {
  Object.assign(_throttleConfig, config || {})

  cache = new Cache(_throttleConfig.cache)

  axiosInstance.interceptors.request.use((config) => {
    // 拦截所有请求，看请求是否需要缓存或者取消请求
    shouldCancelRequest(config)
    return config
  })

  axiosInstance.interceptors.response.use(
    (response) => {
      // 拦截所有请求返回
      const reqHashKey = getHashKeyWithConfig(response.config)
      // 如果该请求支持缓存，则将response更新到缓存中
      if (reqHashKey) {
        cache.set(reqHashKey, response)
      }
      return response
    },
    (err) => {
      // 拦截异常，对于Cancel类型的异常，而且message中传递的是缓存key
      if (err && err.constructor.name == 'Cancel' && err.message) {
        let intervalFlag = null
        const reqHashKey = err.message
        return Promise.race([
          new Promise((resolve) => {
            // 通过一个迭代器尝试从缓存中获取response
            intervalFlag = setInterval(() => {
              const cacheResponse = cache.get(reqHashKey)
              if (cacheResponse) {
                // 取到的缓存数据是对象，则作为response返回
                if (cacheResponse instanceof Object) {
                  resolve(cacheResponse)
                }
                // 取到的缓存数据是true，表示还在请求中，则刷新缓存的存活时间
                else if (cacheResponse === true) {
                  cache.set(reqHashKey, true)
                }
              } else {
                // 如果该key在缓存中不存在，则取消迭代器
                clearInterval(intervalFlag)
              }
            }, _throttleConfig.interval)
          }),
          new Promise((reject) => {
            // 上述迭代器的超时器，超时时间与axios设置的超时时间保持一致
            setTimeout(() => {
              reject(err)
            }, axiosInstance.defaults.timeout || 10000)
          }),
        ]).finally(() => clearInterval(intervalFlag))
      } else if (err && err.config) {
        const reqHashKey = getHashKeyWithConfig(err.config)
        // 如果是其他类型的异常，且该请求有缓存，则删除缓存，避免因为缓存不再继续发送请求了
        if (reqHashKey) {
          cache.delete(reqHashKey)
        }
        return Promise.reject(err)
      }
    }
  )
}

export { use }
export default { use }
