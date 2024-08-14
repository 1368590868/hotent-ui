import FileUpload from './src/main.vue'

FileUpload.install = function(Vue) {
  Vue.component(FileUpload.name, FileUpload)
}

export default FileUpload
