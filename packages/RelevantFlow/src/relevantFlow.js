export default {
  data() {
    return {
      pagination: {},
      rows: [],
      total: 0,
      tableLoading: false,
    }
  },
  methods: {
    setPaginationSize(size) {
      this.pagination.pageSize = size
    },
    setPaginationPageNum(currentPage) {
      this.pagination.page = currentPage
    },
    getlistJson(query) {
      this.tableLoading = true
      this.$requestConfig
        .getRelevantFlow(query)
        .then((data) => {
          this.rows = data.rows
          this.total = data.total
          this.pageBean = {
            page: data.page,
            pageSize: data.pageSize,
            showTotal: true,
          }
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
  },
}
