function Cache(config) {
  this.cfg = { max: 99, duration: 2000 }
  Object.assign(this.cfg, config || {})
  this.cacheValues = new Map()
}

/**
 * 将指定key和value存放到缓存中
 * @param {*} key
 * @param {*} value
 * @param {*} expireTime 过期时长（单位：ms），不传时使用全局默认过期时长
 */
Cache.prototype.set = function (key, value, expireTime) {
  const now = new Date().getTime()
  const expireDuration = expireTime || this.cfg.duration
  const expire = now + expireDuration
  const data = { expire }
  data[key] = value
  this.cacheValues.set(key, data)
}

/**
 * 通过key获取缓存的数据
 * @param {*} key
 * @returns
 */
Cache.prototype.get = function (key) {
  if (this.cacheValues.has(key)) {
    const data = this.cacheValues.get(key)
    const now = new Date().getTime()
    const { expire } = data
    if (expire > 0 && expire > now) {
      return data[key]
    }
    // 如果key已经过期，则清理掉
    this.cacheValues.delete(key)
    return null
  }
  return null
}

/**
 * 删除指定key的缓存
 * @param {*} key
 */
Cache.prototype.delete = function (key) {
  if (this.cacheValues.has(key)) {
    this.cacheValues.delete(key)
  }
}

/**
 * 是否超过尺寸（超过尺寸时会清理缓存过期的数据）
 * @returns
 */
Cache.prototype.overSize = function () {
  // 如果当前缓存的数据超限了，会触发过期缓存清理
  const result = this.cacheValues.size >= this.cfg.max
  if (result) {
    this.cleanExpired()
  }
  return result
}

/**
 * 清理掉缓存过期的数据
 */
Cache.prototype.cleanExpired = function () {
  const keysToDelete = []
  const now = new Date().getTime()
  this.cacheValues.forEach((value, key) => {
    const { expire } = value
    if (expire && expire > 0 && expire > now) {
      keysToDelete.push(key)
    }
  })
  if (keysToDelete.length > 0) {
    keysToDelete.forEach((key) => this.cacheValues.delete(key))
  }
}

/**
 * 清空缓存的数据
 */
Cache.prototype.clear = function () {
  this.cacheValues.clear()
}

export default Cache
