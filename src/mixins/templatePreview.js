import Vue from 'vue'
import { Loading } from 'element-ui'
import utils from 'hotent-ui/src/utils.js'
import { createObjectURL } from 'hotent-ui/src/util/brower.js'
const { Base64 } = require('js-base64')
import JSZip from 'jszip'
import html2canvas from 'html2canvas'
import $ from 'jquery'
const axios = require('axios')
const { saveAs } = require('file-saver')
import _ from 'lodash'

const req = function(url, data = {}, option = {}) {
  const requestData = {
    url: url,
    data: data,
    method: option.method || 'GET',
    params: option.params || {},
    onUploadProgress: option.onUploadProgress || null,
    headers: option.headers || '',
    responseType: option.responseType || 'json',
  }
  return axios(requestData)
}

export default {
  props: {
    templateKey: String,
    defKey: String,
    taskType: {
      type: String,
      default: '',
    },
    dataView: Object,
    isJoinFlow: {
      type: Boolean,
      default: false,
    },
    parameterqQuerys: String,
  },
  data() {
    return {
      treeQuerys: [],
      alias_new: 'statement',
      loading: false,
      QRCodeurl: '',
      QRCodeDialog: false,
      html: '',
      tableData: {
        selectRows: [],
        querys: '',
      },
      dialogExportVisible: false,
      exportData: {
        getType: 'all',
        expField: [],
      },
      displayFields: [],
      exportSellection: [],
      searchForm: {},
      queryForm: {
        queryData: '',
      },
      formType: false,
      labelPosition: 'left',
      incons: 'el-icon-arrow-down',
      options: {
        fullscreen: true,
        lock: true,
      },
      rowTemplateId: null,
      rowId: null,
      QRCodeShow: true,
      asideShow: true,
      QRCodeDesc: [],
      tree: [],
      customDialog: [],
      dialogSubVisible: false,
      tabs: [],
      ents: [],
      modifyRecord: {
        pagination: {
          pageBean: {
            page: 1,
            pageSize: 10,
            total: 0,
          },
        },
      },
      recordList: [],
      recordRefId: '',
      dialogRecordVisible: false,
      recordTableLoading: false,
      multipleTemplateTableloading: false,
      modifyDetailDialogVisible: false,
      currentModify: {},
      refId: '',
      querySubValue: '',
      subTableLoading: false,
      currentTabName: '',
      currentTab: {},
      exportType: 'main',
      subDisplayFields: [],
      subDisplayFieldsList: [],
      notPrint: false,
      displayField: {},
      treeList: [],
      rows: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
      },
      paginationLayout: 'total, sizes, prev, pager, next, jumper',
      total: 0,
      permission: {
        print: true,
        add: true,
        del: true,
        export: true,
        edit: true,
        hidden: false,
        copy: true,
      },
      //是否显示最后的操作列
      showRightMenu: true,
      listSelectable: true,
      filters: {},
      sorter: null,
      dialogSunVisible: false, //孙表对话框
      sunTabs: [], //孙表数据
      querySunValue: '',
      operateColWidth: '240',
      summaryFields: [],
      dialogVisible: false,
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
      logData: [],
      notSortableFields: [
        'bpm_status_',
        'bpm_proc_inst_id_',
        'bpm_subject_',
        'bpm_proc_def_name_',
        'bpm_create_time_',
        'bpm_end_time_',
        'bpm_is_forbidden_',
        'bpm_creator_',
      ],
      defaultValueList: [], //批量更新数据
      ignoredAlias: ['appCenterFront'],
      QRCodePattern: true,
      QRCodeType: '',
      isMobile: utils.isMobile(),
      activeNames: ['1'],
      switchMap: {},
      filterMap: {},
      dataViewDialogVisible: false,
      dialogWidth: '1580px',
      dialogHeight: '740px',
      srcUrl: '',
      filedList: [],
      flowBtnPermission: {},
      selectedDefId: '',
      selectedInstId: '',
      selectedTaskId: '',
      showScriptButton: {},
      scriptBtnShow: {},
      curSelectParams: {},
      importCacheKey: '',
      isInit: true,
      updatingRow: null,
      subDialogOptions: {
        import: false,
        export: true,
      },
      importLogTableData: [],
      statusMap: {
        1: this.$t('ht.templatePreview.importSuccess'),
        0: this.$t('ht.templateImportResult.importFail'),
      },
      importLogVisible: false,
      importLogDefaultQuery: [
        {
          group: 'main',
          operation: 'EQUAL',
          property: 'TEMP_ALIAS_',
          relation: 'AND',
          value: this.templateKey,
        },
      ],
      //导入日志查询条件
      quickSearchProps: [
        {
          prop: 'IMPORT_ACCOUNT_',
          label: this.$t('ht.templatePreview.importAccount'),
        },
        {
          prop: 'IMPORT_NAME_',
          label: this.$t('ht.templatePreview.importUser'),
        },
      ],
      templateSearchQuery: [],
      hasSearchQuery: false,
      hasSelectedData: false,
      openType: 'new',
      failureReasonVisible: false,
      errorInfo: '',
      noDataImg: require('@/assets/no-data.png'),
      filterQuerys: [],
      allSummaryConfig: {},
      customSummary: '',
      summaryTableData: [],
      mainTalbeName: '',
      checkRepeatObj: {},
      summaryTableHeight: 0,
      defaultCurrentInnerHeight: this.currentTableHeight
        ? window.innerHeight - 280
        : 0.85 * window.innerHeight,
      batchUpdataTitle: '',
    }
  },
  watch: {
    templateSearchQuery: {
      handler(val) {
        this.hasSearchQuery = val && val.length > 0
      },
      deep: true,
    },
    'tableData.selectRows': {
      handler(val) {
        this.hasSelectedData = val && val.length > 0
        _.debounce(() => {
          if (val && val.length > 0) {
            this.filterOldSummaryValByType('selected')
            this.summaryTableData.unshift({
              project: this.$t('ht.templatePreview.selectSummary'),
              key: 'selected',
              ...this.getCurrentSummaryConfig(val),
            })
          } else {
            this.summaryTableData = this.summaryTableData.filter(
              (item) => item.key !== 'selected'
            )
          }
          this.loadCompiledCustomSummary()
        }, 200)()
      },
      deep: true,
    },
    ents: {
      handler: function(newVal, oldValue) {
        if (newVal && newVal.length >= 1 && newVal != oldValue) {
          this.getSubData(this, this.refId)
        }
      },
      deep: true,
      immediate: true,
    },
    templateInfo: {
      handler: function(newVal) {
        if (newVal && newVal.id) {
          let _me = this
          _me.templateInfo = newVal
          //是否分页
          if (_me.templateInfo.needPage == 1) {
            _me.pagination.pageSize = _me.templateInfo.pageSize
          }

          if (_me.templateInfo.displayField) {
            let displayField = utils.parseToJson(_me.templateInfo.displayField)
            for (let i = 0; i < displayField.length; i++) {
              if (displayField[i] && displayField[i].type) {
                this.displayFields.push(displayField[i])
              }
              this.getChildren(displayField[i], this.displayFields)
            }
          }
          if (_me.templateInfo.manageField) {
            let btn = ['add', 'switch', 'export', 'import']
            let manageField = utils.parseToJson(_me.templateInfo.manageField)
            for (let i = 0; i < manageField.length; i++) {
              if (
                btn.indexOf(manageField[i].name) == -1 &&
                manageField[i].linePosition
              ) {
                this.filedList.push(manageField[i])
              }
            }
            if (manageField.length == 1 && manageField.name == 'add') {
              _me.showRightMenu = false
            }
          }
          if (_me.templateInfo.conditionField) {
            let conditionField = utils.parseToJson(
              _me.templateInfo.conditionField
            )
            for (var i = 0; i < conditionField.length; i++) {
              var fieldName =
                conditionField[i].colPrefix + conditionField[i].name
              this.$set(this.searchForm, fieldName, '')
            }
          }
          let params = {
            templateId: _me.templateInfo.id,
          }
          let pageBean = {
            pageBean: {
              page: '1',
              pageSize: newVal.pageSize,
              showTotal: 'true',
            },
          } //初次加载默认pageBean
          params.pagination = pageBean
          if (_me.isJoinFlow) {
            params.isJoinFlow = true
            params.taskType = _me.taskType
            params.defKey = _me.defKey
          }
          if (_me.dataView) {
            _me.handelBindFiledValua()
            //关联查询字段
            if (_me.dataView.selectList && _me.dataView.selectList.length > 0) {
              params.selectList = _me.dataView.selectList
            }
            params.refIdValue = _me.dataView.refIdValue
          }
          if (this.parameterqQuerys) {
            var querys = JSON.parse(
              Base64.decode(decodeURIComponent(this.parameterqQuerys))
            )
            params.pagination.querys = querys
          }
          let defaultQuery = this.buildDefaultQuerys()
          if (defaultQuery.length > 0) {
            if (params.pagination.querys) {
              params.pagination.querys.concat(defaultQuery)
            } else {
              params.pagination.querys = defaultQuery
            }
          }
          //如果有设置默认排序,优先使用默认排序
          if (this.templateInfo.sortField) {
            let sortField = JSON.parse(this.templateInfo.sortField)
            let sorter = []
            for (let x = 0; x < sortField.length; x++) {
              const s = sortField[x]
              const prefix = this.getColPreFix(sortField, s.name)
              const queryPre = this.getQueryPre(sortField, s.name)
              sorter.push({
                property: queryPre + prefix + s.name,
                direction: s.sort,
              })
            }
            params.pagination.sorter = sorter
          }

          // const this_ = this
          if (params.templateId) {
            // this.getBpmTemplateByPagination(
            //   params,
            //   this_.initSwitchStatus,
            //   this_.handleRightMenu
            // )
          }
          if (newVal.treeField && newVal.treeField !== '{}') {
            let treeField = JSON.parse(newVal.treeField)
            if (treeField.alias) {
              this.initTree(treeField)
              this.formGetSubEntsByFormKey()
            }
          }
          if (newVal.summaryField) {
            this.summaryFields = JSON.parse(newVal.summaryField)
          }
        }
      },
      deep: true,
      immediate: true,
    },
    currentTabName: function(newVal) {
      if (newVal) {
        this.querySubValue = ''
      }
    },
    rows: {
      handler: function(newVal) {
        if (this.templateInfo.defId) {
          let this_ = this
          let boAlias = this.templateInfo.boDefAlias
          let pks = []
          let pkField = this.templateInfo.pkField
          newVal.forEach((item) => {
            if (!item['bpm_proc_inst_load_done']) {
              pks.push(item[pkField])
            }
          })
          if (pks.length != 0) {
            this.$requestConfig.getInstanceByPks(pks, boAlias).then((resp) => {
              if (resp && resp.state) {
                let map = resp.value
                newVal.forEach((row) => {
                  let objNode = map[row[pkField]]
                  Object.keys(objNode).forEach((key) => {
                    //row[key] = objNode[key];
                    this_.$set(row, key, objNode[key])
                  })
                  this_.$set(row, 'bpm_proc_inst_load_done', true)
                })
                this.$forceUpdate()
                this_.checkFlowPermission()
              }
            })
          }
        } else {
          this.multipleTemplateTableloading = false
        }
        this.filterOldSummaryValByType('currentPage')
        this.summaryTableData.unshift({
          project: this.$t('ht.templatePreview.currentPageSummary'),
          key: 'currentPage',
          ...this.getCurrentSummaryConfig(newVal),
        })
        this.loadCompiledCustomSummary()
      },
    },
    summaryTableData(val) {
      if (val) {
        this.$nextTick(() => {
          if (document.getElementById('summaryDiv')) {
            this.summaryTableHeight = document.getElementById(
              'summaryDiv'
            ).clientHeight
          }
        })
      }
    },
  },
  computed: {
    showDraftList() {
      //如果当前页面被嵌入iframe里面不显示草稿
      return !this.isJoinFlow
    },
    navbarCollapseStyle: function() {
      if (this.asideShow) {
        return { left: '200px' }
      }
      return { left: '0px' }
    },
    tableHeaderFilters() {
      return Object.keys(this.statusMap).map((item) => {
        return {
          text: this.statusMap[item],
          value: item,
        }
      })
    },
    showTabsList() {
      let list = []
      if (this.tabs.length > 0) {
        list = this.tabs.filter((tab) => tab.attributeList.length > 0)
      }
      return list
    },
    tableHeight() {
      return this.summaryFields && this.summaryFields.length > 0
        ? this.defaultCurrentInnerHeight - this.summaryTableHeight
        : this.defaultCurrentInnerHeight
    },
  },
  mounted() {
    this.$root.$on('resize', () => {
      this.defaultCurrentInnerHeight = this.currentTableHeight
        ? window.innerHeight - 280
        : 0.85 * window.innerHeight
    })
    this.handelBindFiledValua()
    let this_ = this
    this.$on('data-reload-success', function() {
      this_.calcScriptBtnPermission()
    })
    this.$emit('afterMounted')
    // setTimeout(() => {
    //   this.$refs.multipleTemplateTable.handleFilterChange(this.filterMap)
    // }, 100)
  },
  methods: {
    //因为row.id_ 或row.id可能会有重复，所以加随机值使其唯一
    getRowKey(row) {
      /** 检查row.id是否有重复的缓存对象 */
      if (!this.checkRepeatObj) {
        this.checkRepeatObj = {}
      }
      if (row) {
        if (row.id) {
          if (this.checkRepeatObj[row.id]) {
            if (!row._secondId) {
              row._secondId = Math.random() + ''
            }
            /** 方便根据key重用元素 */
            return row._secondId
          } else {
            this.checkRepeatObj[row.id] = 1
            return row.id
          }
        } else if (row.id_) {
          if (this.checkRepeatObj[row.id_]) {
            if (!row._secondId) {
              row._secondId = Math.random() + ''
            }
            /** 方便根据key重用元素 */
            return row._secondId
          } else {
            this.checkRepeatObj[row.id_] = 1
            return row.id_
          }
        }
        if (!row._secondId) {
          row._secondId = Math.random() + ''
        }
        return row._secondId
      } else {
        return Math.random() + ''
      }
    },
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
        this.summaryFields &&
          this.summaryFields.map((item) => {
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
      if (!this.templateInfo.summaryRegionHtml) {
        return
      }
      this.$nextTick(() => {
        this.getCustomSummary(
          Base64.decode(this.templateInfo.summaryRegionHtml)
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
              summaryFields: this_.summaryFields,
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
    // 组合快速查询输入框参数
    handleQuickSearchParams(propStr, labelStr) {
      let arr = []
      if (propStr && labelStr) {
        let props = propStr.split(',')
        let labels = labelStr.split('/')
        props.forEach((item, index) => {
          arr.push({ label: labels[index], prop: item })
        })
      }
      return arr
    },
    getChildren(parent, dataOut) {
      if (parent && parent.children) {
        parent.children.forEach((child) => {
          if (child && child.type) {
            dataOut.push(child)
          }
          this.getChildren(child, dataOut)
        })
      }
    },
    handleCloseFailureReasonDialog() {
      this.failureReasonVisible = false
    },
    checkFailureReason(row) {
      this.failureReasonVisible = true
      this.$requestConfig.getImportErrorInfoById(row.id).then((res) => {
        if (res.value.reason) {
          this.errorInfo = res.value.reason
        }
      })
    },
    // 获取前缀
    getQueryPre(list, name) {
      list = list || []
      const f =
        list.find((e) => {
          return e.name === name || this.getRelevancyOldName(e, name)
        }) || {}
      return f.queryPre || (f.tableName && `${f.tableName}.`) || ''
    },
    getRelevancyOldName(data, name) {
      let str = (data.tableName + data.name).replace(/_/g, '').toLowerCase()
      if (str === name) {
        return true
      }
      return false
    },
    // 如果是关联表字段，获取查询字段
    getRelevancyProperty(list = [], name) {
      let obj = list.find(
        (k) => (k.tableName + k.name).replace(/_/g, '').toLowerCase() === name
      )
      return obj && obj.name ? obj.name : ''
    },
    exportCommand(command) {
      this.exports(command)
    },
    handleCloseImportLogDialog() {
      this.importLogVisible = false
    },
    loadData(param, cb) {
      this.$requestConfig
        .getImportLogData(param)
        .then((res) => {
          const { page, pageSize, total, rows } = res || {}
          this.importLogTableData = rows
          this.pageResult = {
            page,
            pageSize,
            total,
          }
        })
        .finally(() => {
          cb()
        })
    },
    renderHeaderMethod(h, { column }) {
      return h(
        'div',
        {
          class: 'filter-colum__wrap',
        },
        [
          h('span', column.label),
          h('i', {
            class: 'icon-screen el-table__column-filter-trigger',
          }),
        ]
      )
    },
    headerCellClassName({ column }) {
      const textArr = ['status']
      if (textArr.includes(column.property)) {
        return 'filter-column'
      }
    },
    queryFormatterData(item, array) {
      let val = []
      if (item || item === 0) {
        let list = Base64.decode(array)
        if (list) {
          list = JSON.parse(list) || []
          if (typeof item != 'number' && item.indexOf(',') != -1) {
            let items = item.split(',')
            items.forEach((i) => {
              let format = list.find((e) => e.key_ == i) || {}
              val.push(format.value_ || i)
            })
          } else {
            let format = list.find((e) => e.key_ == item) || {}
            val.push(format.value_ || item)
          }
        } else {
          val.push(item)
        }
      }
      return val.join(',')
    },
    calcScriptBtnPermission() {
      let obj = {
        print: true,
        add: true,
        edit: true,
        del: true,
        batchUpdate: true,
        batchSave: true,
        export: true,
        import: true,
        switch: true,
        url: true,
        copy: true,
        js: true,
        addFlow: true,
        addData: true,
        searchData: true,
      }
      if (this.templateInfo && this.templateInfo.manageField) {
        let manageField = JSON.parse(this.templateInfo.manageField)
        let this_ = this
        manageField.forEach((item) => {
          if (item.buttonId) {
            obj[item.buttonId] = true
          }
          if (item.beforeScriptValue) {
            let promise = this_.beforeScript(item.beforeScriptValue, item)
            promise.then((res) => {
              obj[item.buttonId] = res
              //为兼容旧数据（没有buttonId的数据）
              obj[item.name] = res
            })
          }
        })
      }
      this.showScriptButton = obj
    },
    //顶部按钮，通过js脚本判断是否显示
    getButtonShowByJs(buttonId, name) {
      return (
        this.showScriptButton &&
        this.showScriptButton[buttonId ? buttonId : name]
      )
    },
    //行按钮控制
    scriptBeforeHandler(scriptInBase64, row) {
      if (scriptInBase64) {
        let script = Base64.decode(scriptInBase64)
        if (script == undefined || script == '') {
          return true
        }
        let _this = this

        let _req = req
        let _rows = this.rows
        let _row = row
        // eslint-disable-next-line no-inner-declarations
        function evil() {
          let Fn = Function('_req', '_this', '_rows', '_row', script) //一个变量指向Function，防止有些前端编译工具报错
          let result = Fn(_req, _this, _rows, _row)
          return result
        }
        let resultValue = evil()
        return resultValue
      } else {
        return true
      }
    },
    formGetSubEntsByFormKey() {
      this.$requestConfig
        .getSubEntsByFormKey(this.templateInfo.formKey)
        .then((resp) => {
          resp.forEach((item) => {
            let subDisplayFields = []
            item.attributeList.forEach((attr) => {
              subDisplayFields.push({
                desc: attr.comment,
                name: attr.fieldName,
                type: attr.columnType,
              })
            })
            this.subDisplayFields.push({
              fields: subDisplayFields,
              name: item.name,
              comment: item.comment,
            })
          })
        })
    },
    handleRightMenu() {
      if (this.$el && this.$el.querySelector) {
        let topBtnDom = this.$el.querySelector('div.top_btn_col')
        if (
          !topBtnDom ||
          (!topBtnDom.querySelector('i.el-icon-delete') &&
            !topBtnDom.querySelector('i.el-icon-edit') &&
            !topBtnDom.querySelector('i.el-icon-s-grid'))
        ) {
          this.listSelectable = false
        }
        let _this = this
        setTimeout(function() {
          let tdDom = _this.$el.querySelector('td.right_menu')
          if (
            !tdDom ||
            (!tdDom.querySelector('button') && !tdDom.querySelector('switch'))
          ) {
            _this.showRightMenu = false
          }
        }, 200)
      }
    },
    loadImportLogData(param, cb) {
      let querys = param.querys || []
      let hasDefaultQuery = false
      this.handelBindFiledValua()
      let pID = this.dataView.refIdValue
      querys.forEach((q) => {
        if (q.property == 'PId') {
          hasDefaultQuery = true
        }
      })
      if (!hasDefaultQuery) {
        querys.push({
          operation: 'EQUAL',
          group: 'defalut',
          property: 'PId',
          relation: 'AND',
          value: pID,
        })
        querys.push({
          operation: 'EQUAL',
          group: 'defalut',
          property: 'boAlias',
          relation: 'AND',
          value: this.templateInfo.boDefAlias,
        })
      }
      param.querys = querys
      this.$requestConfig
        .getDataTemplateImportLogData(param)
        .then((data) => {
          let response = data
          this.logData = response.rows
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total,
          }
        })
        .finally(() => {
          cb()
        })
    },
    handelBindFiledValua() {
      //数据视图控件
      let _me = this
      if (this.dataView) {
        const pInst = utils.getOnlineFormInstance(
          this.$parent.$parent.$parent.$parent
        )
        if (
          pInst.data &&
          !pInst.data[this.dataView.boDefAlias] &&
          this.dataView.boDefAlias
        ) {
          this.dataView.boDefAlias = Object.keys(pInst.data)[0]
        }
        let refIdValue = utils.getValueByPath(
          pInst,
          'data.' + this.dataView.boDefAlias + '.id_'
        )

        if (sessionStorage.getItem('formImportTempRefId') && !refIdValue) {
          refIdValue = sessionStorage.getItem('formImportTempRefId')
        } else if (!refIdValue) {
          //导入的时候没有关键的外键，则为其自动添加
          refIdValue = new Date().getTime()
          sessionStorage.setItem('formImportTempRefId', refIdValue)
        }
        _me.dataView.refIdValue = refIdValue

        if (
          pInst.permission &&
          pInst.permission.table &&
          pInst.permission.table[this.templateInfo.boDefAlias]
        ) {
          this.permission = pInst.permission.table[this.templateInfo.boDefAlias]
        }
        if (this.permission.hidden) {
          this.$parent.showDateView = false
        }
        //关联查询字段
        let selectList = this.dataView.selectList
        if (selectList && selectList.length > 0) {
          for (let i = 0; i < selectList.length; i++) {
            if (selectList[i].selectField) {
              const path =
                'data.' +
                this.dataView.boDefAlias +
                '.' +
                selectList[i].selectField
              const value = utils.getValueByPath(pInst, path)
              selectList[i].selectValue = value

              //添加监听
              pInst.$watch(path, function(newVal, oldVal) {
                // 监听中使用间隔请求，减少请求次数
                clearTimeout(this.timeout)
                this.timeout = setTimeout(() => {
                  if (newVal !== oldVal) {
                    //_me.setDataViewValue(_me.dataView);
                    _me.search()
                  }
                }, 500)
              })
            }
          }
        }
        //关联填充字段
        let bindList = this.dataView.bindList
        if (bindList && bindList.length > 0) {
          for (let i = 0; i < bindList.length; i++) {
            if (bindList[i].fillField) {
              const path =
                'data.' + this.dataView.boDefAlias + '.' + bindList[i].fillField
              const value = utils.getValueByPath(pInst, path)

              bindList[i].fillValue = value
              pInst.$watch(path, function(newVal, oldVal) {
                // 监听中使用间隔请求，减少请求次数
                clearTimeout(this.timeout)
                this.timeout = setTimeout(() => {
                  if (newVal !== oldVal) {
                    //_me.setDataViewValue(_me.dataView);
                    _me.search()
                  }
                }, 500)
              })
            }
          }
        }
      }
    },
    printList() {
      this.notPrint = true
      setTimeout(() => {
        document.body.innerHTML = document.getElementById('printData').innerHTML
        window.print()
        location.reload()
      }, 200)
      setTimeout(() => {
        this.notPrint = false
      }, 200)
    },
    printDetail(templateId, id, action) {
      //数据随机添加到其他菜单下面时获取当前菜单的别名
      if (sessionStorage.menu_alias) {
        this.alias_new = sessionStorage.menu_alias
      }
      var url =
        '/templateForm/' + this.templateKey + '/' + action + '?single=true'
      if (id) {
        url = url + '&id=' + id
      }
      var startFlowStr = '&startFlow=false'
      let path = url + startFlowStr
      if (path.indexOf('othermenu') != -1) {
        path = path.replace('/othermenu', '/')
      }

      this.$router.push({
        path: path,
        query: {
          isPrint: true,
        },
      })
    },
    complete(row, taskType) {
      if (taskType == 'todo') {
        this.$requestConfig
          .getBpmTaskByInstId(row.bpm_proc_inst_id_)
          .then((res) => {
            if (res.data.length == 0) {
              this.$message.error(this.$t('ht.templatePreview.notExist'))
            } else if (res.data.length == 1) {
              this.$router.push(
                '/reportModuleInst/' +
                  res.data[0].id +
                  '/0' +
                  '/' +
                  this.defKey +
                  '/true/' +
                  this.templateKey
              )
            } else {
              this.$message.error(this.$t('ht.templatePreview.notSupported'))
            }
          })
      } else if (taskType == 'done') {
        this.$router.push(
          '/reportModuleInstDone/' +
            row.bpm_proc_inst_id_ +
            '/doneList/' +
            this.defKey +
            '/' +
            this.templateKey
        )
      } else if (taskType == 'request') {
        this.$router.push(
          '/reportModuleInstDone/' +
            row.bpm_proc_inst_id_ +
            '/request/' +
            this.defKey +
            '/' +
            this.templateKey
        )
      } else if (taskType == 'todoRead') {
        let pageBean = {
          page: 1,
          pageSize: 10,
          showTotal: 'true',
        }
        let status = row.bpm_status_
        this.$requestConfig
          .getNoticeTodoReadList({
            pageBean: pageBean,
            querys: [
              {
                property: 'proc_inst_id_',
                value: row.bpm_proc_inst_id_,
                operation: 'EQUAL',
                relation: 'AND',
              },
            ],
          })
          .then((response) => {
            if (response.rows && response.rows.length > 0) {
              let id = response.rows[0].id
              let url = ''
              7
              if (status == 'FOLLOW') {
                url =
                  '/reportModuleInstTaskRead/' +
                  id +
                  '/FOLLOW/' +
                  this.defKey +
                  '/' +
                  this.templateKey
              } else if (status == 'COMMU') {
                url =
                  '/reportModuleInst/' +
                  id +
                  '/0/' +
                  this.defKey +
                  '/true/' +
                  this.templateKey
              } else {
                url =
                  '/reportModuleInstRead/' +
                  row.bpm_proc_inst_id_ +
                  '/read/' +
                  id +
                  '/' +
                  this.defKey +
                  '/' +
                  this.templateKey
              }
              this.$router.push(url)
            }
          })
      } else if (taskType == 'doneRead') {
        let pageBean = {
          page: 1,
          pageSize: 10,
          showTotal: 'true',
        }
        this.$requestConfig
          .getNoticeDoneReadList({
            pageBean: pageBean,
            querys: [
              {
                property: 'proc_inst_id_',
                value: row.bpm_proc_inst_id_,
                operation: 'EQUAL',
                relation: 'AND',
              },
            ],
          })
          .then((response) => {
            if (response.rows && response.rows.length > 0) {
              let id = response.rows[0].id
              this.$router.push(
                '/reportModuleInstDone/' +
                  row.bpm_proc_inst_id_ +
                  '/read/done/' +
                  id +
                  '/' +
                  this.defKey +
                  '/' +
                  this.templateKey
              )
            }
          })
      } else if (taskType == 'myRead') {
        let pageBean = {
          page: 1,
          pageSize: 10,
          showTotal: 'true',
        }
        this.$requestConfig
          .getMyNoticeReadList({
            pageBean: pageBean,
            querys: [
              {
                property: 'proc_inst_id_',
                value: row.bpm_proc_inst_id_,
                operation: 'EQUAL',
                relation: 'AND',
              },
            ],
          })
          .then((response) => {
            if (response.rows && response.rows.length > 0) {
              let id = response.rows[0].id
              this.$router.push(
                '/reportModuleInstMyRead/' +
                  row.bpm_proc_inst_id_ +
                  '/' +
                  id +
                  '/myRead/' +
                  this.defKey +
                  '/' +
                  this.templateKey
              )
            }
          })
      } else if (taskType == 'myDelegate') {
        this.$router.push(
          '/reportModuleInstRead/' +
            row.bpm_proc_inst_id_ +
            '/delegate/' +
            this.defKey +
            '/' +
            this.templateKey
        )
      }
    },
    //下载全部选中的二维码
    downloadAllQRCode(
      templateId,
      mobileFormAlias,
      display,
      pkField,
      QRCodePattern
    ) {
      this.QRCodePattern = QRCodePattern
      const _selectData = this.$refs.multipleTemplateTable.selection
      if (_selectData.length === 0) {
        this.$message.warning(this.$t('ht.templatePreview.selectLeastOneData'))
        return
      }
      this.loading = true
      let mobile = this.$requestConfig.mobileUrl
      let QRCodeurl = ''
      let zip = new JSZip()
      // 创建一个名为images的新的文件目录
      let img = zip.folder('images')
      let plist = []
      for (let x = 0; x < _selectData.length; x++) {
        if (this.QRCodePattern) {
          QRCodeurl =
            mobile +
            '/QRCodeForm/' +
            this.templateKey +
            '?id=' +
            _selectData[x][pkField]
        } else {
          QRCodeurl =
            mobile +
            '/QRCodeForm/' +
            this.templateKey +
            '?id=' +
            _selectData[x][pkField]
        }
        let msg = document.createElement('canvas')

        this.$qrcode.toCanvas(msg, QRCodeurl, function(error) {
          console.error(error)
        })
        let _canvas = document.createElement('div')
        _canvas.setAttribute('id', 'QRCodeAndDescAll' + x)
        _canvas.setAttribute(
          'style',
          'text-align:center;width:' + msg.width + 'px;'
        )
        _canvas.appendChild(msg)
        if (!display) {
          display = []
        }
        //创建底部的描述信息
        for (let Y = 0; Y < display.length; Y++) {
          let item = JSON.parse(display[Y])
          if (_selectData[x][item.name]) {
            let desc = document.createElement('div')
            desc.innerHTML = item.desc + ':' + _selectData[x][item.name]
            _canvas.appendChild(desc)
          }
        }
        document.getElementById('QRCodeAndDescAll').appendChild(_canvas)
        plist.push(this.downloadQRCodeAndDesc('#QRCodeAndDescAll' + x, _canvas))
      }
      let _this = this
      Promise.all(plist).then((result) => {
        document.getElementById('QRCodeAndDescAll').innerHTML = ''
        for (let x = 0; x < result.length; x++) {
          let canvas = result[x]
          let image = canvas.toDataURL().split(';base64,')[1]
          // 这个images文件目录中创建一个base64数据为imgData的图像，图像名是smile.gif
          img.file(x + '.png', image, {
            base64: true,
          })
        }
        // 把打包内容异步转成blob二进制格式
        zip
          .generateAsync({
            type: 'blob',
          })
          .then(function(content) {
            let eleLink = document.createElement('a')
            eleLink.download = `${_this.$t('ht.templatePreview.qrCode')}.zip`
            eleLink.style.display = 'none'
            // 下载内容转变成blob地址
            eleLink.href = createObjectURL(content)
            // 触发点击
            document.body.appendChild(eleLink)
            eleLink.click()
            // 然后移除
            document.body.removeChild(eleLink)
          })

        this.loading = false
      })
    },
    onCopy() {
      this.$message.success(this.$t('ht.templatePreview.copy'))
    },
    // 复制失败时的回调函数
    onError() {
      this.$message.error(this.$t('ht.templatePreview.copyError'))
    },
    downloadQRCode() {
      let plist = []
      let _canvas = document.querySelector('#QRCodeAndDesc')
      plist.push(this.downloadQRCodeAndDesc('#QRCodeAndDesc', _canvas))
      Promise.all(plist).then((result) => {
        let canvas = result[0]
        let link = document.createElement('a')
        link.href = canvas.toDataURL() //下载链接
        link.setAttribute(
          'download',
          `${this.$t('ht.templatePreview.qrCode')}.jpg`
        )
        link.style.display = 'none' //a标签隐藏
        document.body.appendChild(link)
        link.click()
      })
    },
    //把二维码与二维码说明一起下载成图片
    downloadQRCodeAndDesc(classs, _canvas) {
      let p2 = new Promise((resolve) => {
        let canvas2 = document.createElement('canvas')
        let w = parseInt(window.getComputedStyle(_canvas).width)
        let h = parseInt(window.getComputedStyle(_canvas).height)
        //将canvas画布放大若干倍，然后盛放在较小的容器内，就显得不模糊了
        canvas2.width = w * 2
        canvas2.height = h * 2
        canvas2.style.width = w + 'px'
        canvas2.style.height = h + 'px'
        //可以按照自己的需求，对context的参数修改,translate指的是偏移量
        let context = canvas2.getContext('2d')
        context.scale(2, 2)
        return html2canvas(document.querySelector(classs), {
          canvas: canvas2,
        }).then(function(canvas) {
          resolve(canvas)
        })
      })
      return p2
    },
    QRCodeDialogClose() {
      this.QRCodeType = ''
      this.QRCodeDialog = false
    },
    foundQRCode() {
      if (this.QRCodeType == 'add') {
        let isStartFlow = this.templateInfo.defId ? 'true' : 'false'
        this.QRCodeurl =
          this.$requestConfig.mobileUrl +
          '/templateForm/' +
          this.templateKey +
          '/add/?startFlow=' +
          isStartFlow
      } else {
        //不论需不需要登录，访问的都是明细页面
        if (this.QRCodePattern) {
          //免登录
          this.QRCodeurl =
            this.$requestConfig.mobileUrl +
            '/QRCodeForm/' +
            this.templateKey +
            '?id=' +
            this.rowId
        } else {
          //需要登录
          this.QRCodeurl =
            this.$requestConfig.mobileUrl +
            '/QRCodeForm/' +
            this.templateKey +
            '?id=' +
            this.rowId
        }
      }
      // Base64.encode(this.$store.state.login.currentUser.account);
      let msg = document.getElementById('QRCode')

      this.$qrcode.toCanvas(msg, this.QRCodeurl, function(error) {
        console.log(error)
      })
      this.QRCodeShow = true
    },
    getQRCode(templateId, id, mobileFormAlias, display, index, QRCodePattern) {
      this.QRCodePattern = QRCodePattern
      this.QRCodeDesc = []
      if (!display) {
        display = []
      }
      for (let x = 0; x < display.length; x++) {
        let item = JSON.parse(display[x])
        if (this.rows[index][item.name]) {
          this.QRCodeDesc.push(item.desc + ':' + this.rows[index][item.name])
        }
      }
      this.mobileFormAlias = mobileFormAlias
      this.QRCodeShow = false
      this.QRCodeDialog = true
      this.rowTemplateId = templateId
      this.rowId = id
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.pagination.page = 1
      this.pagination.pageSize = size
      this.$refs.multipleTemplateTable.handleFilterChange()
    },
    handleCurrentChange: function(currentPage) {
      //点击第几页
      this.pagination.page = currentPage
      this.$refs.multipleTemplateTable.handleFilterChange()
    },
    getParam(str) {
      let params = {}
      if (str == 'find') {
        this.pagination.page = 1
      }

      //判断为合并查询还是分开查询
      if (this.formType) {
        params = this.getQueryFilter()
      } else {
        //判断是否配置了合并查询
        if ($('.search-query').length > 0) {
          params = this.getConditionQuery()
        } else {
          params = this.getQueryFilter()
        }
      }

      if (params.pagination && params.pagination && params.pagination.querys) {
        let tempQueryS = []
        let betweenConditions = {}
        params.pagination.querys.forEach((q) => {
          if (
            q.value &&
            (q.operation != 'BETWEEN' || q.value.constructor == Array)
          ) {
            tempQueryS.push(q)
          } else if (q.value) {
            let conditions = q
            if (betweenConditions[q.property]) {
              conditions = betweenConditions[q.property]
              conditions.value = [conditions.value]
              conditions.value.push(q.value)
            }
            betweenConditions[q.property] = conditions
          }
        })
        for (const key in betweenConditions) {
          tempQueryS.push(betweenConditions[key])
        }
        params.pagination.querys = tempQueryS
      }
      return params
    },
    //列表数据查询入口
    search(param, cb, isSearchBtn) {
      let params = {}
      //判断为合并查询还是高级查询
      let showAdvancedSearch = this.$refs.multipleTemplateTable
        ? this.$refs.multipleTemplateTable.showAdvancedSearch
        : false
      //高级查询
      if (showAdvancedSearch) {
        params = this.getQueryFilter()
      } else {
        //合并查询
        // 快速查询时，需处理添加快速查询字段前缀
        param = this.handleQuickParams(param)
        params = this.getConditionQuery(param)
      }
      this.templateSearchQuery =
        (params.pagination && params.pagination.querys) || []
      if (!params.pagination) {
        params.pagination = {}
      }
      if (!params.pagination.querys) {
        params.pagination.querys = []
      }
      //处理排序字段
      if (param && param.sorter && param.sorter.length > 0) {
        let sortField = JSON.parse(this.templateInfo.sortField)
        params.pagination = params.pagination || {}
        params.pagination.sorter = []
        param.sorter.forEach((s) => {
          let prefix = this.getColPreFix(sortField, s.property)
          let queryPre = this.getQueryPre(sortField, s.property)
          // 关联表时需特殊处理
          let relevancyProperty = this.getRelevancyProperty(
            sortField,
            s.property
          )
          if (relevancyProperty) {
            s.property = relevancyProperty
          }
          params.pagination.sorter.push({
            property: queryPre + prefix + s.property,
            direction: s.direction,
          })
        })
      } else if (this.templateInfo.sortField) {
        let sortField = JSON.parse(this.templateInfo.sortField)
        let sorter = []
        for (let x = 0; x < sortField.length; x++) {
          const s = sortField[x]
          // 默认排序字段的排序方向为空或者不为指定值时放弃
          if (!s.sort || (s.sort != 'ASC' && s.sort != 'DESC')) {
            continue
          }
          let prefix = this.getColPreFix(sortField, s.name)
          let queryPre = this.getQueryPre(sortField, s.name)
          if (!queryPre) {
            if (s.joinTableField && s.tableName) {
              prefix = `${s.tableName}.${prefix}`
            } else {
              prefix = `t.${prefix}`
            }
          }
          sorter.push({
            property: queryPre + prefix + s.name,
            direction: s.sort,
          })
        }
        params.pagination.sorter = sorter
      } else if (param.querys && param.querys.length > 0) {
        params.pagination.querys.concat(param.querys)
      }

      if (params.pagination && params.pagination.querys) {
        let tempQueryS = []
        let betweenConditions = {}
        params.pagination.querys.forEach((q) => {
          if (
            q.value != undefined &&
            (q.operation != 'BETWEEN' || q.value.constructor == Array)
          ) {
            tempQueryS.push(q)
          } else if (q.value) {
            let conditions = q
            if (betweenConditions[q.property]) {
              conditions = betweenConditions[q.property]
              conditions.value = [conditions.value]
              conditions.value.push(q.value)
            }
            betweenConditions[q.property] = conditions
          }
        })
        for (const key in betweenConditions) {
          tempQueryS.push(betweenConditions[key])
        }
        params.pagination.querys = tempQueryS
        params.pagination.querys = params.pagination.querys
          ? params.pagination.querys.concat(this.treeQuerys)
          : this.treeQuerys
      }
      //把过滤树的条件也拼接进去
      if (this.treeQuerys && this.treeQuerys.length > 0) {
        params.pagination.querys = params.pagination.querys
          ? params.pagination.querys.concat(this.treeQuerys)
          : this.treeQuerys
      }
      //初始化时，把查询字段和筛选字段的默认值也加进去
      if (this.isInit) {
        this.isInit = false
        this.handleInitQuery(params)
      }
      //数据视图控件
      if (this.dataView) {
        this.handelBindFiledValua()
        params.refIdValue = this.dataView.refIdValue
        //关联查询字段
        if (this.dataView.selectList && this.dataView.selectList.length > 0) {
          params.selectList = this.dataView.selectList
        }
      }
      const this_ = this
      if (this_.isJoinFlow) {
        params.isJoinFlow = true
        params.taskType = this_.taskType
        params.defKey = this_.defKey
      }
      if ($.isEmptyObject(this.searchForm)) {
        this.getBpmTemplateByPagination(params, cb)
      } else {
        this.getBpmTemplateByPagination(params, cb)
      }
    },
    // 处理快速查询参数
    handleQuickParams(param) {
      if (param && param.querys && param.querys.length) {
        param.querys.forEach((item) => {
          if (item.group === 'quick') {
            const conditionFields =
              JSON.parse(this.templateInfo.conditionField) || []
            let obj = conditionFields.find((sub) => {
              return sub.name === item.property
            })
            if (obj && obj.queryPre) {
              item.property = obj.queryPre + item.property
            }
          }
        })
      }
      return param
    },
    handleInitQuery(params) {
      const conditionFields = JSON.parse(this.templateInfo.conditionField) || []
      const querys = []
      conditionFields.forEach((item) => {
        if (item.defaultValue) {
          querys.push({
            property: `${item.queryPre || ''}${item.colPrefix}${item.name}`,
            value: item.defaultValue,
            operation: item.qt.toUpperCase(),
            relation: 'AND',
            group: 'defaultQuery',
          })
        }
      })
      const filteringFields = JSON.parse(this.templateInfo.filteringField) || []
      filteringFields.forEach((item) => {
        if (item.defaultValue && item.defaultValue.length) {
          querys.push({
            property: `${item.queryPre || ''}${item.colPrefix}${item.name}`,
            value: item.defaultValue,
            operation: 'IN',
            relation: 'AND',
            group: 'defaultQuery',
          })
        }
      })
      if (!querys.length) {
        return
      }
      Array.prototype.push.apply(params.pagination.querys, querys)
    },
    getBpmTemplateByPagination(params, cb1, cb2) {
      this.multipleTemplateTableloading = true
      const dataTemplateQueryVo = {
        templateId: params.templateId,
        queryFilter: params.pagination,
      }
      if (params.isJoinFlow && params.taskType && params.defKey) {
        dataTemplateQueryVo.isJoinFlow = params.isJoinFlow
        dataTemplateQueryVo.taskType = params.taskType
        dataTemplateQueryVo.defKey = params.defKey
      }
      if (params.selectField) {
        dataTemplateQueryVo.selectField = params.selectField
        dataTemplateQueryVo.selectValue = params.selectValue
      }
      if (params.selectList) {
        dataTemplateQueryVo.selectList = params.selectList
      }
      dataTemplateQueryVo.refIdValue = params.refIdValue
      this.curSelectParams = dataTemplateQueryVo
      this.$requestConfig
        .getDataTemplateDataList(dataTemplateQueryVo)
        .then((response) => {
          this.rows = response.rows
          this.total = response.total
          this.$set(this.pagination, 'page', response.page)
          this.$set(this.pagination, 'pageSize', response.pageSize)
          this.$set(this.pagination, 'total', response.total)
          this.$set(this, 'flowBtnPermission', {})
          this.$emit('data-reload-success')
          if (response.summary && response.summary.length) {
            this.getAllSummary(response.summary)
          }
          if (this.templateInfo.summaryRegionHtml) {
            this.loadCompiledCustomSummary()
          }
        })
        .finally(() => {
          this.multipleTemplateTableloading = false
          cb1 && cb1()
          cb2 && cb2()
        })
    },
    getQueryFilter() {
      let operationMap = this.getSearchItems()
      let fieldTypeMap = this.getFieldType()

      let specialMap = this.getSpecialMap()
      let querys = [] //查询条件
      let queryFilter = {}
      let pageBean = {
        pageBean: this.pagination,
      }
      let params = {
        templateId: this.templateInfo.id,
      }
      params.pagination = pageBean
      if (!$.isEmptyObject(this.searchForm)) {
        let conditionField = utils.parseToJson(this.templateInfo.conditionField)
        for (let key in this.searchForm) {
          if (
            typeof this.searchForm[key] != 'undefined' &&
            this.searchForm[key] != '' &&
            this.searchForm[key] != null
          ) {
            if (this.searchForm[key] instanceof Array) {
              for (let i = 0; i < this.searchForm[key].length; i++) {
                let queryPre = this.getQueryPre(conditionField, key)
                querys.push({
                  property: queryPre + key,
                  value: this.searchForm[key][i],
                  group: 'main',
                  operation: operationMap[key],
                  relation: 'AND',
                })
              }
            } else if (
              this.searchForm[key] &&
              [','].includes(this.searchForm[key]) &&
              !specialMap[key]
            ) {
              let arr = this.searchForm[key].split(',')
              let queryPre = this.getQueryPre(conditionField, key)
              querys.push({
                property: queryPre + key,
                value: arr,
                group: 'main',
                operation: operationMap[key],
                relation: 'AND',
              })
            } else {
              let value = this.searchForm[key]
              //整数类型
              if (fieldTypeMap[key] && fieldTypeMap[key] == 'number') {
                value = parseFloat(this.searchForm[key])
              }
              let queryPre = this.getQueryPre(conditionField, key)
              querys.push({
                property: queryPre + key,
                value: value,
                group: 'main',
                operation: operationMap[key],
                relation: 'AND',
              })
            }
          }
        }
        this.clearQueryByGroupName(querys, 'filter')
        // 将过滤条件添加查询参数数组中
        this.buildFilterParams(querys)
      }
      // 判断table中是否含有filter查询
      let tableQuerys = this.$refs['multipleTemplateTable'].querys
      if (tableQuerys && tableQuerys.some((item) => item.group === 'filter')) {
        Array.prototype.push.apply(
          querys,
          tableQuerys
            .filter((item) => item.group === 'filter')
            .map((item) => {
              let obj = {
                ...item,
              }
              let colPrefix = ''
              let displayField = this.displayFields.filter(
                (field) => field.name === obj.property
              )[0]
              displayField && (colPrefix = displayField.colPrefix || '')
              obj.property = `${colPrefix}${obj.property}`
              return obj
            })
        )
      }
      queryFilter = {
        pageBean: this.pagination,
        querys,
      }
      params.pagination = queryFilter
      return params
    },
    //在显示字段、查询字段、排序字段、筛选字段等字段中匹配返回字段的前缀
    getColPreFix(list, field) {
      list = list || []
      const f = list.find((e) => e.name === field) || {}
      if (!f.colPrefix && this.displayFields) {
        const _displayField =
          this.displayFields.find((e) => e.name === field) || {}
        return _displayField.colPrefix || ''
      } else {
        return f.colPrefix
      }
    },
    //开关是否匹配显示，外部表字段名拼接：表名+字段名，带w和f开头
    matchBind(row, bind, switchOn, switchOff) {
      const bindValue = this.getBindValue(row, bind)
      return bindValue == switchOn || bindValue == switchOff
    },
    getBindValue(row, bind) {
      if (row && row[bind]) {
        return row[bind]
      }
      if (this.templateInfo) {
        const prefix = this.templateInfo.isExternal === 1 ? '' : 'F_'
        bind = `${this.templateInfo.mainTalbeName}${prefix}${bind}`
        bind = bind.toLowerCase().replaceAll('_', '')
      }
      return row[bind]
    },
    getBindField(row, bind) {
      if (row && row[bind]) {
        return bind
      }
      if (this.templateInfo) {
        const prefix = this.templateInfo.isExternal === 1 ? '' : 'F_'
        bind = `${this.templateInfo.mainTalbeName}${prefix}${bind}`
        bind = bind.toLowerCase().replaceAll('_', '')
      }
      return bind
    },
    //构建筛选字段作为查询参数
    buildFilterParams(querys) {
      let result = []
      if (this.filters && Object.keys(this.filters).length > 0) {
        //管理端配置的筛选条件
        let filteringField = JSON.parse(
          this.templateInfo.filteringField || '[]'
        )
        Object.keys(this.filters).forEach((k) => {
          //获取字段的前缀
          let prefix = this.getColPreFix(filteringField, k)
          let queryPre = this.getQueryPre(filteringField, k)

          const filter = this.filters[k]
          let q = {
            property: queryPre + prefix + k,
            value: filter[0],
            group: 'filter',
            relation: 'AND',
          }
          if (filter.length == 1) {
            q.operation = 'EQUAL'
          } else if (filter.length > 1) {
            q.operation = 'IN'
            q.value = filter
          }
          querys && querys.push(q)
          result.push(q)
        })
      }
      return result
    },
    // 通过分组名称清除对应查询条件
    clearQueryByGroupName(querys, groupName) {
      // 待删除的查询条件
      let toDelete = []
      querys &&
        querys.forEach((query) => {
          if (query.group == groupName) {
            toDelete.push(query)
          }
        })
      toDelete.forEach((d) => {
        querys.remove(d)
      })
    },
    handleSortChange() {
      console.warn(this.$t('ht.templatePreview.sortWarning'))
    },
    handleFilterChange(m) {
      this.filters = {
        ...this.filters,
        ...m,
      }
      Object.keys(this.filters).forEach((k) => {
        if (!this.filters[k] || this.filters[k].length == 0) {
          delete this.filters[k]
        }
      })
      this.search()
    },
    getSearchItems() {
      let searchItems = $('.search-item')
      let operationMap = {}
      let operationType = {
        like: 'LIKE',
        equal: 'EQUAL',
        between: 'BETWEEN',
        left_like: 'LEFT_LIKE',
        right_like: 'RIGHT_LIKE',
      }
      if (searchItems) {
        for (let i = 0; i < searchItems.length; i++) {
          let operation = '='
          if (typeof $(searchItems[i]).attr('ht-query') != 'undefined') {
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
    getFieldType() {
      let searchItems = $('.search-item')
      let operationMap = {}
      let operationType = {
        number: 'number',
        text: 'text',
      }
      if (searchItems) {
        for (let i = 0; i < searchItems.length; i++) {
          let operation = '='
          if (typeof $(searchItems[i]).attr('ht-query') != 'undefined') {
            operation = $(searchItems[i]).attr('type')
            operationMap[$(searchItems[i]).attr('ht-query')] =
              typeof operationType[operation] != 'undefined'
                ? operationType[operation]
                : operation
          } else if (
            typeof $(searchItems[i])
              .children()
              .attr('ht-query') != 'undefined'
          ) {
            operation = $(searchItems[i])
              .children()
              .attr('type')
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
    //合并查询条件
    getConditionQuery(param) {
      let querys = [] //查询条件
      let queryFilter = {}
      let pageBean = {
        pageBean: this.pagination,
      }
      let params = {
        templateId: this.templateInfo.id,
      }
      params.pagination = pageBean
      // 将过滤条件添加查询参数数组中
      this.buildFilterParams(querys)

      if (param && param.querys) {
        let temquerys = [...param.querys]
        let conditionField = utils.parseToJson(this.templateInfo.conditionField)
        const filterField = utils.parseToJson(this.templateInfo.filteringField)
        temquerys.forEach((q) => {
          let prefix = this.getColPreFix(conditionField, q.property)
          if (!prefix) {
            prefix = this.getColPreFix(filterField, q.property)
          }
          q.property = prefix + q.property
          querys.push(q)
        })
      }

      if (this.parameterqQuerys) {
        let parameterQuerys = JSON.parse(Base64.decode(this.parameterqQuerys))
        if (parameterQuerys && parameterQuerys.length > 0) {
          parameterQuerys.forEach((query) => {
            let prefix = this.templateInfo.isExternal === 1 ? '' : 'F_'
            query.property = prefix + query.property
            this.$set(this.searchForm, query.property, query.value)
            querys.push(query)
          })
        }
      }

      queryFilter = {
        pageBean: this.pagination,
        querys,
      }
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
    //回车查询
    searchEnterFun: function(e) {
      let keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.search()
      }
    },
    reset(flag) {
      this.queryForm.queryData = ''
      if (this.templateInfo.conditionField) {
        let conditionField = utils.parseToJson(this.templateInfo.conditionField)
        for (let i = 0; i < conditionField.length; i++) {
          let fieldName = conditionField[i].colPrefix + conditionField[i].name
          this.$set(this.searchForm, fieldName, '')
          this.$set(this.searchForm, conditionField[i].name, '')
        }
      }
      this.filters = {}
      this.$refs.multipleTemplateTable.clearFilter &&
        this.$refs.multipleTemplateTable.clearFilter()
      if (!flag) {
        this.search()
      }
    },
    handleSelectionChange(val) {
      this.tableData.selectRows = val
    },
    deleted() {
      if (
        this.tableData.selectRows == null ||
        this.tableData.selectRows.length == 0
      ) {
        this.$message.warning(this.$t('ht.templatePreview.deleteWaring'))
        return false
      }
      this.$confirm(
        this.$t('ht.templatePreview.deleteTip'),
        this.$t('ht.common.tips'),
        {
          confirmButtonText: this.$t('ht.common.confirm'),
          cancelButtonText: this.$t('ht.common.cancle'),
          type: 'warning',
        }
      )
        .then(() => {
          let s = []
          for (let i = 0; i < this.tableData.selectRows.length; i++) {
            s.push(this.tableData.selectRows[i][this.templateInfo.pkField])
          }
          let data = {
            ids: s.join(','),
            boAlias: this.templateInfo.boDefAlias,
            formKey: this.templateInfo.formKey,
          }
          this.$requestConfig.deleteTemplateDataById(data).then((resp) => {
            if (resp.state) {
              this.$message.success(resp.message)
              this.pagination.page = 1
              this.search()
            } else {
              this.$message.error(resp.message)
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('ht.templatePreview.cancelDelete'),
          })
        })
    },
    del(id) {
      this.$confirm(
        this.$t('ht.templatePreview.deleteDataTip'),
        this.$t('ht.common.tips'),
        {
          confirmButtonText: this.$t('ht.common.confirm'),
          cancelButtonText: this.$t('ht.common.cancle'),
          type: 'warning',
        }
      )
        .then(() => {
          let data = {
            ids: id,
            boAlias: this.templateInfo.boDefAlias,
            formKey: this.templateInfo.formKey,
          }
          this.$requestConfig.deleteTemplateDataById(data).then((resp) => {
            if (resp.state) {
              this.$message.success(resp.message)
              let delRows = {}
              if (this.tableData.selectRows.length) {
                this.tableData.selectRows = this.tableData.selectRows.filter(
                  (item) => {
                    if (item.id_ == id || item.id === id) {
                      delRows = item
                    }
                    return item.id_ !== id || item.id !== id
                  }
                )
              }
              this.$refs.multipleTemplateTable.$refs.htTable.toggleRowSelection(
                delRows,
                false
              )
              this.pagination.page = 1
              this.search()
            } else {
              this.$message.error(resp.message)
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('ht.templatePreview.cancelDelete'),
          })
        })
    },
    operating(
      templateId,
      id,
      action,
      defId,
      isStartFlow,
      openType,
      quitAfterSaving,
      clickType
    ) {
      //isStartFlow （false：可以发起流程，true：不可以发起流程）
      if (this.templateInfo.manageField && !isStartFlow) {
        //先配置不能发起流程
        if (action == 'add' && isStartFlow == '') {
          isStartFlow = true
        }
        if (action == 'edit' && isStartFlow === false) {
          isStartFlow = true
        }
        //再判断是否可以发起流程
        let manageField = JSON.parse(this.templateInfo.manageField)
        //判断是否配置了发起流程按钮
        for (let k = 0; k < manageField.length; k++) {
          if (action == 'add' && manageField[k].name == 'startFlow') {
            isStartFlow = false
            break
          } else if (action == 'edit' && manageField[k].name == 'startFlow') {
            isStartFlow = false
            break
          }
        }
      }
      if (!templateId) {
        templateId = this.templateInfo.id
        action = action == 'select' ? 'get' : 'add'
      }
      //数据视图随机添加到其他菜单下面时获取当前菜单的别名  并且当前数据视图不是表单里的数据视图  dataView
      if (
        sessionStorage.menu_alias &&
        !this.dataView &&
        !this.ignoredAlias.includes(sessionStorage.menu_alias)
      ) {
        this.alias_new = sessionStorage.menu_alias
      }
      var url = '/templateForm/' + this.templateKey + '/' + action
      if (this.isJoinFlow) {
        this.alias_new = 'statement'
      }
      if (this.single == 'true') {
        // url = '/templateForm/' + this.templateKey + '/' + action + '/true'
      }
      //判断数据视图控件
      let isDataView = false
      if (this.dataView) {
        if (this.dataView.boDefAlias && this.dataView.boDefAlias != '') {
          isDataView = true
        }
      }

      if (openType == 'new' || this.isJoinFlow || isDataView) {
        url += '/new'
      }

      if (id) {
        url = url + '?id=' + id + '&'
      } else {
        url += '?'
      }
      let startFlowStr = 'startFlow=false'
      if (action == 'add' && defId && isStartFlow === false) {
        startFlowStr = 'startFlow=true'
      } else if (id && isStartFlow === false && defId) {
        startFlowStr = 'startFlow=true'
      }
      let dataUrl = ''
      if (this.dataView) {
        if (this.dataView.bindList && this.dataView.bindList.length > 0) {
          let bindList = []
          for (var i = 0; i < this.dataView.bindList.length; i++) {
            let item = {
              key: this.dataView.bindList[i].bindFilld,
              value: this.dataView.bindList[i].fillValue,
            }
            bindList.push(item)
          }
          dataUrl =
            '&bindList=' +
            encodeURIComponent(Base64.encode(JSON.stringify(bindList)))
        }
      }
      let path = url + startFlowStr
      if (dataUrl != '') {
        path = url + startFlowStr + dataUrl
      }
      //TODO 如果是模块开发 全部已新窗口打开
      if (openType == 'new' || this.isJoinFlow || isDataView) {
        window.open(
          this.$router.resolve({
            path: path + '&isNewPage=true',
            query: {
              quitAfterSaving,
            },
          }).href,
          '_blank'
        )
      } else if (openType === 'dialog') {
        let dialogWidth = this.dialogWidth
        let dialogHeight = this.dialogHeight
        if (
          clickType &&
          clickType === 'detail' &&
          this.templateInfo.displayField &&
          Array.isArray(eval(this.templateInfo.displayField))
        ) {
          eval(this.templateInfo.manageField).forEach((item) => {
            if (item.name === 'detail') {
              dialogWidth = item.dialogWidth + 'px'
              dialogHeight = item.dialogHeight + 'px'
            }
          })
        }
        this.$refs.templateFormDialog.showDialog({
          templateKey: this.templateInfo.alias,
          action,
          dialogParam: {
            id: id,
            isStartFlow: isStartFlow,
          },
          dialogWidth: dialogWidth,
          dialogHeight: dialogHeight,
          quitAfterSaving,
        })
        // this.dataViewDialogVisible = true
        // this.$refs.dataViewDialog.$el.firstChild.style.height = 740 + 'px'
        // this.srcUrl = path.replace(this.alias_new, 'statement')
      } else {
        // if (path.indexOf('othermenu') != -1) {
        //   path = path.replace('/othermenu', '/statement')
        // }
        this.$router.push({
          path,
          query: {
            quitAfterSaving,
          },
        })
      }
    },
    openUrl(
      url,
      type,
      row,
      fieldName,
      dialogWidth,
      dialogHeight,
      urlParamsStr
    ) {
      if (row && urlParamsStr) {
        let urlParams = JSON.parse(Base64.decode(urlParamsStr) || '[]')
        urlParams.forEach((item, i) => {
          if (i === 0) {
            url += '?' + item.name + '=' + (row[item.field] || '')
          } else {
            url += '&' + item.name + '=' + (row[item.field] || '')
          }
        })
      }
      if (row && fieldName) {
        url = this.handledUrlParams(url, row, fieldName)
      }

      if (type == 'new') {
        window.open(url, '_blank')
      } else if (type === 'dialog') {
        this.$refs.templateIframeDialog.showDialog({
          url: url,
          dialogWidth: dialogWidth,
          dialogHeight: dialogHeight,
        })
      } else {
        window.location.href = url
      }
    },
    // 递归查找
    getParentId(list, iid, key) {
      for (let o of list || []) {
        if (o[key] == iid) return o
        const o_ = this.getParentId(o.children, iid, key)
        if (o_) return o_
      }
    },

    handledUrlParams(url, row, fieldName) {
      if (this.templateInfo.displayField) {
        let displayFields = JSON.parse(this.templateInfo.displayField)
        let params = this.getParentId(displayFields, fieldName, 'name')
        if (params && params.urlParams && params.urlParams.length > 0) {
          let urlParams = params.urlParams
          let suffix = ''
          urlParams.forEach((param) => {
            if (suffix) {
              suffix += '&'
            }
            suffix = suffix + param.name + '=' + row[param.field]
          })
          if (suffix) {
            if (url.indexOf('?') != -1) {
              url = url + '&' + suffix
            } else {
              url = url + '?' + suffix
            }
            return url
          }
        }
      }
      return url
    },
    viewReport(data, jsonStr, openType) {
      let item = JSON.parse(Base64.decode(jsonStr))
      let conditionField = item.conditionField
      let querys = []
      // 构建查询参数
      if (conditionField && conditionField.length > 0) {
        conditionField.forEach((obj) => {
          if (obj.parameter) {
            querys.push({
              property: obj.key,
              value: data[obj.parameter],
              group: 'main',
              operation: obj.qt,
              relation: 'AND',
            })
          }
        })
      }

      if (!this.$requestConfig.viewReportURLHandler) {
        if (this.isMobile) {
          this.$message.error('移动端暂不支持通过该方式打开其他报表')
        }
        console.error(this.$t('ht.templatePreview.notUrl'))
        return
      }
      const appendQuerys =
        querys.length > 0
          ? encodeURIComponent(Base64.encode(JSON.stringify(querys)))
          : ''
      this.$requestConfig
        .viewReportURLHandler({
          item,
          querys,
        })
        .then((url) => {
          if (!url) {
            this.$message.error(
              this.$t('ht.templatePreview.notGetMenu', { alias: item.alias })
            )
            return
          }
          if (appendQuerys) {
            //TODO 构建初始查询参数
            // url = `${url}?${appendQuerys}`
          }
          if (openType == 'new') {
            window.open(this.$router.resolve(url).href, '_blank')
          } else if (openType == 'dialog') {
            this.$refs.templateIframeDialog.showDialog({
              url: this.$router.resolve(url).href,
            })
          } else {
            this.$router.push(url)
          }
        })
        .catch((err) => {
          console.error(`${this.$t('ht.templatePreview.pageJumpFail')}，${err}`)
        })
    },
    toStartFlow() {
      // if(this.checkSelect()){
      //   let row = this.tableData.selectRows[0];
      //   if(!row.isStartFlow){
      //     this.startFlow(defId);
      //   }else{
      //     this.$message({
      //       message: '该条数据已发起流程，不能再发起！',
      //       type: 'warning',
      //     })
      //   }
      // }
    },
    //顶部按钮 启动流程
    async startFlowByTopButton(pkField, afterScriptValue, templateId, defId) {
      var rows = this.tableData.selectRows
      if (!rows || rows.length <= 0) {
        //未选中数据时，直接进入启动流程页面
        this.scriptClick('startFlow', afterScriptValue, {
          templateId: templateId,
          id: '',
          action: 'startFlow',
          defId: defId,
          isStartFlow: false,
          openType: '',
          quitAfterSaving: '',
        })
        return
      }
      let loadingInstance = Loading.service({
        fullscreen: true,
      })
      //按照选中的数据记录，逐个启动流程
      let countAll = rows.length
      let countExists = 0
      let countFailed = 0
      for (let i = 0; i < rows.length; i++) {
        var id = rows[i][pkField]
        var instId = rows[i]['bpm_proc_inst_id_']
        if (instId && instId != '') {
          countExists++
          continue
        }
        let data = {
          defKey: this.templateInfo.defId,
          businessKey: id,
          boAlias: this.templateInfo.boDefAlias,
        }
        var result = await this.$requestConfig.startFormPromise(data)
        if (!result || !result.state) {
          countFailed++
        }
      }
      loadingInstance.close()
      let countSuccess = countAll - countFailed - countExists
      var msg = countSuccess + ' 条执行成功 <br/> '
      if (countExists > 0) {
        msg += countExists + ' 已存在流程实例，执行跳过 <br/> '
      }
      if (countFailed > 0) {
        msg += countFailed + ' 条执行失败'
      }
      this.$message({
        type: 'success',
        message: msg,
        dangerouslyUseHTMLString: true,
      })
    },
    startFlow(id) {
      let data = {
        defKey: this.templateInfo.defId,
        businessKey: id,
        boAlias: this.templateInfo.boDefAlias,
      }
      let loadingInstance = Loading.service({
        fullscreen: true,
      }) //开始
      this.$requestConfig.startForm(data).then((result) => {
        loadingInstance.close() // 结束
        if (result.state) {
          this.$message.success(result.message)
          this.search()
        } else {
          this.disabled = false
          this.$message.warning(result.message)
        }
      })
    },
    //点击导出按钮
    exports(type = '') {
      this.curSelectParams.queryFilter = this.curSelectParams.pagination
      if (!this.curSelectParams.queryFilter) {
        this.curSelectParams.queryFilter = {
          pageBean: this.pagination,
        }
      }
      if (!this.curSelectParams.queryFilter.querys) {
        this.curSelectParams.queryFilter.querys = []
      }
      if (this.treeQuerys) {
        this.treeQuerys.forEach((item) => {
          this.curSelectParams.queryFilter.querys.push(item)
        })
      }
      if (type === 'searchResult') {
        this.curSelectParams.queryFilter.querys = this.templateSearchQuery
      }
      this.$requestConfig
        .exportByBtnSetting({
          id: this.templateInfo.id,
          params: this.curSelectParams,
        })
        .then(({ data, headers }) => {
          const fileName = decodeURIComponent(
            headers['content-disposition'].split(';')[1].split('filename=')[1]
          )
          const blob = new Blob([data])
          saveAs(blob, fileName)
        })
    },
    importCommand(params) {
      switch (params.command) {
        case 'downloadTempFile':
          this.downloadMainTempFile()
          break
        case 'importMain':
          this.importMain()
          break
        case 'log':
          this.openLog()
          break
        case 'showImportResult':
          this.$refs['importResult'].showDialog(this.importCacheKey)
          break
        case 'showImportLog':
          this.importLogVisible = true
          this.$nextTick(() => {
            this.$refs.importLogTable.load()
          })
          break
        default:
          break
      }
    },
    openLog() {
      this.dialogVisible = true
    },
    downloadMainTempFile() {
      let customTemplateId = ''
      if (this.templateInfo && this.templateInfo.manageField) {
        let manageFieldList = JSON.parse(this.templateInfo.manageField)
        for (let index = 0; index < manageFieldList.length; index++) {
          let manage = manageFieldList[index]
          if (manage.name == 'import') {
            if (manage.importTemplate && manage.importTemplate.length > 0) {
              customTemplateId = manage.importTemplate[0].id
            }
            break
          }
        }
      }

      if (customTemplateId) {
        this.$requestConfig
          .download(customTemplateId)
          .then(({ data, headers }) => {
            const fileName = decodeURIComponent(
              headers['content-disposition'].split(';')[1].split('filename=')[1]
            )
            const blob = new Blob([data], {
              type: 'application/pdf',
            })
            saveAs(blob, fileName)
          })
      } else {
        let loadingInstance = Loading.service({
          fullscreen: true,
        }) //开始
        this.$requestConfig
          .downloadTempFile(this.templateInfo.alias)
          .then(({ data, headers }) => {
            const fileName = decodeURIComponent(
              headers['content-disposition'].split(';')[1].split('filename=')[1]
            )
            const blob = new Blob([data])
            saveAs(blob, fileName)
            loadingInstance.close() // 结束
          })
          .catch((e) => {
            console.error(e)
            loadingInstance.close()
          })
      }
    },

    importMain(param) {
      let formData = new FormData()
      formData.append('file', param.file)

      let params = {
        data: formData,
        alias: this.templateInfo.alias,
      }

      if (this.dataView) {
        this.handelBindFiledValua()
        params.bindFilld = this.dataView.bindFilld || ''
        params.fillValue = this.dataView.fillValue || ''
        params.refIdValue = this.dataView.refIdValue
      }

      let loadingInstance = Loading.service({
        fullscreen: true,
      }) //开始

      this.$requestConfig
        .dataTemplateMainImport(params)
        .then((data) => {
          if (data && data.state) {
            //导入成功之后重新渲染当前组件
            // this.$parent.refreshTime = new Date().getTime()
            // this.$message({ type: 'success', message: data.message })
            // param.onSuccess()
            // if (sessionStorage.getItem('formImportTempRefId')) {
            //   let json = JSON.parse(data.value)
            //   json.boAlias = this.dataView.boDefAlias
            //   let oldConf = sessionStorage.getItem('formImportTempJson')
            //   if (!oldConf) {
            //     sessionStorage.setItem(
            //       'formImportTempJson',
            //       JSON.stringify([json])
            //     )
            //   } else {
            //     let oldJosn = JSON.parse(oldConf)
            //     let isInOldJosn = false
            //     for (let index = 0; index < oldJosn.length; index++) {
            //       const old = oldJosn[index]
            //       if (
            //         old.tabName == json.tabName &&
            //         old.bindFilld == json.bindFilld
            //       ) {
            //         isInOldJosn = true
            //         break
            //       }
            //     }
            //     if (!isInOldJosn) {
            //       oldJosn.push(json)
            //     }
            //     sessionStorage.setItem(
            //       'formImportTempJson',
            //       JSON.stringify(oldJosn)
            //     )
            //   }
            // }
            // this.search()
            param.onSuccess()
            this.importCacheKey = data.value
            this.$refs['importResult'].showDialog(data.value)
          } else {
            param.onError()
          }
        })
        // .catch((error) => {
        //   let msg =
        //     (error.response &&
        //       error.response.data &&
        //       error.response.data.message) ||
        //     '导入失败！'
        //   this.$message.error(msg)
        // })
        .finally(() => {
          loadingInstance.close()
        })
    },
    afterImportSave() {
      this.importCacheKey = ''
      this.search()
    },
    //显示子表对话框
    showSubList(refId, options) {
      if (options) {
        this.subDialogOptions = options
      }
      this.refId = refId
      this.getSubEntsByFormKey(refId)
    },
    addFlow(manageFlowFormData, row) {
      let flowFormData = JSON.parse(Base64.decode(manageFlowFormData))

      if (!row) {
        if (this.checkSelect()) {
          row = this.tableData.selectRows[0]
        }
      }

      if (!row) {
        return
      }

      if (flowFormData.paramFields && flowFormData.paramFields.length > 0) {
        var data = {}
        flowFormData.paramFields.forEach((obj) => {
          data[obj.targetField] = row[obj.sourceField]
        })
      }

      let param = {
        bizType: 'startFlow',
        openType: flowFormData.openType,
        parameters: {
          defId: flowFormData.flow.id,
          data: encodeURIComponent(Base64.encode(JSON.stringify(data))),
        },
      }

      this.$requestConfig.openUrl(param)
    },
    addData(manageFlowFormData, row) {
      let flowFormData = JSON.parse(Base64.decode(manageFlowFormData))

      if (!row) {
        if (this.checkSelect()) {
          row = this.tableData.selectRows[0]
        }
      }
      if (!row) {
        return
      }
      //
      if (flowFormData.paramFields && flowFormData.paramFields.length > 0) {
        var data = {}
        flowFormData.paramFields.forEach((obj) => {
          data[obj.targetField] = row[obj.sourceField]
        })
      }

      let param = {
        bizType: 'addData',
        openType: flowFormData.openType,
        parameters: {
          previewTemplateAlias: flowFormData.report.key,
          data: encodeURIComponent(Base64.encode(JSON.stringify(data))),
        },
      }

      this.$requestConfig.openUrl(param)
    },
    searchData(manageFlowFormData, row) {
      let flowFormData = JSON.parse(Base64.decode(manageFlowFormData))

      if (!row) {
        if (this.checkSelect()) {
          row = this.tableData.selectRows[0]
        }
      }
      if (!row) {
        return
      }

      let querys = []
      if (flowFormData.paramFields && flowFormData.paramFields.length > 0) {
        flowFormData.paramFields.forEach((obj) => {
          querys.push({
            property: obj.targetField,
            value: row[obj.sourceField],
            group: 'main',
            operation: 'EQUAL',
            relation: 'AND',
          })
        })
      }

      let param = {
        bizType: 'searchData',
        openType: flowFormData.openType || 'new',
        parameters: {
          previewTemplateAlias: flowFormData.report.key,
          data: encodeURIComponent(Base64.encode(JSON.stringify(querys))),
        },
      }

      this.$requestConfig.openUrl(param)
    },
    //显示修改记录
    openRecordList(refId) {
      this.dialogRecordVisible = true
      this.recordRefId = refId
      let param = {
        pageBean: {
          page: 1,
          pageSize: 10,
          showTotal: true,
        },
        sorter: [
          {
            direction: 'ASC',
            property: 'modifyTime',
          },
        ],
        querys: [
          {
            property: 'ref_id_',
            value: this.recordRefId,
            group: 'main',
            operation: 'EQUAL',
            relation: 'AND',
          },
        ],
      }
      this.recordTableLoading = true
      this.$requestConfig.boDataModifyRecord(param).then((resp) => {
        this.recordTableLoading = false
        this.recordList = resp.rows
        this.modifyRecord.pagination.pageBean = {
          pageSize: resp.pageSize,
          page: resp.page,
          total: resp.total,
        }
      })
    },
    handleRecordCurrentChange(index, modifyRecord) {
      modifyRecord.pagination.pageBean.page = index
      let param = {
        pageBean: modifyRecord.pagination.pageBean,
        sorter: [
          {
            direction: 'ASC',
            property: 'modifyTime',
          },
        ],
        querys: [
          {
            property: 'ref_id_',
            value: this.recordRefId,
            group: 'main',
            operation: 'EQUAL',
            relation: 'AND',
          },
        ],
      }
      this.recordTableLoading = true
      this.$requestConfig.boDataModifyRecord(param).then((resp) => {
        this.recordTableLoading = false
        this.recordList = resp.rows
        this.modifyRecord.pagination.pageBean = {
          pageSize: resp.pageSize,
          page: resp.page,
          total: resp.total,
        }
      })
    },
    //取消修改记录对话框
    recordCancel() {
      this.dialogRecordVisible = false
      this.recordList = []
      this.recordRefId = ''
      this.modifyRecord = {
        pagination: {
          pageBean: {
            page: 1,
            pageSize: 10,
            total: 0,
          },
        },
      }
    },
    //
    openModifyDetail(row) {
      this.currentModify = row
      this.modifyDetailDialogVisible = true
    },
    //查看修改记录详情
    showModifyRecord(id, refId) {
      var url =
        '/templateForm/' +
        this.templateKey +
        '/get?single=true' +
        '&id=' +
        refId +
        '&startFlow=false&recordId=' +
        id +
        '&isNewPage=true'
      window.open(this.$router.resolve(url).href, '_blank')
      //this.$router.push(url)
    },
    //显示批量新增弹窗
    openBatchSaveList(dataViewParams) {
      this.$refs.batchSaveDialog.showDialog(dataViewParams)
    },
    batchSaveConfirm() {
      this.search()
    },
    //确定导出
    submitExport() {
      if (!this.exportData || this.exportData.expField.length < 1) {
        this.$message({
          type: 'info',
          message: this.$t('ht.templatePreview.selectExportField'),
        })
        return
      }

      if (this.exportType === 'main') this.exportMain()
      else
        this.exportSubData(
          this.exportData.expField,
          this.refId,
          this.currentTab.entName
        )
    },
    exportMain() {
      let expField = ''
      for (let i = 0; i < this.exportData.expField.length; i++) {
        if (i > 0) {
          expField += ','
        }
        expField += this.exportData.expField[i].name
      }
      expField = Base64.encode(expField)

      let data = {
        boAlias: this.templateInfo.alias,
        getType: this.exportData.getType,
        expField: expField,
        filterKey: '',
      }
      //data.query = this.getQueryFilter().pagination
      data.query = this.getParam().pagination

      if (this.dataView && this.dataView.bindSelectd) {
        data.query.querys.push({
          value: this.dataView.selectValue,
          operation: 'EQUAL',
          property: 'F_' + this.dataView.bindSelectd,
        })
      }
      let loadingInstance = Loading.service({
        fullscreen: true,
      }) //开始
      this.$requestConfig.templateExport(data).then(({ data, headers }) => {
        const fileName = decodeURIComponent(
          headers['content-disposition'].split(';')[1].split('filename=')[1]
        )
        const blob = new Blob([data])
        saveAs(blob, fileName)
        loadingInstance.close() // 结束
        this.dialogExportVisible = false
      })
      for (let i = 0; i < this.subDisplayFieldsList.length; i++) {
        this.exportSubData(
          this.$refs['subExportTable'][i].selection,
          '',
          this.subDisplayFieldsList[i].name
        )
        this.$set(this.$refs['subExportTable'][i], 'selection', [])
      }
    },
    exportSubData(expFields, refId, alias) {
      let expField = []
      for (let i = 0; i < expFields.length; i++) {
        expField.push({
          key: expFields[i].name,
          value: expFields[i].desc,
        })
      }
      let data = {
        alias: alias,
        refId: refId,
        type: this.exportData.getType,
        expField: JSON.stringify(expField),
        filterKey: '',
      }
      data.queryFilter = this.currentTab.pagination
      let loadingInstance = Loading.service({
        fullscreen: true,
      })
      this.$requestConfig
        .dataTemplateSubExport(data)
        .then(({ data, headers }) => {
          const fileName = decodeURIComponent(
            headers['content-disposition'].split(';')[1].split('filename=')[1]
          )
          const blob = new Blob([data])
          saveAs(blob, fileName)
          loadingInstance.close()
          this.dialogExportVisible = false
        })
        .catch((e) => {
          console.error(e)
          loadingInstance.close()
        })
    },
    //取消导出
    exportCancel() {
      this.dialogExportVisible = false
      this.exportData.expField = []
    },
    //取消子表对话框
    subCancel() {
      this.dialogSubVisible = false
      this.tabs = []
      this.ents = []
    },
    sunCancel() {
      this.dialogSunVisible = false
      this.sunTabs = []
    },
    handleExportSelectionChange(val) {
      this.exportData.expField = []
      if (val) {
        this.exportData.expField = val
      }
    },
    //全选
    handleExportSelectAll() {
      this.exportData.expField = this.displayFields
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
          this.$set(this.displayFields, index - 1, this.displayFields[index])
          this.$set(this.displayFields, index, temp)
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
          this.$set(this.displayFields, index + 1, this.displayFields[index])
          this.$set(this.displayFields, index, i)
        }
      }
    },
    async getSunData(tab, row) {
      let ents = tab.childEnts
      let pk = tab.pkKey
      let refId = ''
      if (row[pk.toLocaleLowerCase()]) {
        refId = row[pk.toLocaleLowerCase()]
      } else {
        refId = row[pk.toUpperCase()]
      }
      this.subTableLoading = true
      if (ents && ents.length > 0) {
        for (let i = 0; i < ents.length; i++) {
          let tab = await this.getBoData(ents[i], refId)
          this.sunTabs.push(tab)
        }
      }
      this.subTableLoading = false
      this.dialogSunVisible = true
    },
    getBoData(ent, refId) {
      let attributeList = ent.attributeList.filter((obj) => !obj.isShow)
      let tab = {
        refId: refId,
        pkKey: ent.pkKey,
        name: ent.tableName,
        entName: ent.name,
        title: ent.comment,
        attributeList: attributeList,
        comment: ent.comment,
        pagination: {
          pageBean: {
            pageSize: 10,
            page: 1,
            total: 0,
          },
        },
      }
      tab.childEnts = []
      if (ent.childEnts && ent.childEnts.length > 0) {
        tab.childEnts = ent.childEnts
      }
      return new Promise((resolve) => {
        this.getSubDataPagination(tab, ent.name, refId, resolve, null)
      })
    },
    getSubEntsByFormKey(refId) {
      /*if (!this.ents || this.ents.length < 1) {
        form.getSubEntsByFormKey(this.templateInfo.formKey, (resp) => {
          // 子表与孙表字段名设置小写
          for (let i = 0; i < resp.data.length; i++) {
            resp.data[i].attributeList.forEach(attribute => {
              attribute.fieldName = attribute.fieldName.toLowerCase();
            })
            resp.data[i].childEnts.forEach(showChildEnt => {
              showChildEnt.attributeList.forEach(attribute => {
                attribute.fieldName = attribute.fieldName.toLowerCase();
              })
            })
          }
          this.ents = resp.data;
        });
      } else {*/
      this.getSubData(this, refId)
      /* }*/
    },
    async getSubData(_me, refId) {
      //let ents = this.ents;
      let ents = JSON.parse(_me.templateInfo.subField)

      if (ents && ents.length > 0) {
        for (let i = 0; i < ents.length; i++) {
          ents[i].attributeList.forEach((attr) => {
            attr.fieldName = attr.fieldName.toLowerCase()
          })
          ents[i].childEnts.forEach((showChildEnt) => {
            showChildEnt.attributeList.forEach((attribute) => {
              attribute.fieldName = attribute.fieldName.toLowerCase()
            })
          })
          let tab = await this.getBoData(ents[i], refId)
          this.tabs.push(tab)
        }
      }
      if (this.showTabsList && this.showTabsList.length) {
        this.currentTabName = this.showTabsList[0].comment
      }
      this.dialogSubVisible = true
    },
    nodeClick(node) {
      this.pagination.page = 1
      //每次点击过滤树,应该把右边的table 与分页全部重置为初始

      let pageBean = {
        pageBean: {
          page: 1,
          pageSize: this.pagination.pageSize,
        },
      }
      if (this.filterQuerys.length > 0) {
        pageBean.querys = _.cloneDeep(this.filterQuerys)
      } else {
        pageBean.querys = []
      }
      if (!node.id || node.id != -1) {
        let treeField = JSON.parse(this.templateInfo.treeField)
        let queryScope = treeField.queryScope
        treeField.querys.forEach((item) => {
          let value = node[item.value_]
          let operation = 'EQUAL'
          if (queryScope === 'currentAndSubordinate') {
            //查询当前层级和下属层级
            value = this.getTreeBindValue(
              item.value_,
              treeField.pidVal,
              node,
              treeField
            )
            operation = 'IN'
          }
          if (item.key_ && item.value_) {
            pageBean.querys.push({
              property: `${item.key_.colPrefix}${item.key_.name}`,
              value,
              group: 'main',
              operation,
              relation: 'AND',
            })
          }
        })
      }
      //把过滤树的查询条件存一份起来,右边的搜索与分页才能同时使用
      this.treeQuerys = pageBean.querys

      let params = {
        templateId: this.templateInfo.id,
        pagination: pageBean,
      }
      this.reset(true)
      //数据视图控件
      if (this.dataView) {
        if (this.dataView.selectList && this.dataView.selectList.length > 0) {
          params.selectList = this.dataView.selectList
        }
      }
      const this_ = this
      if (this_.isJoinFlow) {
        params.isJoinFlow = true
        params.taskType = this_.taskType
        params.defKey = this_.defKey
      }
      this.handleInitQuery(params)
      this.getBpmTemplateByPagination(params)
    },
    filterChange(filters) {
      if (filters && Object.keys(filters).length > 0) {
        const key = Object.keys(filters)[0]
        const filter = filters[key]
        if (!filter || filter.length <= 0) {
          this.filterQuerys = []
          return
        }
        let query = {
          property: key,
          value: filter[0],
          group: 'filter',
          relation: 'AND',
        }
        if (filter.length == 1) {
          query.operation = 'EQUAL'
        } else if (filter.length > 1) {
          query.operation = 'IN'
          query.value = filter
        }
        const filteringField = JSON.parse(
          this.templateInfo.filteringField || '[]'
        )
        filteringField.map((item) => {
          if (
            (item.name === key && !key.startsWith('F_')) ||
            (item.id === key && !key.startsWith('F_'))
          ) {
            if (
              this.templateInfo.mainTalbeName &&
              this.templateInfo.mainTalbeName.toLowerCase() ==
                item.tableName.toLowerCase()
            ) {
              query.property = `${item.tableName}.${item.oldTableField}`
            } else {
              if (item.queryPre) {
                query.property = item.queryPre + item.oldTableField
              } else {
                query.property = item.colPrefix + key
              }
            }
          }
        })
        if (this.filterQuerys.length > 0) {
          const queryList = _.cloneDeep(this.filterQuerys)
          queryList.map((item) => {
            if (
              !(
                item.property.replace('F_', '') === key &&
                utils.arrayEquals(item.value, filter)
              )
            ) {
              this.filterQuerys.push(query)
            }
          })
        } else {
          this.filterQuerys.push(query)
        }
      } else {
        this.filterQuerys = []
      }
    },
    //加载树的信息
    toTreeData(data, id, pid, name, pvalue) {
      // 建立个树形结构,需要定义个最顶层的父节点，pvalue是0
      let parents = data.filter(
        (value) =>
          value[id] == value[pid] || value[pid] == null || value[pid] == pvalue
      )
      if (!parents) {
        parents = data.filter(
          (value) =>
            value[pid] !== 'undefined' &&
            value[pid] != null &&
            value[id] != value[pid]
        )
      }
      return parents
    },
    //初始化树
    initTree(treeField) {
      const this_ = this
      this.$requestConfig
        .getCustomDialogByAlias(treeField.alias)
        .then((res) => {
          this_.customDialog = res

          this.$requestConfig
            .getCustomDialogTreeData(treeField.alias)
            .then((resp) => {
              if (this_.customDialog.displayfield) {
                let displayfield = JSON.parse(this_.customDialog.displayfield)
                this_.displayField = displayfield
                this_.treeList = resp
                let head = {}
                head[displayfield.displayName] = this_.$t('ht.selector.all')
                head.id = -1
                this_.tree.push(head)
                this_.$nextTick(() => {
                  this_.setDefaultExpand()
                })
              }
            })
        })
    },
    loadTree(node, resolve) {
      if (node) {
        if (node.data.id === -1) {
          let tree = this.toTreeData(
            this.treeList,
            this.displayField.id,
            this.displayField.pid,
            this.displayField.displayName,
            this.displayField.pvalue ? this.displayField.pvalue : '0'
          )
          resolve(tree)
        } else {
          resolve(
            this.treeList.filter(
              (value) =>
                value[this.displayField.pid] === node.data[this.displayField.id]
            )
          )
        }
      } else {
        resolve([])
      }
    },
    handleSubCurrentChange(index, tab) {
      tab.pagination.pageBean.page = index
      this.handleLoadSubData(tab)
    },
    handleSubSizeChange(pageSize, tab) {
      tab.pagination.pageBean.pageSize = pageSize
      this.handleLoadSubData(tab)
    },
    handleLoadSubData(tab) {
      this.subTableLoading = true
      this.getSubDataPagination(
        tab,
        tab.entName,
        tab.refId ? tab.refId : this.refId,
        null,
        () => {
          this.subTableLoading = false
        }
      )
    },
    getSubDataPagination(tab, name, refId, resolve, final) {
      this.$requestConfig
        .getDataTemplateSubData({
          pagination: tab.pagination,
          name: name,
          refId: refId,
        })
        .then((data) => {
          if (data && data.rows.length > 0) {
            tab.dataList = data.rows
            tab.pagination.pageBean.pageSize = data.pageSize
            tab.pagination.pageBean.page = data.page
            tab.pagination.pageBean.total = data.total
          } else {
            tab.dataList = []
            tab.pagination.pageBean.pageSize = 10
            tab.pagination.pageBean.page = 1
            tab.pagination.pageBean.total = 0
          }
          resolve && resolve(tab)
        })
        .finally(() => {
          final && final()
        })
    },
    querySubTable(tab) {
      tab.pagination.querys = []
      if (this.querySubValue) {
        tab.attributeList.forEach((item) => {
          //pgSql使用模糊查询，类型不匹配时会报错，此处只保留varchar类型
          // if (item.dataType == 'varchar') {
          tab.pagination.querys.push({
            property: item.fieldName,
            value: this.querySubValue,
            group: 'other',
            operation: 'LIKE',
            relation: 'OR',
          })
          // }
        })
      } else if (this.querySunValue) {
        tab.attributeList.forEach((item) => {
          // if (item.dataType == 'varchar') {
          tab.pagination.querys.push({
            property: item.fieldName,
            value: this.querySunValue,
            group: 'other',
            operation: 'LIKE',
            relation: 'OR',
          })
          // }
        })
      }
      this.handleSubCurrentChange(1, tab)
    },
    importSub(param) {
      let formData = new FormData()
      formData.append('file', param.file)
      let params = {
        data: formData,
        alias: this.currentTab.entName,
        refId: this.refId,
        formKey: this.templateInfo.formKey,
      }
      this.$requestConfig.dataTemplateSubImport(params).then((data) => {
        if (data && data.state) {
          this.$message({
            type: 'success',
            message: data.message,
          })
          param.onSuccess()
          this.handleSubCurrentChange(1, this.currentTab)
        } else {
          this.$message.error(data.message)
          param.onError()
        }
      })
    },
    exportSub(tab) {
      this.exportType = 'sub'
      this.currentTab = tab
      this.displayFields = []
      this.subDisplayFieldsList = []
      tab.attributeList.forEach((item) => {
        if (!item.isShow) {
          this.displayFields.push({
            desc: item.comment,
            name: item.fieldName,
            type: item.columnType,
          })
        }
      })
      this.dialogExportVisible = true
    },
    importButton(tab) {
      this.currentTab = tab
    },
    myDraftList() {
      //数据视图随机添加到其他菜单下面时获取当前菜单的别名  并且当前数据视图不是表单里的数据视图  dataView
      if (
        sessionStorage.menu_alias &&
        !this.dataView &&
        !this.ignoredAlias.includes(sessionStorage.menu_alias)
      ) {
        this.alias_new = sessionStorage.menu_alias
      }
      let dataViewFlag = false
      //判断当前数据视图是不是表单里的数据视图
      if (this.dataView) {
        if (this.dataView.boDefAlias && this.dataView.boDefAlias != '') {
          dataViewFlag = true
        }
      }
      let path =
        '/templateDraftList/' +
        this.templateInfo.alias +
        '?dataViewFlag=' +
        dataViewFlag
      if (this.openType == 'new' || dataViewFlag) {
        path += '&isNew=true'
      }
      if (dataViewFlag) {
        window.open(path, '_blank')
      } else {
        this.$router.push(path)
      }

      // let url =
      //   "/statement/draftList?tempAlias=" + ;
      // const { href } = this.$router.push({
      //   path: url,
      // });
      // window.open(href, "_blank");
    },
    initSwitchStatus() {
      //初始化开关状态
      let manages = utils.parseToJson(this.templateInfo.manageField)
      for (let i = 0; i < manages.length; i++) {
        if (manages[i].name === 'switch') {
          let fieldName = manages[i].bind
          this.$set(this.switchMap, fieldName, {})
          this.switchMap[fieldName].on = manages[i].switchOn
          this.switchMap[fieldName].off = manages[i].switchOff
          this.switchMap[fieldName].onLabel = manages[i].switchOnLabel
          this.switchMap[fieldName].offLabel = manages[i].switchOffLabel
        }
      }
    },
    switchChange(pkVal, on, off, fieldName, row, defaultTrue) {
      let this_ = this
      const fileNameDisplay = this.getBindField(row, fieldName)
      let val = this.getBindValue(row, fieldName)
      this_
        .$confirm(this_.$t('ht.templatePreview.isChangeDataTip'), {
          confirmButtonText: this_.$t('ht.common.confirm'),
          cancelButtonText: this_.$t('ht.common.cancle'),
          type: 'warning',
        })
        .then(() => {
          if (val == on) {
            this.$set(row, fileNameDisplay, off)
            val = off
          } else if (val == off) {
            this.$set(row, fileNameDisplay, on)
            val = on
          } else {
            if (defaultTrue == 'true') {
              this.$set(row, fileNameDisplay, off)
              val = off
            } else {
              this.$set(row, fileNameDisplay, on)
              val = on
            }
          }
          let formAlias = this_.templateInfo.formKey //表单别名
          let dataDefAlias = this_.templateInfo.boDefAlias //数据建模别名
          this.$requestConfig
            .getDataTemplateForm(formAlias, dataDefAlias, pkVal)
            .then((resp) => {
              let boData = resp.data
              boData[dataDefAlias][fieldName] = val
              let saveData = {
                boAlias: this_.templateInfo.boDefAlias,
                boData: resp.data,
                templateKey: this.templateInfo.alias,
              }
              if (saveData.formKey) {
                saveData.boData.formKey = saveData.formKey
              }
              if (saveData.templateKey) {
                saveData.boData.templateKey = saveData.templateKey
              }
              this_.$requestConfig.boSave(saveData).then((result) => {
                if (result.state) {
                  this_.$message({
                    type: 'success',
                    message: this_.$t('ht.templatePreview.savaSuccess'),
                  })
                } else {
                  this_.$message({
                    type: 'error',
                    message: this_.$t('ht.templatePreview.hasCancelOperate'),
                  })
                }
              })
            })
        })
        .catch(() => {
          this_.$message({
            message: this_.$t('ht.templatePreview.savaFail'),
          })
          // let formAlias = this_.templateInfo.formKey //表单别名
          // let dataDefAlias = this_.templateInfo.boDefAlias //数据建模别名
          // this.$requestConfig
          //   .getDataTemplateForm(formAlias, dataDefAlias, pkVal)
          //   .then((resp) => {
          //     this_.$set(row, fieldName, resp.data[dataDefAlias][fieldName])
          //   })
        })
    },
    display(mpDisplay) {
      if (this.isMobile) {
        return mpDisplay === '1'
      }
      //pc端的数据报表不需要做本方法的处理，直接返回true即可。
      return true
    },
    getFixed(fixed) {
      return fixed
    },
    summary(method, field, decimal, currentData) {
      let fields = field.toLowerCase()
      const currentRows = currentData ? currentData : this.rows
      let list =
        currentRows &&
        currentRows
          .filter((item) => item[fields] !== undefined && item[fields] !== '')
          .map((item) => Number(item[fields]))
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
    getColor(data, row) {
      let resuColor = 'color:black'
      let decode = Base64.decode(data)
      let colorRule = JSON.parse(decode)
      if (colorRule && colorRule instanceof Array) {
        colorRule.forEach((rule) => {
          let Fn = Function('data', rule.proRule)
          if (Fn(row)) {
            resuColor = 'color:' + rule.proColor
          }
        })
      }
      return resuColor
    },
    getProValue(value, rule) {
      const result = Math.round((value / rule) * 10000) / 100
      // 进度条返回的数据应该在[0,100]这个区间
      return isNaN(result) ? 1 : result > 100 ? 100 : result
    },
    getProColor(data, row) {
      let resuColor = '#409eff'
      let decode = Base64.decode(data)
      /*decode=decode.replace(/\s*!/g,"");*/
      let colorRule = JSON.parse(decode)
      if (colorRule && colorRule instanceof Array) {
        colorRule.forEach((rule) => {
          let Fn = Function('data', rule.proRule)
          if (Fn(row)) {
            resuColor = rule.proColor
          }
        })
      }
      return resuColor
    },
    isSortable(field) {
      let isClob = false
      this.displayFields.forEach((item) => {
        if (item.name === field && item.type === 'clob') {
          isClob = true
        }
      })
      return !this.notSortableFields.includes(field) && !isClob
    },
    isPropTable(field, tableName, oldTableField) {
      if (
        this.templateInfo.mainTalbeName.toLowerCase() == tableName.toLowerCase()
      ) {
        return `t.${oldTableField}`
      } else {
        return `${tableName}.${oldTableField}`
      }
    },
    customEvilJS(row, htScript, configSetting) {
      if (configSetting && configSetting.dialogWidth) {
        this.dialogWidth = configSetting.dialogWidth + 'px'
      }
      if (configSetting && configSetting.dialogHeight) {
        this.dialogHeight = configSetting.dialogHeight + 'px'
      }
      if (configSetting && configSetting.openType) {
        this.openType = configSetting.openType
      }
      let Fn = Function('_req', 'row', '_this', Base64.decode(htScript)) //一个变量指向Function，防止有些前端编译工具报错
      Fn(req, row, this)
    },
    //数据更新
    batchUpdate(title, base64Json, base64Fileds, afterScript, row) {
      this.batchUpdataTitle = title
      this.updatingRow = row
      let defaultValueList = []
      let outForm = []
      if (base64Json) {
        //是否有用户自己输入的字段
        let res = true
        let batchUpdateData = JSON.parse(Base64.decode(base64Json))
        let filedsObj = JSON.parse(Base64.decode(base64Fileds))
        batchUpdateData.forEach((item) => {
          if (item.valueType == 1) {
            var isRequired = false
            if (item.isRequired) {
              isRequired = true
            }
            let descField = item.name
            // 外部表不需要去除 F_
            // 其余表需要去除
            if (this.templateInfo.isExternal !== 1) {
              //item中主表字段没有F_开头
              descField = item.name.toLowerCase().replace('f_', '')
            }
            let obj = {
              name: item.name,
              desc: filedsObj[descField],
              outType: item.outValueType,
              single: false,
              selectCurrent: false,
              isRequired: isRequired,
            }
            if (item.outValueType == 'select') {
              let selectConfig = JSON.parse(item.outConfig)
              obj.ganged = {
                alias: '',
                valueBind: '',
                noInit: '',
                labelBind: '',
                bind: {},
              }
              if (selectConfig.customQuery) {
                let ganged = {
                  alias: selectConfig.customQuery.alias,
                  valueBind: selectConfig.customQuery.valueBind,
                  noInit: '',
                  labelBind: selectConfig.customQuery.labelBind,
                  bind: {},
                }
                obj.ganged = ganged
              }
              obj.selectData = selectConfig.selectData
            } else if (item.outValueType == 'dialog') {
              let selectConfig = JSON.parse(item.outConfig)
              let dialogConfig = selectConfig.dialogConfig
              let mappingConf = []
              let parameter = selectConfig.parameter
              for (let key in parameter) {
                let value = parameter[key] || ''
                mappingConf.push({
                  from: key,
                  target: [value],
                  targetSub: [value],
                })
              }
              let custdialog = {
                selectNum: dialogConfig.selectNum,
                conditions: [],
                mappingConf: mappingConf,
                custQueryJson: [],
                alias: dialogConfig.alias,
                type: dialogConfig.custDialog,
              }
              obj.custdialog = {
                name: this.$t('ht.common.select'),
                custDialog: custdialog,
                resultField: dialogConfig.resultField,
              }
            } else if (
              item.outConfig &&
              (item.outValueType != 'input' ||
                item.outValueType != 'data' ||
                item.outValueType != 'number')
            ) {
              let outConfig = JSON.parse(item.outConfig)
              let parameter = outConfig.parameter
              for (let key in parameter) {
                if (!parameter[key]) {
                  delete parameter[key]
                } else {
                  parameter[key] = 'data.' + parameter[key]
                }
              }
              if (outConfig.selectCurrent) {
                obj.selectCurrent = outConfig.selectCurrent
              }
              if (outConfig.isSingle) {
                obj.single = outConfig.isSingle
              }
              obj.bindConfig = parameter
            }
            outForm.push(obj)
            res = false
          } else {
            defaultValueList.push({
              key: item.name,
              value: item.defaultValue,
            })
          }
        })
        if (res) {
          if (row) {
            this.updateBo(defaultValueList, row, afterScript)
          } else {
            this.updateBo(defaultValueList, row, afterScript)
          }
        } else {
          this.defaultValueList = defaultValueList
          this.$refs.templateBatchUpdateDialog.showDialog(title, outForm)
        }
      } else {
        this.$message({
          type: 'info',
          message: this.$t('ht.templatePreview.notUpdate'),
        })
      }
    },
    //数据更新弹窗确认
    onConfirm(data) {
      let defaultValueList = []
      for (var key in data) {
        defaultValueList.push({
          key: key,
          value: data[key],
        })
      }
      let boData = this.defaultValueList
        ? this.defaultValueList.concat(defaultValueList)
        : this.defaultValue
      this.updateBo(boData)
    },
    //数据更新-接口调用
    // updateBo(defaultValueList, row, afterScriptValue) {
    //   if (this.updatingRow) {
    //     row = this.updatingRow
    //   }
    //   this.$confirm(
    //     this.$t('ht.templatePreview.updateDataTip'),
    //     this.$t('ht.common.tips'),
    //     {
    //       confirmButtonText: this.$t('ht.common.confirm'),
    //       cancelButtonText: this.$t('ht.common.cancle'),
    //       type: 'warning',
    //     }
    //   )
    //     .then(() => {
    //       let selectRows = row
    //         ? [row]
    //         : this.tableData.selectRows
    //           ? this.tableData.selectRows
    //           : row
    //       for (let i = 0; i < selectRows.length; i++) {
    //         selectRows[i].formKey = this.templateInfo.formKey
    //         for (let j = 0; j < defaultValueList.length; j++) {
    //           selectRows[i][defaultValueList[j].key] = defaultValueList[j].value
    //         }
    //       }
    //       let data = {
    //         boData: selectRows,
    //         boAlias: this.templateInfo.boDefAlias,
    //         templateId: this.templateInfo.id,
    //       }
    //       this.$requestConfig.batchUpdateTemplateData(data).then((data) => {
    //         if (data.state) {
    //           this.$message({
    //             type: 'success',
    //             message: data.message,
    //           })
    //           this.search({
    //             querys: this.buildDefaultQuerys() || [],
    //           })
    //           // 更新成功后需执行后置js
    //           let script = Base64.decode(afterScriptValue)
    //           this.tempScript(script, row)
    //         }
    //       })
    //     })
    //     .catch(() => {
    //       this.$message({
    //         type: 'info',
    //         message: this.$t('ht.templatePreview.cancelUpdate'),
    //       })
    //     })
    // },
    //迁移思元数据更新-接口调用
    updateBo(defaultValueList, row, afterScriptValue) {
      if (this.updatingRow) {
        row = this.updatingRow
      }
      // row 有值是列按钮操作
      let selectAll =
        this.tableData.selectRows == null ||
        this.tableData.selectRows.length == 0
          ? true
          : false
      this.$confirm(
        row
          ? this.$t('ht.templatePreview.updateDataTip')
          : selectAll
          ? this.$t('ht.templatePreview.updateDataAllTip')
          : this.$t('ht.templatePreview.updateDataTip'),
        this.$t('ht.common.tips'),
        {
          confirmButtonText: this.$t('ht.common.confirm'),
          cancelButtonText: this.$t('ht.common.cancle'),
          type: 'warning',
        }
      )
        .then(() => {
          let ids = []
          if (row) {
            ids.push(row['id_'])
          } else {
            if (!selectAll) {
              this.tableData.selectRows.forEach((item) => {
                ids.push(item['id_'])
              })
            }
          }
          let data = {
            queryFilter: this.curSelectParams.queryFilter,
            params: defaultValueList,
            ids: ids,
            boAlias: this.templateInfo.alias,
            templateId: this.templateInfo.id,
            title: this.batchUpdataTitle,
          }
          const loading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)',
          })
          this.$requestConfig
            .request({
              url: '${portal}/form/dataTemplate/v1/newBoBatchUpdate2',
              method: 'post',
              data: data,
              timeout: 100000000,
            })
            .then(async (resp) => {
              if (resp.state) {
                let result = []
                result = resp.value
                if (result && result.length > 0) {
                  result.forEach((temp) => {
                    let data = temp.data
                    let formals = temp.formals
                    if (formals && formals.length > 0) {
                      formals.forEach((temp2) => {
                        let key = temp2.field
                        try {
                          data[key] = eval(temp2.value)
                        } catch (e) {
                          this.$message({
                            type: 'error',
                            message:
                              '计算失败，' + temp2.value + ' 公式配置错误',
                          })
                          throw new Error('End Loop')
                        }
                      })
                    }
                  })
                  await this.updateData(result, row, afterScriptValue, loading)
                } else {
                  loading.close()
                }
              }
            })
            .catch(() => loading.close())
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('ht.templatePreview.cancelUpdate'),
          })
        })
    },
    updateData(data, row, afterScriptValue, loading) {
      this.$requestConfig
        .request({
          url: '${portal}/form/dataTemplate/v1/computeListBatchUpdate',
          method: 'post',
          data: data,
          timeout: 100000000,
        })
        .then((rel) => {
          if (rel && rel.state) {
            this.$message({
              type: 'success',
              message: rel.message,
            })
            this.search({
              querys: this.buildDefaultQuerys() || [],
            })
            // 更新成功后需执行后置js
            let script = Base64.decode(afterScriptValue)
            this.tempScript(script, row)
          }
        })
        .finally(() => loading.close())
    },
    addCommand(command) {
      if (command == 'notLogin' || command == 'login') {
        this.getAddQRCode(command)
      }
    },
    getAddQRCode(command) {
      this.QRCodePattern = command == 'notLogin' ? true : false
      this.QRCodeDesc = []
      this.QRCodeType = 'add'
      this.QRCodeShow = false
      this.QRCodeDialog = true
    },
    showSearchPane() {
      return true
    },
    buildDefaultQuerys(isSetSearchForm = true) {
      let this_ = this
      let querys = []
      let conditions = JSON.parse(this_.templateInfo.conditionField)
      //条件字段默认值判断
      conditions.forEach((condition) => {
        if (condition.defaultValue) {
          let field = condition.colPrefix + condition.na
          if (isSetSearchForm) {
            this_.$set(this_.searchForm, field, condition.defaultValue)
          }
          let value = condition.defaultValue
          if (condition.ty == 'number') {
            value = parseFloat(value)
          }
          querys.push({
            property: condition.queryPre ? condition.queryPre + field : field,
            value: value,
            group: 'main',
            operation: condition.qt.toUpperCase(),
            relation: 'AND',
          })
        }
      })
      //筛选字段默认值判断

      if (this.parameterqQuerys) {
        let parameterQuerys = JSON.parse(Base64.decode(this.parameterqQuerys))
        if (parameterQuerys && parameterQuerys.length > 0) {
          parameterQuerys.forEach((query) => {
            let prefix = this.templateInfo.isExternal === 1 ? '' : 'F_'
            query.property = prefix + query.property
            if (isSetSearchForm) {
              this_.$set(this_.searchForm, query.property, query.value)
            }
            querys.push(query)
          })
        }
      }
      let filters = JSON.parse(this_.templateInfo.filteringField)
      filters.forEach((filter) => {
        if (filter.defaultValue && filter.defaultValue.length > 0) {
          this_.filterMap[filter.name] = filter.defaultValue
          filter.defaultValue.forEach((val) => {
            querys.push({
              property: `${filter.queryPre || ''}${filter.colPrefix}${
                filter.name
              }`,
              value: val,
              group: 'defVal_' + filter.name,
              operation: 'EQUAL',
              relation: 'OR',
            })
          })
        }
      })
      this_.$on('afterMounted', () => {
        const tab = document.getElementById(this_.templateInfo.alias)
        if (tab && tab.__vue__) {
          let headerColumns = tab.__vue__.$refs.tableHeader
            ? tab.__vue__.$refs.tableHeader.columns
            : []
          headerColumns.forEach((column) => {
            if (this_.filterMap.hasOwnProperty(column.property)) {
              this_.filterMap[column.property].forEach((val) => {
                column.filteredValue.push(val)
              })
            }
          })
        }
      })
      return querys
    },
    handleClose() {
      this.dataViewDialogVisible = false
    },
    startFlowSucess(m) {
      this.$message.success(m)
      this.search()
    },
    async scriptClick(btnAlias, afterScriptValue, parameter) {
      if (parameter && parameter.dialogWidth) {
        this.dialogWidth = parameter.dialogWidth + 'px'
      }
      if (parameter && parameter.dialogHeight) {
        this.dialogHeight = parameter.dialogHeight + 'px'
      }
      if (parameter && parameter.openType) {
        this.openType = parameter.openType
      }
      let row = null
      if (parameter) {
        row = parameter.row
        let rowId = parameter.id || parameter.pkField
        if ((!row || row == undefined) && rowId) {
          row = this.rows.filter(
            (item) => item[this.templateInfo.pkField] == rowId
          )[0]
        }
      }
      //后置脚本执行结果为false则不执行下面的逻辑
      if (afterScriptValue) {
        let script = Base64.decode(afterScriptValue)
        let scriptResult = await this.tempScript(script, row)
        if (!scriptResult) {
          return
        }
      }
      let btn = [
        'add',
        'edit',
        'del',
        'print',
        'url',
        'import',
        'deleted',
        'export',
        'copyOne',
        'copyAll',
        'detail',
        'record',
        'printDetail',
        'sub',
        'js',
        'startFlow',
        'addFlow',
        'addData',
        'searchData',
        'batchSave',
      ] //点击按钮就触发

      let btnOk = ['switch', 'batchUpdate'] //需要点击确认按钮才触发
      if (btn.indexOf(btnAlias) != -1) {
        if (btnAlias == 'add') {
          this.operating(
            parameter.templateId,
            parameter.id,
            parameter.action,
            parameter.defId,
            parameter.isStartFlow,
            parameter.openType,
            parameter.quitAfterSaving
          )
        } else if (btnAlias == 'edit') {
          if (parameter && parameter.id) {
            this.operating(
              parameter.templateId,
              parameter.id,
              parameter.action,
              parameter.defId,
              parameter.isStartFlow,
              parameter.openType,
              parameter.quitAfterSaving
            )
          } else if (this.checkSelect()) {
            parameter.id = this.tableData.selectRows[0].id_
            parameter.isStartFlow = this.tableData.selectRows[0].isStartFlow
            this.operating(
              parameter.templateId,
              parameter.id,
              parameter.action,
              parameter.defId,
              parameter.isStartFlow,
              parameter.openType,
              parameter.quitAfterSaving
            )
          }
        } else if (btnAlias == 'batchSave') {
          //表单视图
          let dataViewParams = {
            templateId: parameter.templateId,
          }
          if (this.dataView && this.dataView.selectList) {
            dataViewParams['bindList'] = this.dataView.bindList
          }
          this.openBatchSaveList(dataViewParams)
        } else if (btnAlias == 'del') {
          this.del(parameter.pkField)
        } else if (btnAlias == 'print') {
          this.printList()
        } else if (btnAlias == 'url') {
          this.openUrl(
            parameter.url,
            parameter.openType,
            parameter.row,
            parameter.fieldName,
            parameter.dialogWidth,
            parameter.dialogHeight,
            parameter.urlParams
          )
        } else if (btnAlias == 'export') {
          this.exports(parameter.exportSettingFields)
        } else if (btnAlias == 'deleted') {
          this.deleted()
        } else if (btnAlias == 'copyOne') {
          this.copyOne(parameter)
        } else if (btnAlias == 'copyAll') {
          this.copyAll()
        } else if (btnAlias == 'detail' && this.checkSelect()) {
          parameter.id = this.tableData.selectRows[0].id_
          this.operating(
            parameter.templateId,
            parameter.id,
            parameter.action,
            parameter.defId,
            parameter.isStartFlow,
            parameter.openType,
            parameter.quitAfterSaving
          )
        } else if (btnAlias == 'record' && this.checkSelect()) {
          //修改记录
          this.openRecordList(this.tableData.selectRows[0].id_)
        } else if (btnAlias == 'printDetail' && this.checkSelect()) {
          parameter.id = this.tableData.selectRows[0].id_
          this.printDetail(parameter.templateId, parameter.id, parameter.action)
        } else if (btnAlias == 'sub' && this.checkSelect()) {
          this.showSubList(this.tableData.selectRows[0].id_, parameter)
        } else if (btnAlias == 'js' && this.checkSelect()) {
          this.customEvilJS(this.tableData.selectRows[0], parameter.jsValue)
        } else if (
          btnAlias == 'startFlow' &&
          parameter.defId &&
          !parameter.isStartFlow
        ) {
          this.operating(
            parameter.templateId,
            parameter.id,
            parameter.action,
            parameter.defId,
            parameter.isStartFlow,
            parameter.openType,
            parameter.quitAfterSaving
          )
        } else if (btnAlias == 'addFlow') {
          this.addFlow(parameter.flowFormData, row)
        } else if (btnAlias == 'addData') {
          this.addData(parameter.flowFormData, row)
        } else if (btnAlias == 'searchData') {
          this.searchData(parameter.flowFormData, row)
        }
      } else if (btnOk.indexOf(btnAlias) != -1) {
        if (btnAlias == 'switch') {
          this.switchChange(
            parameter.pkField,
            parameter.switchOn,
            parameter.switchOff,
            parameter.bind,
            parameter.row,
            parameter.switchDefaultTrue,
            afterScriptValue
          )
        } else if (btnAlias == 'batchUpdate') {
          //如果是行间按钮，就不用判断是否选择了数据
          if (parameter.position) {
            this.batchUpdate(
              parameter.desc,
              parameter.batchUpdateData,
              parameter.filedsObj,
              afterScriptValue,
              parameter.row
            )
          } else {
            this.batchUpdate(
              parameter.desc,
              parameter.batchUpdateData,
              parameter.filedsObj,
              afterScriptValue,
              null
            )
          }
        }
      }
    },
    checkSelect() {
      if (!this.tableData.selectRows || this.tableData.selectRows.length == 0) {
        this.$message.warning(this.$t('ht.templatePreview.selectOneDateTip'))
        return false
      }
      if (this.tableData.selectRows.length > 1) {
        this.$message.warning(this.$t('ht.templatePreview.selectOneData'))
        return false
      }
      return true
    },
    copyOne(parameter) {
      this.$confirm(
        this.$t('ht.templatePreview.copyTip'),
        this.$t('ht.common.tips'),
        {
          confirmButtonText: this.$t('ht.common.confirm'),
          cancelButtonText: this.$t('ht.common.cancle'),
          type: 'warning',
        }
      )
        .then(() => {
          let ids = []
          ids.push(parameter.pkField)
          let param = {}
          param.ids = ids
          param.boAlias = this.templateInfo.boDefAlias
          let loadingInstance = Loading.service(
            this.$t('ht.templatePreview.copyLoadingText')
          )
          this.$requestConfig
            .boCopy(param)
            .then((res) => {
              if (res.state) {
                this.$message({
                  message: res.message,
                  type: 'success',
                })
                this.$nextTick(() => {
                  // 以服务的方式调用的 Loading 需要异步关闭
                  loadingInstance.close()
                })
                this.search()
              } else {
                this.$message({
                  message: res.message,
                  type: 'warning',
                })
                this.$nextTick(() => {
                  // 以服务的方式调用的 Loading 需要异步关闭
                  loadingInstance.close()
                })
              }
            })
            .finally(() => {
              loadingInstance.close()
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('ht.templatePreview.cancelCopy'),
          })
        })
    },
    copyAll() {
      if (
        this.tableData.selectRows == null ||
        this.tableData.selectRows.length == 0
      ) {
        this.$message.warning(this.$t('ht.templatePreview.copyWaning'))
        return false
      }
      this.$confirm(
        this.$t('ht.templatePreview.copyAllDataTip'),
        this.$t('ht.common.tips'),
        {
          confirmButtonText: this.$t('ht.common.confirm'),
          cancelButtonText: this.$t('ht.common.cancle'),
          type: 'warning',
        }
      )
        .then(() => {
          let s = []
          for (let i = 0; i < this.tableData.selectRows.length; i++) {
            s.push(this.tableData.selectRows[i][this.templateInfo.pkField])
          }
          let param = {
            ids: s,
            boAlias: this.templateInfo.boDefAlias,
          }
          let loadingInstance = Loading.service(
            this.$t('ht.templatePreview.copyLoadingText')
          )
          this.$requestConfig
            .boCopy(param)
            .then((res) => {
              if (res.state) {
                this.$message({
                  message: res.message,
                  type: 'success',
                })
                this.$nextTick(() => {
                  // 以服务的方式调用的 Loading 需要异步关闭
                  loadingInstance.close()
                })
                this.search()
              } else {
                this.$message({
                  message: res.message,
                  type: 'warning',
                })
                this.$nextTick(() => {
                  // 以服务的方式调用的 Loading 需要异步关闭
                  loadingInstance.close()
                })
              }
            })
            .finally(() => {
              loadingInstance.close()
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('ht.templatePreview.cancelCopy'),
          })
        })
    },
    tempScript(script, row) {
      if (script == undefined || script == '') {
        return true
      }
      let _this = this

      let _req = req
      let _rows = this.rows
      let _row = row
      function evil() {
        let Fn = Function('_req', '_this', '_rows', '_row', script) //一个变量指向Function，防止有些前端编译工具报错
        let result = Fn(_req, _this, _rows, _row)
        return result
      }
      let resultValue = evil()
      return resultValue
    },

    async beforeScript(diyScript, row) {
      if (diyScript) {
        let script = Base64.decode(diyScript)
        let scriptResult = await this.tempScript(script, row)
        return scriptResult
      } else {
        return true
      }
    },
    //过滤树默认展开操作
    setDefaultExpand() {
      let defaultExpand = '1'
      let elTree = null
      try {
        let treeField = JSON.parse(this.templateInfo.treeField)
        defaultExpand = treeField.defaultExpand
        //如果未配置字段映射字段，过滤树不会加载，这里会抛异常
        elTree = this.$refs.filterTree.$refs.elTree
      } catch (error) {
        return
      }
      if (defaultExpand == '0') {
        return
      }
      //根节点， 表单列表中的根节点实际是该节点的第一个child

      let store = elTree.store
      let root = store.root.childNodes[0] || store.root
      //递归展开,node为当前node
      function setExpand(node, defaultExpand) {
        elTree.load(node, (data) => {
          //为了减少改动，这里进行了手动懒加载，具体方法看element源码
          node.doCreateChildren(data)
          store._initDefaultCheckedNodes()
          node.expanded = true
        })
        if (!node.childNodes || node.childNodes.length == 0) {
          node.isLeaf = true
          return
        }
        if (node.level >= defaultExpand && defaultExpand != '-1') {
          return
        }
        node.childNodes.forEach((item) => {
          setExpand(item, defaultExpand)
        })
      }
      setExpand(root, parseInt(defaultExpand))
    },
    getTreeBindValue(field, pid, node, treeField) {
      let idVal = treeField.idVal
      let resultArr = [node[field]]
      let treeList = this.treeList
      //递归查找该节点的下属节点
      function getCurAndSub(node) {
        treeList.forEach((item) => {
          if (item[pid] == node[idVal]) {
            resultArr.push(item[field])
            getCurAndSub(item)
          }
        })
      }
      getCurAndSub(node)
      return resultArr
    },
    //检查流程权限
    checkFlowPermission() {
      let flowBtns = [
        'approval',
        'taskDetail',
        'taskImage',
        'history',
        'revoke',
        'phyDelete',
        'logicDelete',
        'taskToRead',
      ]
      if (this.templateInfo && this.templateInfo.manageField) {
        let btns = JSON.parse(this.templateInfo.manageField).filter((item) => {
          return flowBtns.includes(item.name)
        })
        if (!btns || btns.length == 0) {
          return
        }
        let permissionTypes = btns
          .map((item) => {
            return item.name
          })
          .join(',')
        let instIds = []
        this.rows.forEach((item) => {
          if (
            item['bpm_proc_inst_id_'] &&
            !this.flowBtnPermission.hasOwnProperty(item['bpm_proc_inst_id_'])
          ) {
            instIds.push(item['bpm_proc_inst_id_'])
          }
        })
        if (permissionTypes && instIds && instIds.length > 0) {
          this.$requestConfig
            .getDataTemplateButtonPermission(instIds, permissionTypes)
            .then((resp) => {
              resp.value.forEach((item) => {
                let { instId } = item
                this.$set(this.flowBtnPermission, instId, item)
              })
              this.multipleTemplateTableloading = false
            })
        }
      }
    },
    //审批任务
    handleApproval(row, type) {
      let { taskId } = this.flowBtnPermission[row['bpm_proc_inst_id_']]
      let url = `/matter/approvalForm/?taskId=${taskId}&instId=${row['bpm_proc_inst_id_']}&isGetApprovalBtn=true`
      //判断当前在哪个端
      if (!this.$requestConfig.frontUrl) {
        this.$message.error(
          this.$t('ht.templatePreview.applicationSideNotConfigured')
        )
        return
      }
      if (
        !this.$requestConfig.frontUrl.startsWith(window.location.origin) ||
        'new' === type
      ) {
        let currentUser = sessionStorage.getItem('currentUser')
        let token = null
        try {
          let obj = JSON.parse(currentUser)
          token = obj.token
        } catch (e) {
          console.log(
            `sessionStorage.currentUser${this.$t(
              'ht.templatePreview.notConfigured'
            )}token,${e}`
          )
        }
        url = `${this.$requestConfig.frontUrl}${url}${
          token ? '&token=' + token : ''
        }`
        window.open(url, '_blank')
      } else if (type == 'old') {
        this.$router.push(url)
      }
    },
    //打开流程图
    showTaskImage(row) {
      this.selectedDefId = row['bpm_proc_def_id_']
      this.selectedInstId = row['bpm_proc_inst_id_']
      let taskId = this.flowBtnPermission[this.selectedInstId].taskId
      if (taskId) {
        this.selectedTaskId = taskId
      }
      this.$nextTick(() => {
        this.$refs.taskImage.handleOpen()
      })
    },
    //打开审批记录
    showInstHistory(row) {
      this.selectedDefId = row['bpm_proc_def_id_']
      this.selectedInstId = row['bpm_proc_inst_id_']
      this.$nextTick(() => {
        this.$refs['processRecord'].showDialog()
      })
    },
    //处理撤回
    handleRevoke(row) {
      let instId = row['bpm_proc_inst_id_']
      let status = row['bpm_status_']
      if (status == 'revokeToStart') {
        this.$message.warning(this.$t('ht.templatePreview.hasRevoke'))
        return
      }
      this.selectedInstId = instId
      let data = {
        instanceId: instId,
        isHandRevoke: false,
      }
      this.$prompt(
        this.$t('ht.templatePreview.revokeReason'),
        this.$t('ht.common.tips')
      )
        .then(({ value }) => {
          data.cause = value
          this.$requestConfig.saveRevoke(data).then((response) => {
            this.$message.success(response.message)
            this.search('find')
          })
        })
        .catch(() => {})
    },
    //任务明细
    showTaskDetail(row, openType, dialogConfig) {
      let instId = row['bpm_proc_inst_id_']
      let url = `/matter/approvalForm?instId=${instId}`
      const basePath = this.$router.resolve('/').href
      if (
        !`${window.location.origin}${basePath}`.startsWith(
          this.$requestConfig.frontUrl
        ) ||
        openType === 'new'
      ) {
        let currentUser = sessionStorage.getItem('currentUser')
        let token = null
        try {
          let obj = JSON.parse(currentUser)
          token = obj.token
        } catch (e) {
          console.log(
            `sessionStorage.currentUser${this.$t(
              'ht.templatePreview.notConfigured'
            )}token,${e}`
          )
        }
        url = `${this.$requestConfig.frontUrl}${url}${
          token ? '&token=' + token : ''
        }`
        window.open(url, '_blank')
      } else if ('old' == openType) {
        this.$router.push(url)
      } else if (openType === 'dialog') {
        let currentUser = sessionStorage.getItem('currentUser')
        let token = null
        try {
          let obj = JSON.parse(currentUser)
          token = obj.token
        } catch (e) {
          console.log(
            `sessionStorage.currentUser${this.$t(
              'ht.templatePreview.notConfigured'
            )}token,${e}`
          )
        }
        url = `${this.$requestConfig.frontUrl}${url}${
          token ? '&token=' + token : ''
        }&__isFull__=${true}`
        this.$refs.templateIframeDialog.showDialog({
          url: url,
          dialogWidth: dialogConfig.dialogWidth,
          dialogHeight: dialogConfig.dialogHeight,
        })
      }
    },
    taskToRead(row) {
      this.$refs['templateTaskCirculate'].showDialog(
        row,
        this.flowBtnPermission
      )
    },
    //物理删除(草稿),会把表单数据也删除
    phyDelete(row) {
      let this_ = this
      this.$confirm(
        this.$t('ht.templatePreview.deleteDraftTip'),
        this.$t('ht.common.tips')
      )
        .then(() => {
          let id = row['bpm_proc_inst_id_']
          this.$requestConfig.removeFlowById(id).then((response) => {
            if (response.state) {
              this.$message.success(
                this.$t('ht.templatePreview.deleteDraftSuccess')
              )
              this_.search('find')
            }
          })
        })
        .catch(() => {})
    },
    //逻辑删除流程实例
    logicDelete(row) {
      let instId = row['bpm_proc_inst_id_']
      this.$confirm(
        this.$t('ht.templatePreview.confirmDeleteTip'),
        this.$t('ht.common.tips'),
        {
          cancelButtonText: this.$t('ht.common.cancle'),
          confirmButtonText: this.$t('ht.common.confirm'),
          type: 'warning',
          closeOnClickModal: false,
        }
      ).then(() => {
        this.$requestConfig.removeFlowById(instId).then((response) => {
          if (response.state) {
            this.$message.success(response.message)
            this.search('find')
          } else {
            this.$message.error(response.message)
          }
        })
      })
    },
    // 通用打开url方法 js按钮中可以调用
    commonOpenUrl(url) {
      if (this.openType === 'new') {
        window.open(url, '_blank')
      } else if (this.openType === 'dialog') {
        this.$refs.templateIframeDialog.showDialog({
          url: url,
          dialogHeight: this.dialogHeight,
          dialogWidth: this.dialogWidth,
        })
      } else {
        window.location.href = url
      }
    },
    /**
     * str:字符串 beginStr:开始位置 endStr:结束位置；
     */
    desensitization(str, beginStr, endStr, pad) {
      if (typeof str === 'number') {
        str = str + ''
      }
      let strData = _.cloneDeep(str)
      if (strData && strData.length) {
        var len = strData.length
        var leftStr = strData.substring(0, beginStr - 1)
        var rightStr = strData.substring(endStr, len)
        var str = ''
        var i = 0
        try {
          for (i = 0; i < endStr + 1 - beginStr; i++) {
            str = str + pad
          }
        } catch (error) {}
        str = leftStr + str + rightStr
        return str
      } else {
        return ''
      }
    },
    //判断是否为json字符串
    isJSON(str) {
      if (typeof str == 'string') {
        try {
          var obj = JSON.parse(str)
          if (typeof obj == 'object' && obj) {
            return true
          } else {
            return false
          }
        } catch (e) {
          return false
        }
      } else {
        return false
      }
    },
    //级联格式化设置处理
    formatCascade(str) {
      let newStr = ''
      let strData = _.cloneDeep(str)
      if (strData) {
        if (this.isJSON(strData)) {
          newStr = JSON.parse(strData)
          if (newStr && newStr.pathLabels && newStr.pathLabels.length) {
            return newStr.pathLabels.join('>')
          } else {
            return strData
          }
        } else {
          return strData
        }
      } else {
        return strData
      }
    },
  },
  // asyncComputed: {
  //   showDraftList() {
  //     //如果当前页面被嵌入iframe里面不显示草稿
  //     return !this.isJoinFlow
  //   },
  //   showScriptButton: {
  //     get() {
  //       let obj = {
  //         print: true,
  //         add: true,
  //         edit: true,
  //         del: true,
  //         batchUpdate: true,
  //         export: true,
  //         import: true,
  //         switch: true,
  //         url: true,
  //         copy: true,
  //       }
  //       if (this.templateInfo && this.templateInfo.manageField) {
  //         let manageField = JSON.parse(this.templateInfo.manageField)
  //         let this_ = this
  //         manageField.forEach((item) => {
  //           if (item.beforeScriptValue) {
  //             let promise = this_.beforeScript(item.beforeScriptValue)
  //             promise.then((res) => {
  //               obj[item.name] = res
  //             })
  //           }
  //         })
  //       }
  //       return obj
  //     },
  //     lazy: true,
  //   },
  // },
}
