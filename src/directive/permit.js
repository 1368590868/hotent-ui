// 表单tr中根据隐藏字段动态合并单元格的指令
export default function(el, binding) {
  if (el.tagName !== 'TR') {
    throw 'v-permit指令只能用在tr元素上.'
  }
  if (!binding.value || binding.value.constructor !== Number) {
    throw 'v-permit指令的值只能是大于0的数字.'
  }
  el.removeAttribute('hidden')

  // tr中没有子元素时，删除tr自身
  if (el.cells.length == 0) {
    el.setAttribute('hidden', 'hidden')
  } else if (el.cells.length < binding.value) {
    let colspan = binding.value - el.cells.length + 1
    // 设置colspan实现单元格合并
    el.cells[el.cells.length - 1].setAttribute('colspan', colspan)
  } else if (el.cells.length == binding.value) {
    for (var i = 0, c; (c = el.cells[i++]); ) {
      c.removeAttribute('colspan')
    }
  }
}
