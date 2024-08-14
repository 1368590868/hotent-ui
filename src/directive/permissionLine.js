import utils from '@/utils.js'

export default {
  bind(el, binding, vnode) {
    if (binding.value) {
      const inst = vnode.context
      let idxObj = utils.getSubScopeElAndIndex(el)
      let paths = binding.value.split('_')
      let boType = paths[0]
      let idStr = binding.value + '_' + idxObj.index
      //孙表时，获取孙表所属子表序号
      if (boType == 'sun' && idxObj.subScopeEl) {
        const subIdxObj = utils.getSubScopeElAndIndex(
          idxObj.subScopeEl.parentElement
        )
        idStr = binding.value + '_' + subIdxObj.index + '_' + idxObj.index
      }
      if (
        inst.permission &&
        inst.permission['subFields'] &&
        inst.permission['subFields'][idStr]
      ) {
        setTimeout(function() {
          if (el.__vue__) {
            el.__vue__.permission_sub = inst.permission['subFields'][idStr]
            el.__vue__.sub_work = true
          }
        }, 0)
      }
    }
  },
  update(el, binding, vnode) {
    if (binding.value) {
      const inst = vnode.context
      let idxObj = utils.getSubScopeElAndIndex(el)
      let paths = binding.value.split('_')
      let boType = paths[0]
      let idStr = binding.value + '_' + idxObj.index
      //孙表时，获取孙表所属子表序号
      if (boType == 'sun' && idxObj.subScopeEl) {
        const subIdxObj = utils.getSubScopeElAndIndex(
          idxObj.subScopeEl.parentElement
        )
        idStr = binding.value + '_' + subIdxObj.index + '_' + idxObj.index
      }
      if (
        inst.permission &&
        inst.permission['subFields'] &&
        inst.permission['subFields'][idStr]
      ) {
        setTimeout(function() {
          if (el.__vue__) {
            el.__vue__.permission_sub = inst.permission['subFields'][idStr]
          }
        }, 0)
      }
    }
  },
}
