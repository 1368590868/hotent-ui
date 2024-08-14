import CustomDialog from './src/main.vue'

CustomDialog.install = function(Vue) {
  Vue.component(CustomDialog.name, CustomDialog)
}

export default CustomDialog
