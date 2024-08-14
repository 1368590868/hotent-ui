import utils from '@/utils.js'
import { t } from '@/locale'
var service = {
  // 对联动规则进行处理
  linkageHandler: (_me, exp) => {
    if (!_me || !_me._isVue) {
      throw t('ht.linkage.objectIsEmpty')
    }
    if (!exp || (exp.constructor !== Object && exp.constructor !== Array)) {
      throw t('ht.linkage.typeError', { exp: exp })
    }
    let linkageExp = exp
    if (exp.constructor === Object) {
      linkageExp = [exp]
    }
    const pInst = utils.getOnlineFormInstance(_me)
    if (!pInst) {
      throw t('ht.linkage.getFormError')
    }
    // 当前控件的联动轨迹
    _me.traces = {}

    //修改子表或孙表行内联动权限
    const operationEleByPermission = function(n, permission) {
      let idxObj = utils.getSubScopeElAndIndex(_me.$el)
      let tpaths = n.target.split('.')
      let fPoint =
        n.boType +
        '_' +
        tpaths[tpaths.length - 2] +
        '_' +
        tpaths[tpaths.length - 1] +
        '_' +
        idxObj.index
      let basePath = 'permission.subFields'
      //孙表时，获取孙表所属子表序号
      if (n.boType == 'sun') {
        const subIdxObj = utils.getSubScopeElAndIndex(
          idxObj.subScopeEl.parentElement
        )
        fPoint =
          n.boType +
          '_' +
          tpaths[tpaths.length - 2] +
          '_' +
          tpaths[tpaths.length - 1] +
          '_' +
          subIdxObj.index +
          '_' +
          idxObj.index
      }
      if (!pInst.permission['subFields']) {
        utils.setValueByPath(pInst, basePath, {})
      }
      utils.setValueByPath(pInst, basePath + '.' + fPoint, permission)
    }

    // 隐藏并清空子表数据
    const hideAndClearSubtable = function(subHideArrs) {
      if (!subHideArrs || subHideArrs.length == 0) {
        return
      }
      subHideArrs.forEach((item) => {
        const { target, value } = item
        const oldVal = utils.getValueByPath(pInst, target)
        // 子表之前是显示状态，现在变为隐藏状态时才清空子表数据
        if (value && oldVal !== value) {
          let tables = target.split('.')
          if (tables.length == 4) {
            for (let key in pInst.data) {
              for (let subkey in pInst.data[key]) {
                if ('sub_' + tables[2] == subkey) {
                  pInst.data[key][subkey].splice(
                    0,
                    pInst.data[key][subkey].length
                  )
                  break
                }
              }
            }
          }
        }
        utils.setValueByPath(pInst, target, value)
      })
      subHideArrs.splice(0, subHideArrs.length)
    }

    linkageExp.forEach((m) => {
      m.effect.forEach((n) => {
        // 联动会影响字段的显示、隐藏、必填等权限，以及字段的校验规则。
        // 这里先将这两部分信息存放起来作为恢复的轨迹数据
        _me.traces[n.target] = utils.getValueByPath(pInst, n.target)
      })
    })

    _me.$watch(
      'inputVal',
      function(newVal, oldVal) {
        if (newVal !== oldVal) {
          // 两个对象是否相等
          if (
            newVal &&
            newVal.constructor == Object &&
            utils.objectEquals(newVal, oldVal)
          ) {
            return
          }
          // 两个数组是否相等
          if (
            newVal &&
            newVal.constructor == Array &&
            utils.arrayEquals(newVal, oldVal)
          ) {
            return
          }
          // 在联动触发之前，先还原一次
          linkageExp.forEach((m) => {
            const subtableEffects = []
            m.effect.forEach((n) => {
              const traceValue = _me.traces[n.target]
              if (n.target) {
                if (n.target.indexOf('permission.table') != -1) {
                  //判断是否是子孙表的配置权限
                  if (traceValue !== null && traceValue !== undefined) {
                    subtableEffects.push({
                      target: n.target,
                      value: traceValue,
                    })
                  }
                } else {
                  let boType = n.boType
                  if (boType && (boType == 'sub' || boType == 'sun')) {
                    operationEleByPermission(n, traceValue)
                  } else {
                    utils.setValueByPath(pInst, n.target, traceValue)
                  }
                }
              }
              if (n.ref && n.ref.indexOf('sub_') != -1) {
                let arr = n.ref.split('.')
                //子表
                if (arr.length == 4) {
                  if (
                    n.ref &&
                    document.querySelector('[model-name="' + n.ref + '"]')
                  ) {
                    let idxObj = utils.getSubScopeElAndIndex(_me.$el) //获取子表对象（含下标)
                    let subModeNameArray = document.querySelectorAll(
                      '[model-name="' + n.ref + '"]'
                    )
                    subModeNameArray[
                      idxObj.index
                    ].__vue__._data.newValidate = null
                  }
                }
              } else {
                //主表
                if (
                  n.ref &&
                  document.querySelector('[model-name="' + n.ref + '"]')
                ) {
                  document.querySelector(
                    '[model-name="' + n.ref + '"]'
                  ).__vue__._data.newValidate = null
                }
              }
            })
            // 隐藏并清空子孙表数据的处理
            hideAndClearSubtable(subtableEffects)
          })

          linkageExp.forEach((m) => {
            // 是否匹配联动要求的值
            let match = false
            if (newVal) {
              if (newVal.constructor === String) {
                match = newVal === m.value
              } else if (newVal.constructor === Array) {
                match = newVal.some((v) => v === m.value)
                // 如果是复选框触发联动，在复选框只读时返回的是选项的label，需要通过label获取选项value
                if (!match && _me.$isCheckbox && _me.getOptionKeyByValue) {
                  match = _me
                    .getOptionKeyByValue(newVal)
                    .some((v) => v === m.value)
                }
              }
            }
            const subHideArrs = []
            m.effect.forEach((n) => {
              if (match) {
                switch (n.type) {
                  // 直接赋值
                  case '=': {
                    //如果表单是只读的情况下,控件的必填与可编辑替换成只读
                    let v = n.value
                    if (pInst.isLook && (n.value === 'b' || n.value === 'w')) {
                      v = 'r'
                    }
                    let boType = n.boType
                    if (boType && (boType == 'sub' || boType == 'sun')) {
                      operationEleByPermission(n, v)
                    } else {
                      if (
                        n.target &&
                        n.target.indexOf('permission.table') != -1
                      ) {
                        //判断是否是子孙表的配置权限
                        if (v !== null && v !== undefined && !this.$hideTip) {
                          subHideArrs.push({ target: n.target, value: v })
                          // 隐藏并清空子孙表数据的处理
                          hideAndClearSubtable(subHideArrs)
                        }
                      } else {
                        utils.setValueByPath(pInst, n.target, v)
                      }
                    }
                    break
                  }
                  // 追加验证规则
                  case '+':
                    if (
                      !n.value ||
                      (n.value.constructor !== Object &&
                        n.value.constructor !== String)
                    ) {
                      throw t('ht.linkage.appendValidationRulesError', {
                        value: n.value,
                      })
                    }
                    if (n.target) {
                      // 获取旧的校验规则
                      const oldValid = utils.getValueByPath(pInst, n.target)
                      // 将旧规则与新规则进行融合
                      const newValid = utils.mergeValidate(oldValid, n.value)
                      // 更新融合后的规则
                      utils.setValueByPath(pInst, n.target, newValid)
                    }
                    if (n.ref) {
                      setTimeout(() => {
                        if (
                          document.querySelector('[model-name="' + n.ref + '"]')
                        ) {
                          if (n.ref && n.ref.indexOf('sub_') != -1) {
                            let arr = n.ref.split('.')
                            //子表
                            if (arr.length == 4) {
                              let idxObj = utils.getSubScopeElAndIndex(_me.$el)
                              let subModeNameArray = document.querySelectorAll(
                                '[model-name="' + n.ref + '"]'
                              )
                              let targetVnode =
                                subModeNameArray[idxObj.index].__vue__
                              let oldValid = targetVnode.validate
                              // 将旧规则与新规则进行融合
                              const newValid = utils.mergeValidate(
                                oldValid,
                                n.value
                              )
                              targetVnode._data.newValidate = newValid
                            }
                          } else {
                            //主表
                            let targetVnode = document.querySelector(
                              '[model-name="' + n.ref + '"]'
                            ).__vue__
                            let oldValid = targetVnode.validate
                            // 将旧规则与新规则进行融合

                            if (
                              n.value !== null &&
                              n.value !== undefined &&
                              n.value.indexOf('confirmed:') > -1
                            ) {
                              let confirmPath = n.value.replace(
                                'confirmed:',
                                ''
                              )
                              n.value =
                                'confirmed:' +
                                utils.getValueByPath(pInst, confirmPath)
                              let confirmVnode = document.querySelector(
                                '[model-name="' + confirmPath + '"]'
                              ).__vue__
                              confirmVnode.$watch('inputVal', function(n) {
                                const newValid = utils.mergeValidate(
                                  oldValid,
                                  'confirmed:' + n
                                )
                                targetVnode._data.newValidate = newValid
                              })
                            }
                            const newValid = utils.mergeValidate(
                              oldValid,
                              n.value
                            )
                            targetVnode._data.newValidate = newValid
                          }
                        }
                      }, 100)
                    }
                    break
                  // 减少验证规则
                  case '-':
                    if (
                      !n.value ||
                      (n.value.constructor !== Object &&
                        n.value.constructor !== String)
                    ) {
                      throw t('ht.linkage.decreaseValidationRulesError', {
                        value: n.value,
                      })
                    }
                    if (n.target) {
                      // 获取旧的规则
                      const oldV = utils.getValueByPath(pInst, n.target)
                      // 从旧的规则移除指定规则
                      const newValidate = utils.reduceValidate(oldV, n.value)
                      // 更新规则
                      utils.setValueByPath(pInst, n.target, newValidate)
                    }

                    if (n.ref) {
                      const oldValid = pInst.$refs[n.ref].validate
                      // 将旧规则与新规则进行融合
                      const newValid = utils.reduceValidate(oldValid, n.value)
                      pInst.$refs[n.ref].newValidate = newValid
                    }

                    break
                }
              }
            })
          })
        }
      },
      { immediate: true }
    )
  },
}

export default service
