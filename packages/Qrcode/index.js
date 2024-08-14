import Qrcode from './src/Qrcode.vue'

Qrcode.install = function(Vue) {
  Vue.component(Qrcode.name, Qrcode)
}

export default Qrcode
