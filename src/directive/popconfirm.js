import Vue from 'vue'

const getPopconfirm = function(el, binding) {
  const attrs = binding.value
  const opts = {
    content: '确定执行该操作？',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    confirmButtonType: 'primary',
    cancelButtonType: 'default',
    icon: 'question',
    iconColor: '#f90',
    hideIcon: false,
    before: null,
  }
  let args = null
  if (typeof attrs == 'function') {
    opts.confirm = attrs
    args = binding.arg
  } else if (typeof attrs == 'object') {
    Object.assign(opts, attrs)
    args = { ...attrs }
  } else {
    throw `v-popconfirm需要提供表达式或者object对象`
  }
  // 创建构造器
  const popconfirm = Vue.extend({
    data() {
      return {
        visible: false,
        opts,
        iconStyle: {
          marginRight: '10px',
          color: opts.iconColor,
        },
      }
    },
    methods: {
      confirm() {
        opts.confirm && opts.confirm.apply(null, [args])
        popComp.doClose()
      },
      cancel() {
        popComp.doClose()
      },
    },
    template: `<el-popover v-bind="opts" v-model="visible" trigger="click">
    <div class="el-popconfirm">
      <p class="el-popconfirm__main">
        <ht-icon v-if="!opts.hideIcon" :name="opts.icon" :style="iconStyle" />
        ${opts.content}
      </p>
      <div class="el-popconfirm__action">
        <el-button size="mini" :type="opts.confirmButtonType" @click="confirm">{{opts.confirmButtonText}}</el-button>
        <el-button size="mini" :type="opts.cancelButtonType" @click="cancel">{{opts.cancelButtonText}}</el-button>
      </div>
    </div>
  </el-popover>`,
  })
  // 创建一个 popconfirm 实例并返回 dom 节点
  const component = new popconfirm().$mount()
  const popComp = component.$children[0]
  popComp.$refs.reference = el
  el.addEventListener('click', () => {
    if (opts.before) {
      const result = opts.before.apply(null, [args])
      if (result && result.constructor == Promise) {
        result.then(() => popComp.doShow())
      } else if (result && result === true) {
        popComp.doShow()
      }
    } else {
      popComp.doShow()
    }
  })
  return component.$el
}

export default {
  bind: function(el, binding) {
    if (el.hasPopconfirm) return
    const popconfirmEle = getPopconfirm(el, binding)
    el.appendChild(popconfirmEle)
    el.hasPopconfirm = true
  },
}
