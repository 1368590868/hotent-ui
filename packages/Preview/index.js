import Preview from './src/main.vue'

Preview.install = function(Vue) {
  Vue.component(Preview.name, Preview)
}

export default Preview
