import Date from './src/main.vue'

Date.install = function(Vue) {
  Vue.component(Date.name, Date)
}

export default Date
