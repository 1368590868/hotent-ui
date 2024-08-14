import DatePicker from './src/main.vue'

DatePicker.install = function(Vue) {
  Vue.component(DatePicker.name, DatePicker)
}

export default DatePicker
