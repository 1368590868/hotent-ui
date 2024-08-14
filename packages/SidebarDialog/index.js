import SidebarDialog from './src/main.vue'

SidebarDialog.install = function(Vue) {
  Vue.component(SidebarDialog.name, SidebarDialog)
}

export default SidebarDialog
