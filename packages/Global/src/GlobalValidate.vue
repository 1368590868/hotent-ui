<template>
  <div>
    <slot></slot>
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import emitter from '@/mixins/emitter.js'
  const { Base64 } = require('js-base64')
  export default {
    name: 'HtGlobalValidate',
    componentName: 'HtGlobalValidate',
    mixins: [emitter],
    props: {
      verificationJson: String,
      data: Object,
    },
    data() {
      return {
        verificationList: [],
      }
    },
    created() {
      let _this = this
      this.$on('global-validate', () => {
        _this.validate()
      })
    },
    mounted() {
      if (this.verificationJson) {
        this.verificationList = JSON.parse(Base64.decode(this.verificationJson))
      }
    },
    methods: {
      validate() {
        let result = true
        if (this.verificationList && this.verificationList.length > 0) {
          let pInst = utils.getOnlineFormInstance(this)
          let _this = this
          let messages = []
          this.verificationList.forEach((item) => {
            _this.execFun(pInst, item, messages)
          })
          if (messages.length > 0) {
            result = false
            this.$notify.error({
              title: this.$t('ht.common.warmTips'),
              dangerouslyUseHTMLString: true,
              message: messages.join('<br/>'),
            })
          }
        }
        if (result) {
          result = this.validateTable()
        }
        this.dispatch('HtOnlineForm', 'global-validate-result', [result])
      },
      execFun(pInst, item, messages) {
        let formulasDiyJs = item.formulasDiyJs
        if (formulasDiyJs.indexOf('return') === -1) {
          formulasDiyJs = 'return ' + formulasDiyJs
        }
        let Fn = Function('data', '_me', '$Formulas', formulasDiyJs) //一个变量指向Function，防止有些前端编译工具报错
        try {
          let result = Fn(pInst.data, pInst, pInst.$Formulas)
          if (!result) {
            messages.push(item.tips)
          }
        } catch (err) {
          messages.push(
            this.$t('ht.global.validateErrorMsg', { name: item.name })
          )
        }
      },
      validateTable() {
        const tables = utils.getOnlineFormInstance(this).permission.table //获取table权限
        const boData = utils.getOnlineFormInstance(this).data //获取表单bo对象
        let newBoData = {}
        //获取所有表单字段对象
        for (let k in boData) {
          newBoData = boData[k]
        }
        for (let key in tables) {
          const subData = newBoData['sub_' + key]
          //如果有导入属性，则表明不是子表而是数据报表，不做必填校验
          if (tables[key] && tables[key].hasOwnProperty('export')) {
            continue
          }
          if ([true, 'true'].includes(tables[key].required) && subData) {
            if (subData.length == 0) {
              this.$message({
                message: this.$t('ht.global.subTableRequired'),
                type: 'warning',
              })
              return false
            } else if (
              subData.length > 0 &&
              this.validateSunTable(tables, subData).length > 0
            ) {
              this.$message({
                message: this.$t('ht.global.sunTableRequired'),
                type: 'warning',
              })
              return false
            }
          }
        }
        return true
      },
      validateSunTable(tables, subData) {
        const requiredTableKeyList = []
        const notPassingSunTableKey = []
        //获取必填子表/孙表字段名
        for (let key in tables) {
          if ([true, 'true'].includes(tables[key].required)) {
            requiredTableKeyList.push(`sub_${key}`)
          }
        }
        subData.map((item) => {
          for (let sunKey in item) {
            if (
              requiredTableKeyList.includes(sunKey) &&
              item[sunKey].length <= 0
            ) {
              notPassingSunTableKey.push(sunKey)
            }
          }
        })
        return notPassingSunTableKey
      },
    },
  }
</script>
<style lang="scss" scoped></style>
