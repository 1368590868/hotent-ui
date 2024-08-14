import Vue from 'vue'

const SUCCESS = '#72c140'
const ERROR = '#ed5b56'
const WARNING = '#f0af41'
const INFO = '#4091f7'
const HEIGHT = 20

export default function(el, binding) {
  const { modifiers, value } = binding
  if (
    value !== null &&
    value !== undefined &&
    value.constructor == Number &&
    value <= 0
  ) {
    if (el.flag) {
      el.removeChild(el.lastChild)
      el.flag = false
    }
    return
  }
  const modifiersKey = Object.keys(modifiers)
  let isDot = modifiersKey.includes('dot')
  let backgroundColor = ''
  if (modifiersKey.includes('success')) {
    backgroundColor = SUCCESS
  } else if (modifiersKey.includes('warning')) {
    backgroundColor = WARNING
  } else if (modifiersKey.includes('info')) {
    backgroundColor = INFO
  } else {
    backgroundColor = ERROR
  }

  const targetTemplate = isDot
    ? `<div style="border:1px solid #fff;position:absolute;top:-5px;right:-5px;height:10px;width:10px;border-radius:50%;background:${backgroundColor}"></div>`
    : `<div style="border:1px solid #fff;background:${backgroundColor};position:absolute;top:-${HEIGHT /
        2}px;right:-${HEIGHT /
        2}px;height:${HEIGHT}px;min-width:${HEIGHT}px;border-radius:${HEIGHT /
        2}px;text-align:center;line-height:${HEIGHT}px;color:#fff;padding:0 5px;">${value}</div>`

  el.style.position = el.style.position || 'relative'
  const badge = Vue.extend({
    template: targetTemplate,
  })
  const component = new badge().$mount().$el
  if (el.flag) {
    el.removeChild(el.lastChild)
  }
  el.appendChild(component)
  el.flag = true
}
