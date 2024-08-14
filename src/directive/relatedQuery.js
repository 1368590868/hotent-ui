import utils from '@/utils.js'
import CustomQuery from '@/services/CustomQuery.js'
export default {
  bind: function(el, binding, vnode) {
    const inst = vnode.context
    let exp = null
    if (binding.expression) {
      exp = utils.parseToJson(binding.expression)
    }
    if (inst) {
      // 上一次关联查询条件（一个组件可以绑定多个关联查询，）
      inst.preRelatedQueryParams = {}
      inst.$on('related-query:load', (alias, params, resultBind) => {
        params = params || {}
        // 是否执行查询
        let doLoad = true
        if (exp && exp.cache) {
          // 相比上一次，查询参数是否有变化
          const changed = !utils.objectEquals(
            inst.preRelatedQueryParams[alias],
            params
          )
          if (changed) {
            doLoad = true
            inst.preRelatedQueryParams[alias] = params
          } else {
            doLoad = false
          }
        }
        doLoad &&
          CustomQuery.load(alias, params).then((data) => {
            if (
              data &&
              data.constructor == Array &&
              data.length > 0 &&
              resultBind &&
              resultBind.constructor == Object
            ) {
              // 获取当前控件是否在子表某行中
              let { index } = utils.getSubScopeElAndIndex(el)

              const pInst = utils.getOnlineFormInstance(inst)
              // 关联查询值回绑时，默认获取返回的第一条记录
              const singleData = data[0]
              Object.keys(resultBind).forEach((k) => {
                const path = resultBind[k]
                // 主表
                if (index == null) {
                  utils.setValueByPath(pInst, path, singleData[k])
                }
                // 子表
                else {
                  utils.setValueByPath(pInst, path, singleData[k], index)
                }
              })
            }
          })
      })
    }
  },
}
