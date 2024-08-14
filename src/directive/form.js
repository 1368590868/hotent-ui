// 广播事件发送到指定componentName的组件
function broadcast(componentName, eventName, params) {
  this.$children.forEach((child) => {
    var name = child.$options.componentName

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params))
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]))
    }
  })
}

// 广播事件发送到指定componentGroup的组件
function broadcastGroup(componentGroup, eventName, params) {
  this.$children.forEach((child) => {
    var name = child.$options.componentGroup

    if (name === componentGroup) {
      child.$emit.apply(child, [eventName].concat(params))
    } else {
      broadcastGroup.apply(child, [componentGroup, eventName].concat([params]))
    }
  })
}

function setFormExtend(el, binding) {
  // 在注入的elForm对象上挂载表单扩展属性
  const elFormInst = el.__vue__
  if (elFormInst && binding.value) {
    elFormInst.$nextTick(() => {
      broadcast.apply(elFormInst, [
        'HtFormItem',
        'formExtend:update',
        binding.value,
      ])
      broadcast.apply(elFormInst, [
        'HtReadonlyInput',
        'formExtend:update',
        binding.value,
      ])
      broadcastGroup.apply(elFormInst, [
        'HtFormInputs',
        'formExtend:update',
        binding.value,
      ])
    })
  }
}

// 表单指令，会在表单的vue实例上添加一个map，用以存放数学运算的表达式
export default {
  bind: function(el, binding, vnode) {
    // 修正vee-validate中对于元素上的aria-invalid属性更新的问题
    const judgeAriaInvalid = (fields) => {
      if (!fields || fields.length == 0) {
        return
      }

      const fieldInst = fields.items[0]
      const includes = function(collection, item) {
        return collection.indexOf(item) !== -1
      }
      const isCheckboxOrRadioInput = function(el) {
        return includes(['radio', 'checkbox'], el.type)
      }
      const isCallable = function(func) {
        return typeof func === 'function'
      }
      Object.getPrototypeOf(
        fieldInst
      ).constructor.prototype.updateAriaAttrs = function updateAriaAttrs() {
        var this$1 = this

        if (!this.aria || !this.el || !isCallable(this.el.setAttribute)) {
          return
        }

        var applyAriaAttrs = function(el) {
          el.setAttribute('aria-required', this$1.isRequired ? 'true' : 'false')
          el.setAttribute(
            'aria-invalid',
            this$1.flags.invalid ? 'true' : 'false'
          )
          // 组件初次加载时，既不显示验证失败也不显示验证成功
          if (this$1.flags.invalid == null) {
            el.removeAttribute('aria-invalid')
          }
        }

        if (!isCheckboxOrRadioInput(this.el)) {
          applyAriaAttrs(this.el)
          return
        }

        var els = document.querySelectorAll(
          'input[name="' + this.el.name + '"]'
        )
        window.toArray(els).forEach(applyAriaAttrs)
      }
    }

    const inst = vnode.context

    inst.$root.$validator && judgeAriaInvalid(inst.$root.$validator.fields)
    if (inst && !inst.hasOwnProperty('watchMap')) {
      inst['watchMap'] = new Map()
      inst.$watch(
        'data',
        function() {
          inst.$emit('updateData')
        },
        { deep: true }
      )
    }

    setFormExtend(el, binding)
  },
  update: function(el, binding) {
    setFormExtend(el, binding)
  },
}
