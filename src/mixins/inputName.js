import utils from '@/utils.js'
import { t } from '@/locale'

// 组件的name属性
export default {
  props: {
    name: String,
    modelName: String,
    size: {
      type: String,
      validator(val) {
        return ['large', 'medium', 'small', 'mini'].includes(val)
      },
    },
    placeholder: {
      type: String,
      default() {
        return t('ht.common.enter')
      },
    },
  },
  data() {
    return {
      inputNameLast: '',
    }
  },
  computed: {
    inputSize() {
      return this.size || this.$HOTENT.size
    },
    inputName: function() {
      // 增加第一条数据时防止多次进入重复创建
      if (this.inputNameLast && this.inputNameLast.includes('__')) {
        return this.inputNameLast
      }
      this.inputNameLast = this.name
        ? `${this.name}__${utils.getName()}`
        : utils.getName()
      return this.inputNameLast
    },
  },
}
