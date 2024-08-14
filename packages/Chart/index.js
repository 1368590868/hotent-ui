import Chart from './src/Chart.vue'

Chart.install = function(Vue) {
  Vue.component(Chart.name, Chart)
}

export default Chart
