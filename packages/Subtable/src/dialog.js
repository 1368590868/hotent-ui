import utils from '@/utils.js'

export default {
  data() {
    return {
      total: 0,
      dialogData: [],
    }
  },
  methods: {
    getDialogByAlias(alias) {
      return this.$requestConfig.getCustomDialogByAlias(alias)
    },
    getListJson(dialog) {
      const params = {
        url: dialog.queryUrl,
        method: dialog.requestType,
        data: dialog.pageBean,
      }
      return this.$requestConfig.request(params).then((data) => {
        // TODO 返回的数据 key是否需要转小写？？
        if (data && data.constructor === Array) {
          this.dialogData = data
        } else {
          this.dialogData = utils.getValueByPath(data, dialog.listKey || 'rows')
        }

        this.total = utils.getValueByPath(data, dialog.totalKey || 'total')
        return
      })
    },
    setListJson(rows) {
      return new Promise((resolve) => {
        this.dialogData = rows
        resolve()
      })
    },
    getTreeListJson(dialog) {
      const params = {
        url: dialog.url,
        method: dialog.requestType,
        data: dialog.paramsObj,
      }
      return this.$requestConfig.request(params)
    },
  },
}
