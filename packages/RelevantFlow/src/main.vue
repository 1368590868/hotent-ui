<template>
  <el-container v-if="permission != 'n'" class="relevant-container">
    <el-footer
      v-if="inputWriteable"
      style="height: 40px; line-height: 40px; padding: 0px"
    >
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        plain
        round
        style="margin-left: 0"
        @click="flowSelected"
      >
        {{ $t('ht.common.add') }}
      </el-button>
    </el-footer>
    <el-input
      v-model="inputVal"
      v-validate="inputValidate"
      :name="inputName"
      style="display: none"
    ></el-input>
    <el-table
      v-if="dataTable.length > 0"
      :data="dataTable"
      border
      style="width: 100%"
      row-key="subject"
    >
      <el-table-column
        type="index"
        width="70"
        align="center"
        :label="$t('ht.common.index')"
      ></el-table-column>
      <el-table-column
        :label="$t('ht.relevantFlow.flowSubject')"
        align="center"
      >
        <template slot-scope="scope">
          <span class="subject" @click="handleRowClick(scope.row)">
            {{ scope.row.subject }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="creator"
        align="center"
        :label="$t('ht.relevantFlow.sponsor')"
        width="110"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        align="center"
        width="160"
        :label="$t('ht.relevantFlow.originatingTime')"
      ></el-table-column>
      <el-table-column
        v-if="inputWriteable"
        prop
        :label="$t('ht.common.operation')"
        align="center"
        width="200"
      >
        <template slot-scope="scope">
          <el-button
            size="small"
            icon="el-icon-arrow-up"
            plain
            @click="up(scope.$index)"
          ></el-button>
          <el-button
            size="small"
            icon="el-icon-arrow-down"
            plain
            @click="down(scope.$index)"
          ></el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            plain
            @click="remove(scope.row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :title="$t('ht.relevantFlow.addFlowTitle')"
      :visible.sync="relatedInformationDialog"
      :close-on-click-modal="false"
      :width="isMobile ? '100%' : '60%'"
      :top="isMobile ? '0' : '8vh'"
      append-to-body
      :custom-class="isMobile ? 'mobile-related-dialog' : ''"
    >
      <el-col v-if="!isMobile" :span="24" class="searchStyle">
        <el-col :span="2" style="text-align: center">
          {{ $t('ht.relevantFlow.flowTitle') }}：
        </el-col>
        <el-col :span="5">
          <el-input
            v-model="subject"
            size="small"
            clearable
            :placeholder="$t('ht.relevantFlow.placeholder')"
            prefix-icon="el-icon-search"
          ></el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">
          {{ $t('ht.relevantFlow.createTime') }}：
        </el-col>
        <el-col :span="9">
          <ht-date-picker
            v-model="createTime"
            :placeholder="$t('ht.relevantFlow.createTime')"
            arrow-control
            format="yyyy-MM-dd"
          ></ht-date-picker>
        </el-col>
        <el-button
          style="margin-left: 20px"
          size="small"
          type="primary"
          icon="el-icon-search"
          @click="search()"
        >
          {{ $t('ht.common.search') }}
        </el-button>
        <el-button size="small" icon="el-icon-refresh" @click="reset">
          {{ $t('ht.common.reset') }}
        </el-button>
      </el-col>
      <div v-else class="mobile-search">
        <el-input
          v-model="subject"
          class="mobile-search_input"
          clearable
          :placeholder="$t('ht.relevantFlow.placeholder')"
          prefix-icon="el-icon-search"
        ></el-input>
        <el-button
          style="margin-left: 10px"
          size="mini"
          type="primary"
          icon="el-icon-search"
          @click="search()"
        >
          {{ $t('ht.common.search') }}
        </el-button>
        <el-button size="mini" icon="el-icon-refresh" @click="reset">
          {{ $t('ht.common.reset') }}
        </el-button>
      </div>

      <div class="record-content">
        <el-table
          ref="flowTable"
          v-loading="tableLoading"
          :data="rows"
          style="width: 100%"
          stripe
          border
          header-cell-class-name="todo-header-row"
          row-class-name="todo-row"
          size="medium"
          :default-sort="{ prop: 'createTime', order: 'descending' }"
          :height="isMobile ? tableHeight : 450"
          @selection-change="handleChecked"
          @select="onTableSelect"
          @row-click="RowClick"
        >
          <el-table-column
            type="selection"
            width="60"
            align="center"
            sortable
          ></el-table-column>
          <el-table-column
            type="index"
            align="center"
            width="70"
            :label="$t('ht.common.index')"
          ></el-table-column>
          <el-table-column
            prop="creator"
            width="120"
            :label="$t('ht.relevantFlow.creator')"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="subject"
            width="400"
            :label="$t('ht.relevantFlow.flowTitle')"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="procDefName"
            width="280"
            :label="$t('ht.relevantFlow.procDefName')"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="createTime"
            :label="$t('ht.relevantFlow.createTime')"
            align="center"
          ></el-table-column>
        </el-table>
        <div class="relevant-flow_page" :class="isMobile ? 'mobile' : ''">
          <el-pagination
            :current-page="pagination.page"
            :page-sizes="[10, 20, 50, 100, 300, 500]"
            :page-size="pagination.pageSize"
            :layout="
              isMobile
                ? 'prev, pager, next'
                : 'total, sizes, prev, pager, next, jumper'
            "
            :total="total"
            :pager-count="5"
            :small="isMobile"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="confirm">
          {{ $t('ht.common.confirm') }}
        </el-button>
        <el-button size="small" @click="cancel">
          {{ $t('ht.common.cancle') }}
        </el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import relevantFlow from './relevantFlow.js'
  import mobileMode from '@/mixins/mobileMode.js'
  const SYNC_FIELDS = ['id', 'subject', 'creator', 'createTime', 'status']
  export default {
    name: 'HtRelevantFlow',
    mixins: [permission, inputName, form, relevantFlow, mobileMode],
    props: {
      value: String,
      searchConfig: {
        type: Object,
        default: () => {
          return {
            isPaging: true,
            pageSize: 10,
          }
        },
      },
      flowRangeKey: String,
    },
    data() {
      return {
        relatedInformationDialog: false,
        checked: true,
        subject: '',
        inputVal: '',
        createTime: '',
        checkBoxData: [],
        checkBoxDataAll: [],
        dataTable: [],
      }
    },
    computed: {
      tableHeight() {
        return window.innerHeight - 250
      },
    },
    watch: {
      inputVal: function(newVal) {
        this.$emit('input', newVal)
      },
    },
    created() {
      this.$validator = this.$root.$validator
    },
    mounted() {
      if (this.modelName) {
        if (this.value && Array.isArray(JSON.parse(this.value))) {
          this.dataTable = JSON.parse(this.value)
        } else {
          this.dataTable = []
        }
      }
    },
    methods: {
      cancel() {
        this.relatedInformationDialog = false
      },
      //确认
      confirm() {
        const _me = this
        this.checkBoxData.forEach((row) => {
          let res = _me.indexArray(_me.checkBoxDataAll, row)
          if (res == -1) {
            _me.checkBoxDataAll.push(row)
          }
        })
        this.dataTable = this.checkBoxDataAll
        this.relatedInformationDialog = false
        if (this.modelName) {
          const syncData = []
          this.dataTable.forEach((row) => {
            const obj = {}
            syncData.push(obj)
            SYNC_FIELDS.forEach((field) => {
              obj[field] = row[field]
            })
          })
          this.inputVal = JSON.stringify(syncData)
        }
      },
      handleChecked(value) {
        this.checkBoxData = value
      },
      handleSizeChange: function(size) {
        //每页下拉显示数据
        this.setPaginationSize(size)
        this.search()
      },
      handleCurrentChange: function(currentPage) {
        const this_ = this
        if (this.checkBoxData != undefined && this.checkBoxData.length > 0) {
          this.checkBoxData.forEach((row) => {
            let res = this_.indexArray(this_.checkBoxDataAll, row)
            if (res == -1) {
              this_.checkBoxDataAll.push(row)
            }
          })
        }
        this_.checkBoxData = this_.checkBoxDataAll
        //点击第几页
        this.setPaginationPageNum(currentPage)
        this.search()
      },
      RowClick(row) {
        this.$refs.flowTable.toggleRowSelection(row)
      },
      check() {
        const this_ = this
        setTimeout(() => {
          if (
            this_.checkBoxData == undefined ||
            this_.checkBoxData.length == 0
          ) {
            this_.checkBoxData = this_.checkBoxDataAll
          }
          if (Array.isArray(this_.checkBoxData)) {
            this_.checkBoxData.forEach((row) => {
              let res = this_.indexArray(this_.rows, row)
              if (res != -1) {
                this_.$refs.flowTable.toggleRowSelection(this_.rows[res])
              }
            })
          }
        }, 250)
      },
      onTableSelect(rows, row) {
        let selected = rows.length && rows.indexOf(row) !== -1
        if (!selected) {
          let res = this.indexArray(this.checkBoxDataAll, row)
          this.checkBoxDataAll.splice(res, 1)
          if (this.checkBoxDataAll.length == 0) {
            this.checkBoxData = []
          }
        }
      },
      search() {
        let querys = [] //查询条件
        let queryFilter = {}
        let pageBean = { pageBean: this.pagination }
        if (this.subject != '') {
          querys.push({
            property: 'SUBJECT_',
            value: this.subject,
            group: 'main',
            operation: 'LIKE',
            relation: 'AND',
          })
        }
        if (this.createTime != '') {
          querys.push({
            property: 'CREATE_TIME_',
            value: this.createTime,
            group: 'main',
            operation: 'BETWEEN',
            relation: 'AND',
          })
        }
        if (this.flowRangeKey) {
          querys.push({
            property: 'procDefKey',
            value: this.flowRangeKey,
            group: 'main',
            operation: 'IN',
            relation: 'AND',
          })
        }
        if (querys.length > 0) {
          if (this.searchConfig.isPaging) {
            queryFilter = {
              pageBean: {
                page: '1',
                pageSize: this.searchConfig.pageSize,
                showTotal: 'true',
              },
              querys,
            }
          } else {
            queryFilter = { pageBean: {} }
          }
          this.getlistJson(queryFilter)
        } else {
          this.getlistJson(pageBean)
        }
        this.check()
      },
      flowSelected: function() {
        if (this.checkBoxData == undefined || this.checkBoxData.length == 0) {
          this.checkBoxData = this.dataTable
        }
        this.relatedInformationDialog = true
        var pageBean = {}
        if (this.searchConfig.isPaging) {
          pageBean = {
            page: 1,
            pageSize: this.searchConfig.pageSize,
            showTotal: true,
          }
        }
        let pagination = { pageBean: pageBean }
        if (this.flowRangeKey) {
          pagination.querys = [
            {
              property: 'procDefKey',
              value: this.flowRangeKey,
              group: 'main',
              operation: 'IN',
              relation: 'AND',
            },
          ]
        }
        this.getlistJson(pagination)
        setTimeout(() => {
          this.check()
        }, 500)
      }, //重置
      reset() {
        this.subject = ''
        this.createTime = ''
        this.search()
      },
      remove(row) {
        this.dataTable.remove(row)
        if (this.modelName) {
          if (this.dataTable.length < 1) {
            this.inputVal = ''
          } else {
            this.inputVal = JSON.stringify(this.dataTable)
          }
        }
      }, //上移按钮
      up(idx) {
        idx = Number.parseInt(idx)
        if (idx < 1) {
          return
        }
        var t = this.dataTable[idx - 1]
        this.$set(this.dataTable, idx - 1, this.dataTable[idx])
        this.$set(this.dataTable, idx, t)
        if (this.modelName) {
          this.inputVal = JSON.stringify(this.dataTable)
        }
      },
      //下移按钮
      down(idx) {
        idx = Number.parseInt(idx)
        if (idx >= this.dataTable.length - 1) {
          return
        }

        var t = this.dataTable[idx + 1]
        this.$set(this.dataTable, idx + 1, this.dataTable[idx])
        this.$set(this.dataTable, idx, t)

        if (this.modelName) {
          this.inputVal = JSON.stringify(this.dataTable)
        }
      },
      handleRowClick(row) {
        this.$requestConfig.handleRelevantFlowClick(row)
      },
      //去重json数组重复数据
      uniqueArray(array, key) {
        var result = [array[0]]
        for (var i = 1; i < array.length; i++) {
          var item = array[i]
          var repeat = false
          for (var j = 0; j < result.length; j++) {
            if (item[key] == result[j][key]) {
              repeat = true
              break
            }
          }
          if (!repeat) {
            result.push(item)
          }
        }
        return result
      },
      indexArray(array, item) {
        for (var i = 0; i < array.length; i++) {
          if (array[i].id == item.id) {
            return i
          }
        }
        return -1
      },
    },
  }
</script>

<style lang="scss" scoped>
  .relevant-container {
    border: none;
  }
  ::v-deep .el-dialog__body {
    padding: 0px 20px;
    color: #666;
    font-size: 14px;
    word-break: break-all;

    .record-content {
      margin-top: 20px;
    }
    .relevant-flow_page {
      text-align: right;
      margin-top: 20px;
      &.mobile {
        text-align: center;
      }
    }
  }
  .searchStyle {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 20px;
  }
  .subject {
    cursor: pointer;
    color: $base-color-blue;
  }
  ::v-deep .mobile-related-dialog {
    height: 100vh;
    margin: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .el-dialog__body {
      flex: 1;
      overflow: auto;
      .mobile-search {
        display: flex;
        align-items: center;
        padding-top: 20px;
        .mobile-search_input {
          flex: 1;
        }
      }
    }
    .dialog-footer {
      text-align: center;
    }
  }
  ::v-deep .el-pagination__editor.el-input {
    width: 50px !important;
  }
</style>
