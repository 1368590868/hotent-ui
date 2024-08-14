<template>
  <!-- Global Query -->
  <span />
</template>
<script>
  import utils from '@/utils.js'
  import CustomQuery from '@/services/CustomQuery.js'

  export default {
    name: 'HtGlobalQuery',
    props: {
      queryJson: {
        type: Array,
        default: () => {
          return []
        },
      },
    },
    data() {
      return {
        formInst: null,
        subOldValueMap: {},
        subQueryConfig: [],
      }
    },
    mounted() {
      if (!this.formInst) {
        this.formInst = utils.getOnlineFormInstance(this.$parent)
      }
      if (this.queryJson.length > 0) {
        let _this = this
        this.queryJson.forEach((item) => {
          if (item.triggerTime) {
            let resultBind = {}
            if (item.resultfield && item.resultfield.length > 0) {
              item.resultfield.forEach((field) => {
                resultBind[field.field] = field.fieldPath
              })
            }
            if (item.triggerTime.indexOf('change') != -1 && item.triggerField) {
              //值变化触发
              if (item.entType === 'main') {
                //主表
                _this.formInst.$watch(
                  item.triggerField,
                  function(newVal, oldVal) {
                    if (
                      (newVal != '' || oldVal != undefined) &&
                      newVal !== oldVal
                    ) {
                      _this.doQuery(
                        item.alias,
                        item.conditionfield,
                        resultBind,
                        null
                      )
                    }
                  }
                  // { immediate: true }
                )
              } else {
                //子表
                const triggerPath = item.triggerField.split('.')
                const triggerField = triggerPath[triggerPath.length - 1]
                _this.subOldValueMap[item.subPath] = []
                item.triggerPath = triggerPath
                item.triggerField = triggerField
                item.resultBind = resultBind
                _this.subQueryConfig.push(item)

                _this.formInst.$watch(
                  'data.' + item.subPath,
                  function(newVal) {
                    let myOldVal = _this.subOldValueMap[item.subPath]
                    _this.subQueryConfig
                      .filter((i) => {
                        return i.subPath === item.subPath
                      })
                      .forEach((subItem) => {
                        if (newVal !== myOldVal) {
                          try {
                            if (
                              newVal &&
                              newVal.length == 1 &&
                              (!newVal || newVal.length == 0)
                            ) {
                              //新增
                              //取子表的最后一行
                              if (subItem.triggerTime.indexOf('load') != -1) {
                                //如果是初始化加载，新增时才触发
                                _this.doQuery(
                                  subItem.alias,
                                  subItem.conditionfield,
                                  subItem.resultBind,
                                  newVal.length - 1
                                )
                              }
                            } else if (newVal.length > myOldVal.length) {
                              for (
                                let i = myOldVal.length;
                                i < newVal.length;
                                i++
                              ) {
                                _this.doQuery(
                                  subItem.alias,
                                  subItem.conditionfield,
                                  subItem.resultBind,
                                  i
                                )
                              }
                            } else if (myOldVal.length > newVal.length) {
                              //删除
                              //不用做处理
                            } else if (
                              newVal.length > 0 &&
                              myOldVal.length === newVal.length
                            ) {
                              //值变化
                              for (let i = 0; i < newVal.length; i++) {
                                if (
                                  newVal[i][subItem.triggerField] !==
                                  myOldVal[i][subItem.triggerField]
                                ) {
                                  _this.doQuery(
                                    subItem.alias,
                                    subItem.conditionfield,
                                    subItem.resultBind,
                                    i
                                  )
                                }
                              }
                            }
                          } catch (error) {
                            console.error(
                              this.$t('ht.global.errorMsg') + ':' + error
                            )
                          }
                          _this.subOldValueMap[subItem.subPath] = JSON.parse(
                            JSON.stringify(newVal)
                          )
                        }
                      })
                  },
                  { deep: true }
                )
              }
            }
            if (
              item.triggerTime.indexOf('load') != -1 &&
              item.entType === 'main'
            ) {
              //加载时触发 & 不包含子表
              if (item.noValuabletrigger && item.noValuableField) {
                //有值不触发
                const val = utils.getValueByPath(
                  this.formInst,
                  item.noValuableField
                )
                if (val != '' && val != undefined && val != null) {
                  return
                }
              }
              setTimeout(() => {
                _this.doQuery(item.alias, item.conditionfield, resultBind, null)
              }, 100)
            }
          }
        })
      }
    },
    methods: {
      doQuery(alias, params, resultBind, index) {
        try {
          let _this = this
          let queryParams = {}
          if (params && params.length > 0) {
            params.forEach((item) => {
              queryParams[item.field] = null
              if (!item.defaultValue && item.fieldPath) {
                const val = utils.getValueByPath(
                  this.formInst,
                  item.fieldPath,
                  index
                )
                queryParams[item.field] = val || item.emptyValue // emptyValue-关联查询绑定参数为空时的绑定值
              }
            })
          }
          CustomQuery.load(alias, queryParams).then((res) => {
            let data = []
            if (res.constructor == Object) {
              data = res.listKey ? res[res.listKey] : res.rows
            } else {
              data = res
            }
            if (
              data &&
              data.constructor == Array &&
              resultBind &&
              resultBind.constructor == Object
            ) {
              // 关联查询值回绑时，默认获取返回的第一条记录
              Object.keys(resultBind).forEach((k) => {
                const path = resultBind[k]
                const value = _this.getBindValue(data, k)
                // 主表
                if (index == null) {
                  utils.setValueByPath(this.formInst, path, value)
                }
                // 子表
                else {
                  utils.setValueByPath(this.formInst, path, value, index)
                }
              })
            }
          })
        } catch (error) {
          console.error(this.$t('ht.global.errorMsg') + ':' + error)
        }
      },
      getBindValue(data, key) {
        //当系统接到触发请求要带出数据时，发现有多个查询结果，此时将多个结果以逗号分隔的模式全部都带出来
        let value = []
        data.forEach((item) => {
          if (!utils.isEmpty(item[key])) {
            value.push(item[key])
          }
        })
        return value.join(',')
      },
    },
  }
</script>
