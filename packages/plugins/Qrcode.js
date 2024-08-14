const Qrcode = {}

Qrcode.install = function(Vue) {
  Vue.prototype.$qrcode = require('qrcode')
}

export default Qrcode
