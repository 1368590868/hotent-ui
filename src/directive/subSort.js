export default {
  bind(el, binding, vnode) {
    const onlineFormInst = vnode.context
    const subPath = el.id.replace('xh_tablegd_', '').split('.')
    const subArr = onlineFormInst.data[subPath[0]][subPath[1]]
    const subName = subPath[1].replace('sub_', '')
    const { field, direction } = binding.value
    if (onlineFormInst.permission.table[subName].hidden || subArr.length == 0) {
      return
    }
    subArr.sort((a, b) => {
      const x = isNaN(a[field]) ? a[field] : Number(a[field])
      const y = isNaN(b[field]) ? b[field] : Number(b[field])
      const result = x < y ? -1 : x > y ? 1 : 0
      return result * (direction == 'desc' ? -1 : 1)
    })
  },
}
