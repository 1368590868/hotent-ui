import UserSelector from './src/main.vue'

UserSelector.install = function(Vue) {
  Vue.component(UserSelector.name, UserSelector)
}

export default UserSelector
