import Dictionary from './src/main.vue'

Dictionary.install = function(Vue) {
  Vue.component(Dictionary.name, Dictionary)
}

export default Dictionary
