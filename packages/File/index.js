import File from './src/main.vue'

File.install = function(Vue) {
  Vue.component(File.name, File)
}

export default File
