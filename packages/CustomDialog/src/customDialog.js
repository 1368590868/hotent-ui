import utils from '@/utils.js'
import mobileMode from '@/mixins/mobileMode.js'
import { Loading } from 'element-ui'

export default {
  mixins: [mobileMode],
  data() {
    return {
      pagination: {},
      dialogData: [],
      total: 0,
      form: {},
      itemSavestate: {},
    }
  },
  methods: {
    //更新对话框数据
    setDialogData(data) {
      data.forEach((item) => {
        delete item.row_id
      })
      if (this.isMobile && this.pagination && this.pagination.page > 1) {
        this.dialogData = this.dialogData.concat(data)
      } else {
        this.dialogData = data.map((it, index) => {
          const pageOffset =
            (this.pagination.page - 1) * this.pagination.pageSize
          return {
            ...it,
            custom_dialog_rowId: `current_row_${index + pageOffset}`,
          }
        })
      }
    },
    getDialoglistJson(pagination) {
      let loadingInstance
      if (this.isMobile) {
        this.$showLoading()
      } else {
        loadingInstance = Loading.service({
          fullscreen: true,
          text: this.$t('ht.customDialog.searching'),
        })
      }
      return this.$requestConfig
        .request({
          url: pagination.queryUrl,
          method: pagination.requestType || 'post',
          data: pagination.pageBean,
        })
        .then((response) => {
          if (this.isMobile) {
            this.$cancelLoading()
          } else {
            loadingInstance.close()
          }
          const listKey = pagination.listKey
            ? pagination.listKey
            : pagination.dsType && pagination.dsType == 'dataSource'
            ? 'rows'
            : ''
          if (!listKey) {
            console.warn(this.$t('ht.customDialog.customDialogWarnMsg'))
          }
          // 通过路径取得对象中的属性
          let rows = []
          if (response && response.constructor === Array) {
            rows = response
          } else {
            rows = utils.getValueByPath(response, listKey)
          }
          const pathPage = utils.getValueByPath(response, pagination.pageKey)
          const pathPageSize = utils.getValueByPath(
            response,
            pagination.pageSizeKey
          )
          const pathTotal = utils.getValueByPath(response, pagination.totalKey)
          if (pathPage) {
            this.pageResult = {
              page: pathPage,
              pageSize: pathPageSize,
              total: pathTotal,
            }
          }
          this.setTotal(pathTotal) //总数据条数
          let pageBean = {
            page: pathPage,
            pageSize: pathPageSize,
            showTotal: true,
            total: pathTotal,
          }
          this.setPagination(pageBean)
          this.setTodoRows(rows) //列表数据
        })
        .catch((err) => {
          if (this.isMobile) {
            this.$cancelLoading()
          } else {
            loadingInstance.close()
          }
        })
    },
    //更新每页下拉显示数据
    setPaginationSize(size) {
      this.pagination.pageSize = size
    },
    //更新第几页
    setPaginationPageNum(currentPage) {
      this.pagination.page = currentPage
    },
    getTreeData(data) {
      return new Promise((resolve) => {
        if (data.requestType == 'GET') {
          this.$requestConfig.request({ url: data.url }).then((response) => {
            resolve(response.data)
          })
        }
      })
    },
    setPagination(pagination) {
      this.pagination = pagination
    },
    setTodoRows(rows) {
      let newRows = []
      for (let i = 0; i < rows.length; i++) {
        let data = rows[i]
        let keys = Object.keys(data)
        let objRows = {}
        keys.forEach((key) => {
          objRows[key.toLowerCase()] = data[key]
        })
        newRows.push(objRows)
      }
      this.setDialogData(newRows)
    },
    setTotal(total) {
      this.total = total
    },
  },
}
