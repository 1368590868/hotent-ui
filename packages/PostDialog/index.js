import PostDialog from './src/main.vue'

PostDialog.install = function(Vue) {
  Vue.component(PostDialog.name, PostDialog)
}

export default PostDialog
