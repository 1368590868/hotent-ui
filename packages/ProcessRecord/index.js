import ProcessRecord from './src/main.vue'

ProcessRecord.install = function(Vue) {
  Vue.component(ProcessRecord.name, ProcessRecord)
}

export default ProcessRecord
