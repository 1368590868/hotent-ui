import ReadonlyInput from './src/main.vue'

ReadonlyInput.install = function(Vue) {
  Vue.component(ReadonlyInput.name, ReadonlyInput)
}

export default ReadonlyInput
