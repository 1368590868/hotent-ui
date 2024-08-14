import UserDialog from './src/main.vue'

UserDialog.install = function(Vue) {
  Vue.component(UserDialog.name, UserDialog)
}

export default UserDialog
