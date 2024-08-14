import Picture from './src/main.vue'

Picture.install = function(Vue) {
  Vue.component(Picture.name, Picture)
}

export default Picture
