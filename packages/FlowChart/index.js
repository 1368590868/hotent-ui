import FlowChart from './src/main.vue'

FlowChart.install = function(Vue) {
  Vue.component(FlowChart.name, FlowChart)
}

export default FlowChart
