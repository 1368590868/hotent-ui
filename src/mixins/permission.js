import _ from 'lodash'
import utils from '@/utils.js'

// 组件权限和校验规则
export default {
  props: {
    validate: [Object, String],
    permission: {
      type: String,
      default: 'w',
      validator: function(value) {
        return ['b', 'w', 'r', 'n'].indexOf(value) !== -1
      },
    },
  },
  data() {
    return {
      // 控件的权限（兼容子表）
      permission_sub: null,
      // 是否在子表中
      sub_work: false,
      writeable: true,
      formIsView: false,
    }
  },
  computed: {
    inputWriteable: function() {
      return this.writeable
        ? utils.getWriteable(this.permission_sub)
        : this.writeable
    },
    inputValidate: function() {
      return utils.addRequiredOrNot(this.permission_sub, this.validate, this)
    },
  },
  watch: {
    permission: {
      handler(newVal) {
        if (!this.sub_work) {
          this.permission_sub = _.cloneDeep(newVal)
        }
        this.$root.$emit('current-required-item', { [this.modelName]: newVal })
      },
    },
    formIsView: {
      handler(newVal) {
        if (
          newVal &&
          (this.permission_sub == 'w' || this.permission_sub == 'b')
        ) {
          this.writeable = false
        }
      },
    },
  },
  created() {
    this.permission_sub = _.cloneDeep(this.permission)
    this.$validator = this.$root.$validator

    let parent = this.$parent || this.$root
    let name = parent.$options.componentName

    while (parent && (!name || name !== 'HtRuntimeTemplate')) {
      parent = parent.$parent

      if (parent) {
        name = parent.$options.componentName
      }
    }
    if (parent) {
      this.formIsView = parent.$options.propsData.isView
    }
  },
  mounted() {
    setTimeout(() => {
      const { subScopeEl } = utils.getSubScopeElAndIndex(this.$el)
      // 当前控件在子表行中，且配置了该行为只读
      if (subScopeEl) {
        if (
          subScopeEl.getAttribute('row_readonly') == 'true' ||
          subScopeEl.getAttribute('row_readonly') === true
        ) {
          this.writeable = false
        } else {
          const className = Array.prototype.find.call(
            subScopeEl.classList,
            (item) => item.startsWith('row_readonly__')
          )
          if (className && className == 'row_readonly__true') {
            this.writeable = false
          }
        }
      }
    }, 50)
  },
}
