import utils from '@/utils.js'
import FormMath from '@/math.js'

// 判断输入框是否作为计算字段，是则添加监听
export default {
  componentUpdated: function(el, binding, vnode) {
    const inst = vnode.context
    if (!inst.$vnode.data.model) {
      return
    }
    let elAttr = inst.$vnode.data.model.expression

    if (
      inst.$vnode &&
      inst.$vnode.componentOptions &&
      inst.$vnode.componentOptions.propsData &&
      inst.$vnode.componentOptions.propsData.modelExpression
    ) {
      elAttr = inst.$vnode.componentOptions.propsData.modelExpression
    }

    if (elAttr && !inst._expressInit) {
      inst._expressInit = true
      // 子表每一行数据作用域所在的dom元素
      let { subScopeEl, subname } = utils.getSubScopeElAndIndex(el)
      let aliasElAttr = null
      // 子表数据，需要找到配置了data-subname的元素
      if (subScopeEl) {
        if (!subname) {
          throw '无法获取到当前子表前缀'
        }
        const elAttrAry = elAttr.split('.'),
          elAttrArySize = elAttrAry.length
        if (elAttrArySize < 1) {
          throw `子表中的数据绑定表达式${elAttr}错误`
        }
        aliasElAttr = `${subname}.${elAttrAry[elAttrArySize - 1]}`
      }
      const p = utils.getOnlineFormInstance(inst)
      if (
        p.watchMap &&
        (p.watchMap.has(elAttr) || p.watchMap.has(aliasElAttr))
      ) {
        if (!inst._watchers.some((m) => m.expression === 'inputVal')) {
          inst.$watch(
            'inputVal',
            function(newVal, oldVal) {
              if (newVal !== oldVal) {
                const elAttrExpList = p.watchMap.get(elAttr) || []
                const aliasElAttrExpList = p.watchMap.get(aliasElAttr) || []
                const unionExpList = elAttrExpList.concat(aliasElAttrExpList)
                const attrExpObj = {}
                unionExpList.forEach((item) => {
                  let result = 0
                  const t = item.target
                  const targetList = attrExpObj[t] || []
                  if (targetList.indexOf(item.exp) < 0) {
                    targetList.push(item.exp)
                    attrExpObj[t] = targetList
                    if (subScopeEl && t.split('.').length == 2) {
                      const index = subScopeEl.dataset['index']
                      if (index === undefined) {
                        throw '获取不到当前子表行的索引，无法完成计算.'
                      }
                      result = FormMath.calcSubExpValue(
                        item.exp,
                        p,
                        subname,
                        index
                      )
                      p.$emit(t, { result, index })
                    } else {
                      result = FormMath.calcExpValue(item.exp, p)
                      p.$emit(t, { result })
                    }
                  }
                })
              }
            },
            { immediate: true }
          )
        }
      }
    }
  },
}
