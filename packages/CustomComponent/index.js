import CustomComponent from '../CustomComponent/src/main.vue'
CustomComponent.install = function(Vue) {
  Vue.component(CustomComponent.name, CustomComponent)
}

export default CustomComponent
