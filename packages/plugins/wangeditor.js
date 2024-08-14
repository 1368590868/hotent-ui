const wangeditor = {}

wangeditor.install = function(Vue, config) {
  Vue.prototype.$WangEditor = require('wangeditor')
  // 如果提供的token是方法则延迟后执行该方法来获取token值(解决部分情况下，获取token的方法无法获取到值的情况)
  if (
    config &&
    config.uploadImgHeaders &&
    config.uploadImgHeaders.Authorization &&
    typeof config.uploadImgHeaders.Authorization == 'function'
  ) {
    setTimeout(() => {
      config.uploadImgHeaders.Authorization = config.uploadImgHeaders.Authorization.apply()
    }, 300)
  }
  Vue.prototype.$WangEditorConfig = config || {}
}

export default wangeditor
