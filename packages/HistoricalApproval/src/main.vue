<template>
  <div class="record-wrap">
    <div class="record-content">
      <el-table
        :span-method="arraySpanMethod"
        :data="rows"
        :selectable="false"
        :show-export="false"
        :show-custom-column="false"
        :nopagination="true"
        :border="true"
        @loading="loadData"
      >
        <el-table-column
          width="60"
          align="center"
          :label="$t('ht.common.index')"
          type="index"
        />
        <el-table-column
          :label="$t('ht.approvalHistory.approvalNode')"
          width="170"
          align="center"
          prop="taskName"
          :show-overflow-tooltip="overToolTip"
        />
        <el-table-column
          :label="$t('ht.approvalHistory.pendingApprovers')"
          :show-overflow-tooltip="overToolTip"
          width="110"
          align="center"
        >
          <template #default="{ row: { status, qualfieds, qualfiedNames } }">
            <span v-if="showQualfiedsNames(status, qualfieds, qualfiedNames)">
              {{ qualfiedNames }}
            </span>
            <el-popover
              v-if="
                status == 'awaiting_check' ||
                  qualfiedsName(qualfiedNames, true) > 1
              "
              placement="right"
              popper-class="right-popover"
              trigger="hover"
            >
              <div>
                <p class="qualfied_names">
                  {{ $t('ht.approvalHistory.name') }}
                </p>
                <div v-if="isQualfiedListHasUser(qualfieds)" class="btn__wrap">
                  <p v-for="(item, index) in qualfieds" :key="index">
                    <el-tooltip
                      v-if="item.users"
                      class="item"
                      effect="light"
                      placement="top"
                      :content="item.users"
                    >
                      <el-button plain size="mini">{{ item.name }}</el-button>
                    </el-tooltip>
                    <el-button v-if="!item.users" plain size="mini">
                      {{ item.name }}
                    </el-button>
                  </p>
                </div>
                <div v-else class="btn__wrap">
                  <p
                    v-for="(item, index) in qualfiedsName(qualfiedNames, false)"
                    :key="index"
                  >
                    <el-button plain size="mini">{{ item }}</el-button>
                  </p>
                </div>
              </div>
              <i
                v-if="
                  isQualfiedListHasUser(qualfieds) ||
                    qualfiedsName(qualfiedNames, true) > 1
                "
                slot="reference"
                class="el-icon-more qualfied-more__icon"
              ></i>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('ht.approvalHistory.handler')"
          width="110"
          align="center"
          prop="auditorName"
          :show-overflow-tooltip="overToolTip"
        >
          <template #default="{ row }">
            <span>{{ row.auditorName }}</span>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          :label="$t('ht.approvalHistory.handlingSituation')"
          width="140"
          :show-overflow-tooltip="overToolTip"
        >
          <template #default="{ row: { isRead, statusVal } }">
            <span v-if="statusVal == $t('ht.flowChart.notApproval')">
              {{
                isRead == 0
                  ? $t('ht.approvalHistory.notRead')
                  : $t('ht.approvalHistory.read')
              }}
            </span>
            <span v-else>
              {{ statusVal }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('ht.approvalHistory.handleOpinion')"
          :show-overflow-tooltip="overToolTip"
          align="center"
        >
          <template #default="{ row: { opinion, filesArray } }">
            <strong>
              <span style="white-space: pre-wrap">{{ opinion }}</span>
            </strong>

            <div v-if="filesArray && filesArray.length" class="appendix">
              <div class="title">{{ $t('ht.approvalHistory.file') }}：</div>
              <div class="file-content">
                <div
                  v-for="(item, index) in filesArray"
                  :key="index"
                  class="attachment"
                >
                  <el-tooltip placement="bottom-start" effect="light">
                    <div slot="content">
                      <el-button
                        icon="el-icon-download"
                        circle
                        @click="downloadAttachments(item)"
                      ></el-button>
                    </div>
                    <el-tag @click="search(item)">{{ item.name }}</el-tag>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('ht.approvalHistory.operateTime')"
          width="170"
          align="center"
          :show-overflow-tooltip="overToolTip"
        >
          <template #default="{ row }">
            <span style="white-space: pre-wrap">{{ row.completeTime }}</span>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          :label="$t('ht.approvalHistory.stayTime')"
          width="110"
          :show-overflow-tooltip="overToolTip"
        >
          <template #default="{ row }">
            <span>{{ formatTimeLag(row) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 预览文件-->
    <!-- <ht-preview ref="previewHelp" /> -->
  </div>
</template>
<script>
  import moment from 'moment'
  export default {
    name: 'HtHistoricalApproval',
    componentName: 'HtHistoricalApproval',
    props: {
      instId: String,
      order: Boolean,
    },
    data() {
      return {
        nodeIdMap: {},
        src: '',
        data: { taskId: '', referOpinion: false },
        fileId: '',
        previewNodeFormDialogVisible: false,
        opinionSelectNodeId: '',
        opinionInstId: '',
        opinionTaskId: '',
        opinionFormData: '',
        opinionTaskName: '',
        opinionProcDefId: '',
        rows: [], // 表格数据
      }
    },

    created() {
      this.initParams()
      this.loadData()
    },
    methods: {
      arraySpanMethod({ row, column, rowIndex, columnIndex }) {
        if (this.order && columnIndex === 1) {
          if (
            this.nodeIdMap[row.taskKey].length > 1 &&
            this.nodeIdMap[row.taskKey][
              this.nodeIdMap[row.taskKey].length - 1
            ] == row
          ) {
            return {
              rowspan: this.nodeIdMap[row.taskKey].length,
              colspan: 1,
            }
          } else if (this.nodeIdMap[row.taskKey].length > 1) {
            return {
              rowspan: 0,
              colspan: 0,
            }
          } else {
            return {
              rowspan: 1,
              colspan: 1,
            }
          }
        }
      },
      showQualfiedsNames(status, qualfieds, qualfiedNames) {
        const length = this.qualfiedsName(qualfiedNames, true)
        return (
          (length < 2 && status != 'awaiting_check') ||
          (status == 'awaiting_check' &&
            qualfieds &&
            qualfieds.length == 1 &&
            !qualfieds[0].users)
        )
      },
      initParams() {
        if (this.instId) {
          this.data.instId = this.instId
          this.data.taskId = this.taskId
          this.data.referOpinion = this.referOpinion
          this.data.nodeType = this.nodeType
          this.data.defId = this.defId
          this.data.nodeId = this.nodeId
          //类型为我的请求时添加参数isRequest进行过滤
          if (this.myReadType === 'request') {
            this.data.isRequest = true
          }
        }
      },
      qualfiedsName(names, isLength) {
        if (names && isLength) {
          return names.split(',').length
        }
        if (names && !isLength) {
          return names.split(',')
        }
      },
      isQualfiedListHasUser(data) {
        if (Array.isArray(data)) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].users) {
              return true
            }
          }
          return false
        }
      },
      //持续时间
      formatTimeLag(row) {
        let endTimes = new moment()
        if (!row.completeTime) {
          endTimes = new moment(new Date())
        } else {
          endTimes = new moment(new Date(row.completeTime))
        }

        let createTime = new moment(new Date(row.createTime))
        let duration = moment.duration(endTimes.diff(createTime))
        let { _data } = duration
        if (_data.days > 0) return _data.days + this.$t('ht.common.day')
        if (_data.hours > 0) return _data.hours + this.$t('ht.common.hour')
        if (_data.minutes > 0)
          return _data.minutes + this.$t('ht.common.minute')
        if (_data.minutes == 0 && _data.seconds >= 0)
          return this.$t('ht.approvalHistory.lessOneMinute')
      },
      search(item) {
        this.$preview(item)
      },
      downloadAttachments(item) {
        // downloadFile(item.response?.fileId, item.response?.fileName)
      },

      loadData(param, cb) {
        const params = {
          instId: this.instId,
          taskId: null,
          referOpinion: true,
          defId: null,
          nodeId: null,
        }
        this.nodeIdMap = {}
        this.$requestConfig
          .getOpinionsById(params)
          .then((response) => {
            this.orderFlag = true
            for (let x = response.length - 1; x > -1; x--) {
              let e = response[x]
              if (!this.nodeIdMap[e.taskKey]) {
                this.nodeIdMap[e.taskKey] = []
              }
              this.nodeIdMap[e.taskKey].push(e)
              //有可能出现e.files是"\"\""的情况
              if (e.files && JSON.parse(e.files)) {
                response[x].filesArray = JSON.parse(JSON.parse(e.files))
              }
            }
            let newArr = []
            let flagMap = {}
            if (!this.order) {
              this.rows = response
              return
            }
            for (let x = response.length - 1; x > -1; x--) {
              if (!flagMap[response[x].taskKey]) {
                newArr.push.apply(newArr, this.nodeIdMap[response[x].taskKey])
                flagMap[response[x].taskKey] = '1'
              }
            }

            this.rows = newArr.reverse()
          })
          .finally(() => {
            // cb?.()
          })
      },
    },
  }
</script>
<style lang="scss" scoped>
  .el-message-box__body {
    border-top: none;
  }
  .el-main {
    padding: 0;
  }
  .appendix {
    padding: 5px 0px;
    text-align: left;
    display: flex;
    .file-content {
      flex: 1;
    }
  }

  .appendix_left {
    padding: 0 15px;
    border-left: 1px solid #d8d8d8;
  }

  .appendix_right {
    padding: 0 15px 0 0;
  }

  .title {
    display: block;
    font-weight: bold;
    color: #a2a2a2;
  }

  .attachment {
    display: block;
    margin-bottom: 10px;
    cursor: pointer;
  }

  .record-container {
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }

  .record-container > span {
    padding-left: 10px;
    font-size: 14px;
    font-weight: bold;
    color: #666;
  }

  .files {
    font-size: 12px;
    color: #5eade6;
    cursor: pointer;
  }

  ::v-deep .el-table .cell.el-tooltip {
    min-width: 50px;
  }

  ::v-deep .el-table .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding-right: 10px;
    padding-left: 10px;
    overflow: hidden;
    line-height: 23px;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
  }
  ::v-deep .owner-span {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .btn__wrap {
    display: flex;
    flex-wrap: wrap;
    p {
      margin: 0;
    }
  }
  .qualfied-more__icon {
    &:hover {
      cursor: pointer;
    }
  }
</style>
