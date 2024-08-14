<template>
  <el-pagination
    :current-page="currentPage"
    :page-sizes="pageSizes"
    :page-size="pageSize"
    :layout="layout"
    :hide-on-single-page="hideOnSinglePage"
    :total="total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  ></el-pagination>
</template>
<script>
  import SubPagination from '@/services/SubPagination.js'

  export default {
    name: 'HtSubPagination',
    props: {
      currentPage: {
        type: Number,
        default: 1,
      },
      layout: {
        type: String,
        default: 'total, sizes, prev, pager, next, jumper',
      },
      pageSizes: {
        type: Array,
        default: function() {
          return [15, 50, 100, 200, 300]
        },
      },
      pageSize: {
        type: Number,
        default: 15,
      },
      hideOnSinglePage: {
        type: Boolean,
        default: false,
      },
      rows: {
        type: Array,
        default: function() {
          return []
        },
      },
      dataSubname: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        myCurrentPage: 1,
        myPageSize: 100,
        total: 0,
        oldTotal: 0,
      }
    },
    watch: {
      currentPage: {
        handler: function(newVal) {
          this.myCurrentPage = newVal
        },
        immediate: true,
      },
      pageSize: {
        handler: function(newVal) {
          this.myPageSize = newVal
        },
        immediate: true,
      },
      rows: {
        handler: function(newVal) {
          if (!newVal || newVal.constructor != Array) {
            throw this.$t('ht.subTable.notArrayError')
          }
          if (newVal.length > 0) {
            var obj = SubPagination._map.get(this.dataSubname)
            if (obj && obj.rows.length == 0) this.paginationChange()
          }
          // 子表数据变化时更新分页总数
          this.total = newVal.length
          if (this.total == 0) {
            // 清空子表数据时将子表页码重置为第一页
            this.handleCurrentChange(1)
          } else if (this.total > 0) {
            const pageOffset = SubPagination.getPageOffset(
              this.dataSubname,
              this
            )
            const currentPage = Math.ceil(
              (pageOffset + this.pageSize) / this.pageSize
            )
            if (this.total === pageOffset && pageOffset !== 0) {
              this.handleCurrentChange(currentPage - 1)
            }
            //如果添加行，新增页，则跳转到最后一页
            if(this.oldTotal > 0 && this.total == this.oldTotal+1 && (this.oldTotal % this.pageSize) == 0){
              const lastPage = Math.ceil( this.total / this.pageSize )
              if(lastPage >= 0){
                this.handleCurrentChange(lastPage)
                this.currentPage = lastPage
              }
            }
          }
          this.oldTotal = this.total
        },
        immediate: true,
        deep: true,
      },
    },
    mounted() {
      this.paginationChange()
    },
    destroyed() {
      SubPagination.clear(this.dataSubname)
    },
    methods: {
      paginationChange() {
        // 分页变化时，以dataPath为key设置到公共的js对象中
        SubPagination.set(this.dataSubname, {
          rows: this.rows || [],
          currentPage: this.myCurrentPage,
          pageSize: this.myPageSize,
        })
      },
      handleCurrentChange(val) {
        this.myCurrentPage = val
        this.paginationChange()
      },
      handleSizeChange(val) {
        this.myPageSize = val
        this.paginationChange()
      },
    },
  }
</script>
