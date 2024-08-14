import { Loading } from 'element-ui'
import utils from 'hotent-ui/src/utils.js'
const { Base64 } = require('js-base64')
const { saveAs } = require('file-saver')
import Vue from 'vue'
import $ from 'jquery'
import _ from 'lodash'
export default {
  data() {
    return {
      bpmRunTime: this.$requestConfig.flowUrl,
      fileList: [],
      tableData: { selectRows: [], querys: '' },
      dialogExportVisible: false,
      exportData: { getType: 'all', expField: [] },
      exportSellection: [],
      searchForm: {},
      displayFields: [],
      alarmSettingMap: {},
      summaryTypeMap: {},
      queryForm: {
        queryData: '',
      },
      uploadParams: { id: [] },
      formType: false,
      labelPosition: 'left',
      incons: 'el-icon-arrow-down',
      formatterMap: {},
      options: {
        fullscreen: true,
        lock: true,
      },
      uploadError: `${this.$requestConfig.flowUrl}/runtime/photoErrorCsv/v1/uploadErrorList`,
      upoadPdfToAzure: `${this.$requestConfig.flowUrl}/runtime/blob/v1/upoadPdfToAzure`,
      uploadUnprepare: `${this.$requestConfig.flowUrl}/runtime/blob/v1/upoadToAzure`,
      summarySetting: [],
      activeNames: ['1'],
      pagination: {
        page: 1,
        pageSize: 30,
        total: 0,
      },
      rows: [],
      queryParam: {},
      allSummaryConfig: {},
      customSummary: '',
      summaryTableData: [],
    }
  },
  watch: {
    formKey: function(newVal) {
      if (newVal) {
        this.init()
      }
    },
    'tableData.selectRows': function(newVal) {
      if (newVal.length > 0) {
        let me_ = this
        me_.uploadParams.id = []
        newVal.forEach((item) => {
          me_.uploadParams.id.push(item.INSTID)
        })
      }
      _.debounce(() => {
        if (newVal && newVal.length > 0) {
          this.filterOldSummaryValByType('selected')
          this.summaryTableData.unshift({
            project: this.$t('ht.templatePreview.selectSummary'),
            key: 'selected',
            ...this.getCurrentSummaryConfig(newVal),
          })
        } else {
          this.summaryTableData = this.summaryTableData.filter(
            (item) => item.key !== 'selected'
          )
        }
        this.loadCompiledCustomSummary()
      }, 200)()
    },
    $route: 'init',
    queryView: {
      handler(newVal) {
        if (newVal.shows) {
          let displayField = utils.parseToJson(newVal.shows)
          for (var i = 0; i < displayField.length; i++) {
            if (displayField[i].hidden == 0) {
              this.displayFields.push(displayField[i])
              if (displayField[i].summaryType) {
                this.summaryTypeMap[displayField[i].fieldName] =
                  displayField[i].summaryType
              }
            }
            if (displayField[i].formater) {
              this.formatterMap[displayField[i].fieldName] =
                displayField[i].formater
            }
            if (displayField[i].alarmSetting) {
              this.alarmSettingMap[displayField[i].fieldName] =
                displayField[i].alarmSetting
            }
          }
        }
        if (newVal.summarySetting) {
          this.summarySetting = JSON.parse(newVal.summarySetting)
        }
        if (newVal && newVal.id) {
          let _me = this
          _me.queryView = newVal
          if (_me.queryView.conditions) {
            let conditionField = utils.parseToJson(_me.queryView.conditions)
            for (let i = 0; i < conditionField.length; i++) {
              var fieldName = conditionField[i].name
              this.$set(this.searchForm, fieldName, '')
            }
          }
        }
        //handle pageSize
        this.pagination.pageSize = newVal.pageSize || 30
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    filterOldSummaryValByType(type) {
      const keys = this.summaryTableData.map((item) => item.key)
      if (keys && keys.length && keys.includes(type)) {
        this.summaryTableData = this.summaryTableData.filter(
          (it) => it.key !== type
        )
      }
    },
    //获取汇总全部数据
    getAllSummary(data) {
      const allSummaryConfig = data.reduce((pre, cur) => {
        pre[cur.field] = cur.val
        return pre
      }, {})
      if (Object.keys(allSummaryConfig).length) {
        this.filterOldSummaryValByType('all')
        this.summaryTableData.push({
          project: this.$t('ht.templatePreview.allSummary'),
          key: 'all',
          ...allSummaryConfig,
        })
      }
    },
    getCurrentSummaryConfig(data) {
      let currentPageTotalConfig = {}
      if (data && data.length) {
        this.summarySetting.map((item) => {
          currentPageTotalConfig[item.field] = this.summary(
            item.method,
            item.field,
            item.decimal,
            data
          )
        })
      }
      return currentPageTotalConfig
    },
    loadCompiledCustomSummary() {
      if (!this.queryView.summaryRegionHtml) {
        return
      }
      this.$nextTick(() => {
        this.getCustomSummary(
          Base64.decode(this.queryView.summaryRegionHtml)
        ).then((result) => {
          this.customSummary = result
        })
      })
    },
    getCustomSummary(val) {
      const this_ = this
      return new Promise((resolve) => {
        const tempComponent = Vue.extend({
          data() {
            return {
              summaryResult: this_.summaryTableData,
              summaryFields: this_.summarySetting,
              currentPageRows: this_.rows,
              currentSelectedRows: this_.tableData.selectRows,
            }
          },
          template: `<div>${val}</div>`,
        })
        const component = new tempComponent().$mount()
        component.$nextTick(() => {
          resolve(component.$el.innerHTML)
        })
      })
    },
    summary(method, field, decimal, currentData) {
      const currentRows = currentData ? currentData : this.rows
      let list =
        currentRows &&
        currentRows
          .filter((item) => item[field] !== undefined && item[field] !== '')
          .map((item) => Number(item[field]))
      if (!list || list.length == 0) return
      const METHOD_MAP = {
        count: 'getCount',
        sum: 'getSum',
        min: 'getMinNum',
        max: 'getMaxNum',
        avg: 'getAverage',
      }
      if (METHOD_MAP[method]) {
        return this[METHOD_MAP[method]](list, decimal)
      }
    },
    getSum(list, decimal) {
      const sumResult = list.reduce((pre, cur) => pre + cur).toFixed(decimal)
      return sumResult ? utils.thousandBit(sumResult) : sumResult
    },
    getCount(list) {
      return list.length
    },
    getMinNum(list, decimal) {
      return Math.min(...list).toFixed(decimal)
    },
    getMaxNum(list, decimal) {
      return utils.thousandBit(Math.max(...list).toFixed(decimal))
    },
    getAverage(list, decimal) {
      return (list.reduce((pre, cur) => pre + cur) / list.length).toFixed(
        decimal
      )
    },
    //打印
    printList() {
      document.body.innerHTML = document.getElementById('printData').innerHTML
      window.print()
      location.reload()
    },
    //生成二维码

    //路由跳转
    routerPush(url) {
      this.$router.push(url)
    },
    //查看与处理流程按钮
    dispose(row) {
      let url
      if (row.TASKID) {
        //审批任务
        url = '/task/' + row.TASKID
      } else {
        //查看流程实例
        url = '/inst/' + row.INSTID
      }
      this.$router.push(url)
    },

    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.pagination.pageSize = size
      if (this.$refs.queryViewList) {
        this.$refs.queryViewList.load()
      } else {
        this.search()
      }
    },
    handleCurrentChange: function(currentPage) {
      //点击第几页
      this.pagination.page = currentPage
      if (this.$refs.queryViewList) {
        this.$refs.queryViewList.load()
      } else {
        this.search()
      }
    },
    //回车查询
    searchEnterFun: function(e) {
      let keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.pagination.page = 1
        this.search()
      }
    },
    search(param, cb) {
      !param && (param = {})
      param.pageBean = this.pagination
      //保存查询参数，用于作为导出的查询参数
      this.queryParam = { ...param }
      let obj = {
        sqlAlias: this.sqlAlias || this.queryView.sqlAlias,
        alias: this.alias || this.queryView.alias,
        param: param,
      }
      this.getQuerySqlViewByPagination(obj, cb)
    },
    getQuerySqlViewByPagination(param, cb) {
      this.$requestConfig
        .getQueryViewDataList(param)
        .then((response) => {
          this.rows = response.rows
          this.pagination.total = response.total
          this.pagination.page = response.page
          this.pagination.pageSize = response.pageSize
          this.filterOldSummaryValByType('currentPage')
          this.summaryTableData.push({
            project: this.$t('ht.templatePreview.currentPageSummary'),
            key: 'currentPage',
            ...this.getCurrentSummaryConfig(response.rows),
          })
          if (response.summary && response.summary.length) {
            this.getAllSummary(response.summary)
          }
          if (this.queryView.summaryRegionHtml) {
            this.loadCompiledCustomSummary()
          }
        })
        .finally(() => {
          cb && cb()
        })
    },
    getQueryFilter() {
      let operationMap = this.getSearchItems() //查询条件类型
      // let fieldQueryMap = this.getFieldQuery() //查询条件字段
      let specialMap = this.getSpecialMap() //获取特殊查询情况（自定义对话框）
      let querys = [] //查询条件
      let queryFilter = {}
      let pageBean = { pageBean: this.pagination }
      let params = {
        sqlAlias: this.sqlAlias || this.queryView.sqlAlias,
        alias: this.alias || this.queryView.alias,
      }
      params.pagination = pageBean
      if ($.isEmptyObject(this.searchForm)) {
        return params
      } else {
        for (var key in this.searchForm) {
          if (
            typeof this.searchForm[key] != 'undefined' &&
            this.searchForm[key] != '' &&
            this.searchForm[key] != null
          ) {
            if (this.searchForm[key] instanceof Array) {
              if (operationMap[key] === 'BETWEEN') {
                let valueArray = []
                for (let i = 0; i < this.searchForm[key].length; i++) {
                  valueArray.push(this.searchForm[key][i])
                }
                querys.push({
                  property: key,
                  value: valueArray.join(','),
                  group: 'main',
                  operation: operationMap[key],
                  relation: 'AND',
                })
              } else {
                for (let i = 0; i < this.searchForm[key].length; i++) {
                  querys.push({
                    property: key,
                    value: this.searchForm[key][i],
                    group: 'main',
                    operation: operationMap[key],
                    relation: 'AND',
                  })
                }
              }
            } else if (this.searchForm[key].includes(',') && !specialMap[key]) {
              let arr = this.searchForm[key].split(',')
              for (let i = 0; i < arr.length; i++) {
                if (
                  arr[i] == '' ||
                  arr[i] == null ||
                  typeof arr[i] == 'undefined'
                ) {
                  arr.splice(i, 1)
                  i = i - 1
                }
              }
              arr.forEach((v) => {
                querys.push({
                  property: key,
                  value: v,
                  group: 'main',
                  operation: operationMap[key],
                  relation: 'AND',
                })
              })
            } else {
              querys.push({
                property: key,
                value: this.searchForm[key],
                group: 'main',
                operation: operationMap[key],
                relation: 'AND',
              })
            }
          }
        }
        queryFilter = { pageBean: this.pagination, querys }
        params.pagination = queryFilter
        return params
      }
    },
    //获取查询条件类型
    getSearchItems() {
      let searchItems = $('.search-item')
      let operationMap = {} //查询条件类型
      let operationType = {
        LK: 'LIKE',
        EQ: 'EQUAL',
        between: 'BETWEEN',
        LFK: 'LEFT_LIKE',
        RHK: 'RIGHT_LIKE',
        NE: 'NOT_EQUAL',
        LT: 'LESS',
        LE: 'LESS_EQUAL',
        GT: 'GREAT',
        GE: 'GREAT_EQUAL',
      }
      if (searchItems) {
        for (var i = 0; i < searchItems.length; i++) {
          var operation = '='
          if (typeof $(searchItems[i]).attr('ht-query') != 'undefined') {
            //查询条件类型
            operation = $(searchItems[i]).attr('operation')
            operationMap[$(searchItems[i]).attr('ht-query')] =
              typeof operationType[operation] != 'undefined'
                ? operationType[operation]
                : operation
          } else if (
            typeof $(searchItems[i])
              .children()
              .attr('ht-query') != 'undefined'
          ) {
            //查询条件类型
            operation = $(searchItems[i])
              .children()
              .attr('operation')
            operationMap[
              $(searchItems[i])
                .children()
                .attr('ht-query')
            ] =
              typeof operationType[operation] != 'undefined'
                ? operationType[operation]
                : operation
          }
        }
      }
      return operationMap
    },
    //获取查询条件字段
    getFieldQuery() {
      let searchItems = $('.search-item')
      let fieldQueryMap = {} //查询条件字段

      if (searchItems) {
        for (var i = 0; i < searchItems.length; i++) {
          if (typeof $(searchItems[i]).attr('ht-query') != 'undefined') {
            //查询条件字段
            fieldQueryMap[$(searchItems[i]).attr('ht-query')] = $(
              searchItems[i]
            ).attr('field-query')
          } else if (
            typeof $(searchItems[i])
              .children()
              .attr('ht-query') != 'undefined'
          ) {
            //查询条件字段
            fieldQueryMap[
              $(searchItems[i])
                .children()
                .attr('ht-query')
            ] = $(searchItems[i])
              .children()
              .attr('field-query')
          }
        }
      }
      return fieldQueryMap
    },
    //获取特殊查询情况（自定义对话框）
    getSpecialMap() {
      let searchItems = $('.search-item')
      let fieldQueryMap = {} //查询条件字段

      if (searchItems) {
        for (var i = 0; i < searchItems.length; i++) {
          if (typeof $(searchItems[i]).attr('ht-query') != 'undefined') {
            //查询条件字段
            fieldQueryMap[$(searchItems[i]).attr('ht-query')] =
              typeof $(searchItems[i]).attr('special-query') != 'undefined'
                ? true
                : false
          } else if (
            typeof $(searchItems[i])
              .children()
              .attr('ht-query') != 'undefined'
          ) {
            //查询条件字段
            fieldQueryMap[
              $(searchItems[i])
                .children()
                .attr('ht-query')
            ] =
              typeof $(searchItems[i])
                .children()
                .attr('special-query') != 'undefined'
                ? true
                : false
          }
        }
      }
      return fieldQueryMap
    },
    getConditionQuery(param) {
      // let searchAll = $('.search-query')
      // let values = ''
      let querys = [] //查询条件
      let queryFilter = {}
      let pageBean = { pageBean: this.pagination }
      let params = {
        sqlAlias: this.sqlAlias || this.queryView.sqlAlias,
        alias: this.alias || this.queryView.alias,
      }

      params.pagination = pageBean
      // if (this.queryForm.queryData == '') {
      //   return params
      // } else {
      //   if (
      //     typeof $($(searchAll[0]).children()[0]).attr('ht-quick-search') !=
      //     'undefined'
      //   ) {
      //     values = $($(searchAll[0]).children()[0]).attr('ht-quick-search')
      //     var arr = values.split(',')
      //     for (let value of arr) {
      //       querys.push({
      //         property: value,
      //         value: this.queryForm.queryData,
      //         group: 'main',
      //         operation: 'LIKE',
      //         relation: 'OR',
      //       })
      //     }
      //   }
      // }
      if (param && param.querys) {
        let temquerys = [...param.querys]
        temquerys.forEach((q) => {
          // if (q.property.indexOf(prefix) == -1) {
          //   q.property = prefix + q.property
          // }
          querys.push(q)
        })
      }
      queryFilter = { pageBean: this.pagination, querys }
      params.pagination = queryFilter
      return params
    },
    //打开高级检索
    advanced() {
      this.formType = !this.formType
      if (this.formType) {
        this.incons = 'el-icon-arrow-up'
        this.queryForm.queryData = ''
      } else {
        this.incons = 'el-icon-arrow-down'
        this.searchForm = {}
      }
    },
    reset() {
      this.queryForm.queryData = ''
      this.searchForm = {}
      this.pagination.page = 1
      this.search()
    },
    handleSelectionChange(val) {
      this.tableData.selectRows = val
    },

    selectable(row) {
      if (row.BATCH_COVER_FLAG != 'YES' && row.NODEID == 'UserTask171') {
        return true
      }
      return false
    },
    //点击导出按钮
    exports() {
      this.dialogExportVisible = true
    },
    punchOrder() {
      this.$store
        .dispatch('storeProcess/downLoadToFile', 'Batchkeijyo')
        .then(() => {})
    },
    beforeAvatarUpload(file) {
      var fileName = new Array()
      fileName = file.name.split('.')
      const extension = fileName[fileName.length - 1] === 'pdf'
      if (!extension) {
        this.$message({
          message: this.$t('ht.templatePreview.templateTypeError'),
          type: 'warning',
        })
        return false
      }
      if (this.tableData.selectRows.length == 0) {
        this.$message({
          type: 'warning',
          message: this.$t('ht.templatePreview.selectUploadFile'),
        })
        return false
      }
      return true
    },

    onSuccessUpload() {
      this.$message.success(this.$t('ht.templatePreview.uploadSuccess'))
      window.location.reload()
    },
    handlePreview() {},
    //确定导出
    submitExport() {
      if (!this.exportData || this.exportData.expField.length < 1) {
        this.$message({
          type: 'info',
          message: this.$t('ht.templatePreview.selectExportField'),
        })
        return
      }
      let expField = ''
      for (var i = 0; i < this.exportData.expField.length; i++) {
        if (i > 0) {
          expField += ','
        }
        expField += this.exportData.expField[i].fieldName
      }
      expField = Base64.encode(expField).replace(/\+/g, '%2B')
      // let params = {
      //   sqlAlias: this.sqlAlias || this.queryView.sqlAlias,
      //   alias: this.alias || this.queryView.alias,
      // }
      let data = {
        sqlAlias: this.sqlAlias || this.queryView.sqlAlias,
        alias: this.alias || this.queryView.alias,
        getType: this.exportData.getType,
        expField: expField,
      }
      data.query = this.queryParam
      let loadingInstance = Loading.service({ fullscreen: true }) //开始
      this.$requestConfig
        .querySqlViewExport(data)
        .then(({ data, headers }) => {
          const fileName = decodeURIComponent(
            headers['content-disposition'].split(';')[1].split('filename=')[1]
          )
          const blob = new Blob([data])
          saveAs(blob, fileName)
        })
        .finally(() => {
          loadingInstance.close() // 结束
          this.dialogExportVisible = false
        })
    },

    //取消导出
    exportCancel() {
      this.dialogExportVisible = false
      this.exportData.expField = []
    },

    handleExportSelectionChange(val) {
      this.exportData.expField = []
      if (val) {
        this.exportData.expField = val
      }
    },

    //全选
    handleExportSelectAll(val) {
      this.exportData.expField = val
    },

    //排序
    sort(index, type) {
      if ('up' == type) {
        if (index === 0) {
          this.$message({
            message: this.$t('ht.templatePreview.isFirst'),
            type: 'warning',
          })
        } else {
          let temp = this.displayFields[index - 1]
          Vue.set(this.displayFields, index - 1, this.displayFields[index])
          Vue.set(this.displayFields, index, temp)
        }
      } else {
        if (index === this.displayFields.length - 1) {
          this.$message({
            message: this.$t('ht.templatePreview.isLast'),
            type: 'warning',
          })
        } else {
          this.isTransition = true
          let i = this.displayFields[index + 1]
          Vue.set(this.displayFields, index + 1, this.displayFields[index])
          Vue.set(this.displayFields, index, i)
        }
      }
    },

    getSubEntsByFormKey(refId) {
      let _me = this
      _me.tabs = []
      if (!_me.ents || _me.ents.length < 1) {
        this.$requestConfig
          .getSubEntsByFormKey(this.templateInfo.alias)
          .then((ents) => {
            _me.ents = ents
            this.getSubData(_me, refId)
          })
      } else {
        this.getSubData(_me, refId)
      }
    },
    getSummaries(param) {
      let _summaryTypeMap = this.summaryTypeMap
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = this.$t('ht.templatePreview.total')
          return
        }
        if (
          _summaryTypeMap[column.property] &&
          _summaryTypeMap[column.property] == 'sum'
        ) {
          const values = data.map((item) => Number(item[column.property]))
          if (!values.every((value) => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0)
          } else {
            sums[index] = 'N/A'
          }
        }
      })

      return sums
    },
    columnFormatter(row, column, cellValue) {
      let formatter = this.formatterMap[column.property]
      if (formatter) {
        try {
          var script =
            'var formatterFunction = function(row,column,cellValue){ ' +
            formatter +
            '};'
          var result = eval(script + 'formatterFunction(row,column,cellValue);')
          return result
        } catch (e) {
          return cellValue
        }
      } else {
        return cellValue
      }
    },
    dateFormatter(row, column, cellValue) {
      if (cellValue) {
        return cellValue.replace('.0', '')
      } else {
        return cellValue
      }
    },
    getAlarmColor(field, cellValue) {
      let alarmSetting = this.alarmSettingMap[field]
      let type = ''
      this.displayFields.forEach((item) => {
        if (item.fieldName === field) {
          type = item.dataType
        }
      })
      if (alarmSetting) {
        try {
          let alarmSettingJson = utils.parseToJson(alarmSetting)
          let alarmScript = ''
          for (var i = 0; i < alarmSettingJson.length; i++) {
            let alarm = alarmSettingJson[i]
            let condition = alarm.condition
            let conditionStr = ''
            for (var m = 0; m < condition.length; m++) {
              if (m > 0) {
                conditionStr += ' && '
              }
              if (type === 'number' || type === 'bigint' || type === 'int') {
                if (condition[m].op == 'indexOf' && condition[m].val) {
                  conditionStr =
                    conditionStr +
                    "'" +
                    cellValue +
                    "'.indexOf('" +
                    condition[m].val +
                    "')!=-1"
                } else if (condition[m].op == 'notIndexOf') {
                  conditionStr =
                    conditionStr +
                    "'" +
                    cellValue +
                    "'.indexOf('" +
                    condition[m].val +
                    "')==-1"
                } else {
                  conditionStr =
                    conditionStr +
                    cellValue +
                    condition[m].op +
                    condition[m].val
                }
              } else {
                if (condition[m].op == 'indexOf' && condition[m].val) {
                  conditionStr =
                    conditionStr +
                    "'" +
                    cellValue +
                    "'.indexOf('" +
                    condition[m].val +
                    "')!=-1"
                } else if (condition[m].op == 'notIndexOf') {
                  conditionStr =
                    conditionStr +
                    "'" +
                    cellValue +
                    "'.indexOf('" +
                    condition[m].val +
                    "')==-1"
                } else {
                  conditionStr =
                    conditionStr +
                    "'" +
                    cellValue +
                    "'" +
                    condition[m].op +
                    "'" +
                    condition[m].val +
                    "'"
                }
              }
              //conditionStr = conditionStr+cellValue+condition[m].op+condition[m].val;
            }
            if (i > 0) {
              alarmScript += ' else '
            }
            let colorStr = 'color:' + alarm.color + ''
            alarmScript =
              alarmScript +
              'if(' +
              conditionStr +
              "){return '" +
              colorStr +
              "';}"
          }
          if (alarmScript) {
            alarmScript += 'else{ return "";}'
            var script = 'var alarmFunction = function(){ ' + alarmScript + '};'
            var result = eval(script + 'alarmFunction();')
            return result
          } else {
            return ''
          }
        } catch (e) {
          return ''
        }
      }
    },
    showSearchPane() {
      return true
    },
  },
}
