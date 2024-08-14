function regionQuerySelector(querySelector) {
  const regionInsts = []
  if (!querySelector) {
    return regionInsts
  }
  // 找到当前vue实例下指定 选择器 的所有HTMLElement元素，如果该元素是vue实例则放入数组
  this.$el.querySelectorAll(querySelector).forEach((el) => {
    el.__vue__ && regionInsts.push(el.__vue__)
  })
  return regionInsts
}

export default {
  methods: {
    // 区域校验  querySelector:是要校验区域的HTMLElement选择器；scopeName是触发校验的区域，不传时整个表单触发校验。
    validateRegion(querySelector, scopeName) {
      return new Promise((resolve, reject) => {
        const regionInsts = regionQuerySelector.call(this, querySelector)
        if (regionInsts.length == 0) {
          reject(
            this.$t('ht.regionValidator.errorMsg', {
              querySelector: querySelector,
            })
          )
        }
        const errorItems = []
        let validatePromise = null
        if (scopeName) {
          validatePromise = this.$root.$validator.validateAll(scopeName)
        } else {
          validatePromise = this.$root.$validator.validate()
        }
        validatePromise.then((result) => {
          if (!result) {
            // 如果触发校验的字段中，有字段处于所指定的预期，则将该字段放入errorItems数组 日期、时间范围时name属性会被截取，此处消除日期范围不校验的bug问题
            this.$validator.errors.items.forEach((item) => {
              regionInsts.forEach((itemInst) => {
                const itemEl = itemInst.$el
                if (
                  itemEl.querySelectorAll(`[name='${item.field}']`).length >
                    0 ||
                  itemEl.querySelectorAll(
                    `[name='${item.field.substring(0, 1)}']`
                  ).length > 0 ||
                  itemEl.querySelectorAll(
                    `[name='${item.field.substring(1, 2)}']`
                  ).length > 0
                ) {
                  errorItems.push(item)
                }
              })
            })
          }
          // 拼接提示消息
          const messages = []
          errorItems.forEach((item) => {
            const index = item.field.indexOf('__')
            const fieldLabel =
              index == 0 ? item.field : item.field.substr(0, index)
            messages.push(`${fieldLabel} ${item.msg}`)
          })
          if (messages.length > 0) {
            this.$notify.error({
              title: this.$t('ht.common.warmTips'),
              dangerouslyUseHTMLString: true,
              message: messages.join('<br/>'),
            })
          }
          resolve(errorItems)
        })
      })
    },
  },
}
