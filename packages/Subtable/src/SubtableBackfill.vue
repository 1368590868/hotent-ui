<template>
  <span></span>
</template>
<script>
  import utils from '@/utils.js'
  import CustomQuery from '@/services/CustomQuery'

  export default {
    name: 'HtSubtableBackfill',
    props: {
      customQuery: {
        type: Object,
        default: () => {
          return {}
        },
      },
      maxRow: Number,
      initFillDataType: String,
      extendProp: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    data() {
      return {
        dataPath: [],
      }
    },
    watch: {
      extendProp: function(newVal) {
        if (newVal) {
          this.initSubData()
        }
      },
    },
    mounted() {
      this.initSubData()
    },
    methods: {
      initSubData() {
        let _this = this
        if (!this.extendProp.initFillData) {
          return
        }
        if (
          this.customQuery.alias &&
          this.customQuery.resultfield &&
          this.customQuery.resultfield.length
        ) {
          // 如果初始化类型是空时 此处不进行请求
          this.dataPath = this.getDataPath(this.customQuery.resultfield)
          const formInst = utils.getOnlineFormInstance(this)
          if (
            this.dataPath &&
            this.initFillDataType === 'empty' &&
            formInst['data'][this.dataPath[0]][this.dataPath[1]].length
          ) {
            return
          }
          let params = this.prepareLoadParams(this.customQuery.conditionfield)
          const loading = this.$loading({
            lock: true,
            text: this.$t('ht.subTable.loadingText'),
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)',
          })
          CustomQuery.load(this.customQuery.alias, params).then(
            (rows) => {
              if (loading) {
                loading.close()
              }
              this.backfill(
                this.maxRow > 0 && rows.length > this.maxRow
                  ? rows.splice(0, this.maxRow)
                  : rows
              )
            },
            () => {
              if (loading) {
                loading.close()
              }
            }
          )
        }
      },
      getDataPath(data) {
        let path = []
        data.forEach((item) => {
          if (item.fieldPath) {
            let pathArr = item.fieldPath.split('.')
            if (pathArr.length > 1) {
              path = pathArr
            }
          }
        })
        return path
      },
      backfill(rows) {
        const formInst = utils.getOnlineFormInstance(this)
        if (this.customQuery.resultfield) {
          if (this.initFillDataType === 'cover') {
            formInst['data'][this.dataPath[0]][this.dataPath[1]] = []
          }
          rows.forEach((item) => {
            let subLineData = {}
            let targetArray = null
            this.customQuery.resultfield.forEach((sub) => {
              if (sub.fieldPath) {
                targetArray = sub.fieldPath.split('.')
                subLineData[
                  targetArray[targetArray.length - 1]
                ] = !utils.isEmpty(item[sub.field]) ? item[sub.field] : ''
              }
            })
            if (Object.keys(subLineData).length) {
              // 回填时默认展开逻辑添加
              subLineData.sub_guid = this.guid()
              this.$root.$emit('add-new-collapse-item', subLineData.sub_guid)
              formInst['data'][targetArray[0]][targetArray[1]].push(subLineData)
            }
          })
        }
      },
      guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
          c
        ) {
          var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        })
      },
      // 准备查询参数
      prepareLoadParams(condition) {
        let params = {}
        if (condition && condition.length) {
          const formInst = utils.getOnlineFormInstance(this)
          condition.forEach((item) => {
            if (item.fieldPath) {
              let arr = item.fieldPath.split('.')
              if (!utils.isEmpty(formInst[arr[0]][arr[1]][arr[2]]))
                params[item.field] = formInst[arr[0]][arr[1]][arr[2]]
            }
          })
        }
        return params
      },
    },
  }
</script>
