import TimePicker from './src/main.vue'

TimePicker.install = function(Vue) {
  Vue.component(TimePicker.name, TimePicker)
}

export default TimePicker
