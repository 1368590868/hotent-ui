import Selector from './src/main.vue'

Selector.install = function(Vue) {
  Vue.component(Selector.name, Selector)
}

export default Selector
