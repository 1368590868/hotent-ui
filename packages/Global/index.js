import GlobalValidate from './src/GlobalValidate.vue'
import GlobalQuery from './src/GlobalQuery.vue'

GlobalValidate.install = function(Vue) {
  Vue.component(GlobalValidate.name, GlobalValidate)
}

GlobalQuery.install = function(Vue) {
  Vue.component(GlobalQuery.name, GlobalQuery)
}

export { GlobalValidate, GlobalQuery }
