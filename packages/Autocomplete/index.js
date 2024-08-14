import Autocomplete from './src/main.vue'

Autocomplete.install = function(Vue) {
  Vue.component(Autocomplete.name, Autocomplete)
}

export default Autocomplete
