import DataView from './src/DataView.vue'

DataView.install = function(Vue) {
  Vue.component(DataView.name, DataView)
}

export default DataView
