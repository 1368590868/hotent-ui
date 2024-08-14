import Vue from 'vue'

export default function(el, binding) {
  if (el.hasIcon) return
  const iconElement = structureIcon(binding.value)
  // 图标是否追加在元素后面
  if (binding.modifiers && binding.modifiers.after) {
    el.appendChild(iconElement)
  } else {
    el.insertBefore(iconElement, el.childNodes[0])
  }
  el.hasIcon = true
}

function structureIcon(attrs) {
  // 拼接绑定属性
  let attrStr = ''

  if (typeof attrs == 'string') {
    attrStr = `content=${attrs} `
  } else if (typeof attrs == 'object') {
    for (let key in attrs) {
      attrStr += `${key}=${attrs[key]} `
    }
  } else {
    throw `v-tooltip需要提供表达式或者object对象`
  }

  const a = `<el-tooltip ${attrStr}><ht-icon name="question" style="margin:0 8px" /></el-tooltip>`
  // 创建构造器
  const tooltip = Vue.extend({
    template: a,
  })
  // 创建一个 tooltip 实例并返回 dom 节点
  const component = new tooltip().$mount()
  return component.$el
}
