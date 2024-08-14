const XLSX = {}

XLSX.install = function(Vue) {
  Vue.prototype.$XLSX = require('xlsx/dist/xlsx.core.min.js')
}

export default XLSX
