<template>
  <div v-if="dialogVisible" class="record-wrap">
    <el-dialog
      :title="$t('ht.approvalHistory.approvalRecord')"
      :visible.sync="dialogVisible"
      width="80%"
    >
      <div v-if="dialogVisible" class="record-content">
        <ht-table
          :data="rows"
          :show-export="false"
          :show-custom-column="false"
          :nopagination="true"
          @loading="loadData"
        >
          <ht-table-column
            width="50"
            align="center"
            :label="$t('ht.common.index')"
            type="index"
          />
          <ht-table-column
            :label="$t('ht.approvalHistory.approvalNode')"
            width="170"
            align="center"
            prop="taskName"
            show-overflow-tooltip
          />
          <ht-table-column
            prop="qualfiedNames"
            :label="$t('ht.approvalHistory.pendingApprovers')"
            show-overflow-tooltip
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <span
                v-if="
                  row.status != 'awaiting_check' &&
                    qualfiedsName(row.qualfiedNames, true) < 2
                "
              >
                {{ row.qualfiedNames }}
              </span>
              <span
                v-if="
                  row.status === 'awaiting_check' &&
                    row.qualfieds &&
                    row.qualfieds.length === 1 &&
                    !row.qualfieds[0].users
                "
              >
                {{ row.qualfiedNames }}
              </span>
              <el-popover
                v-if="
                  row.status == 'awaiting_check' ||
                    qualfiedsName(row.qualfiedNames, true) > 1
                "
                placement="right"
                popper-class="right-popover"
                trigger="hover"
              >
                <div>
                  <p class="qualfied_names">
                    {{ $t('ht.approvalHistory.name') }}
                  </p>
                  <div
                    v-if="isQualfiedListHasUser(row.qualfieds)"
                    class="btn__wrap"
                  >
                    <p v-for="(item, index) in row.qualfieds" :key="index">
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
                      v-for="(item, index) in qualfiedsName(
                        row.qualfiedNames,
                        false
                      )"
                      :key="index"
                    >
                      <el-button plain size="mini">{{ item }}</el-button>
                    </p>
                  </div>
                </div>
                <i
                  v-if="
                    isQualfiedListHasUser(row.qualfieds) ||
                      qualfiedsName(row.qualfiedNames, true) > 1
                  "
                  slot="reference"
                  class="el-icon-more qualfied-more__icon"
                ></i>
              </el-popover>
            </template>
          </ht-table-column>
          <ht-table-column
            :label="$t('ht.approvalHistory.handler')"
            width="110"
            align="center"
            prop="auditorName"
            show-overflow-tooltip
          />
          <ht-table-column
            align="center"
            :label="$t('ht.approvalHistory.handlingSituation')"
            width="140"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span v-if="row.statusVal == '待审批'">
                {{
                  row.isRead == 0
                    ? $t('ht.approvalHistory.notRead')
                    : $t('ht.approvalHistory.read')
                }}
              </span>
              <span v-else>
                {{ row.statusVal }}
              </span>
            </template>
          </ht-table-column>

          <ht-table-column
            :label="$t('ht.approvalHistory.handleOpinion')"
            show-overflow-tooltip
            align="center"
          >
            <template #default="{ row }">
              <strong>
                <span style="white-space: pre-wrap">{{ row.opinion }}</span>
              </strong>
              <br />
              <div
                v-if="row.filesArray && row.filesArray.length != 0"
                class="appendix"
              >
                <div class="title">{{ $t('ht.approvalHistory.file') }}：</div>
                <div
                  v-for="(item, index) in row.filesArray"
                  :key="index"
                  style="cursor: pointer"
                >
                  <el-tag @click="search(item)">{{ item.name }}</el-tag>
                </div>
              </div>
              <br />
            </template>
          </ht-table-column>

          <ht-table-column
            :label="$t('ht.approvalHistory.operateTime')"
            width="170"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ row.completeTime }}</span>
            </template>
          </ht-table-column>

          <ht-table-column
            align="center"
            :label="$t('ht.approvalHistory.stayTime')"
            width="110"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ formatTimeLag(row) }}</span>
            </template>
          </ht-table-column>
        </ht-table>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import utils from '@/utils.js'

  export default {
    name: 'ProcessRecord',
    props: {
      instId: String,
      taskId: String,
      referOpinion: Boolean,
      nodeType: String,
      defId: String,
      nodeId: String,
      myReadType: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        src: '',
        data: { taskId: '', referOpinion: false },
        fileId: '',
        // 获取row的key值
        // getRowKeys(row) {
        //   return row.id
        // },
        previewNodeFormDialogVisible: false,
        opinionSelectNodeId: '',
        opinionInstId: '',
        opinionTaskId: '',
        opinionFormData: '',
        opinionTaskName: '',
        opinionProcDefId: '',
        rows: [], // 表格数据
        dialogVisible: false,
      }
    },
    created() {
      this.initParams()
    },
    methods: {
      showDialog() {
        this.dialogVisible = true
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
        let endTimes = null
        if (!row.completeTime) {
          endTimes = utils.formatDate(new Date())
        } else {
          endTimes = row.completeTime
        }
        const { days, hours, minutes, seconds } = utils.dateDuration(
          row.createTime,
          endTimes
        )
        if (days > 0) return days + this.$t('ht.common.day')
        if (hours > 0) return hours + this.$t('ht.common.hour')
        if (minutes > 0) return minutes + this.$t('ht.common.minute')
        if (minutes == 0 && seconds >= 0)
          return this.$t('ht.approvalHistory.lessOneMinute')
      },
      search(item) {
        this.$preview(item)
      },
      loadData(param, cb) {
        const params = {
          instId: this.instId,
          taskId: this.taskId,
          referOpinion: this.referOpinion,
          nodeType: this.nodeType,
          defId: this.defId,
          nodeId: this.nodeId,
        }
        this.$requestConfig
          .getOpinionsById(params)
          .then((response) => {
            response.map((e) => {
              //有可能出现e.files是"\"\""的情况
              if (e.files && JSON.parse(e.files)) {
                e.filesArray = JSON.parse(JSON.parse(e.files))
              }
            })
            if (response && response.length) {
              this.rows = response.filter((item) => item.status !== 'skip')
            }
          })
          .finally(() => {
            cb()
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
  .record-wrap {
    padding: 20px;
    background: #fff;
  }
  .appendix {
    padding: 5px 0px;
    text-align: left;
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

  .record-container {
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }

  .record-container > span {
    padding-left: 10px;
    font-size: 14px;
    font-weight: bold;
    color: #666;
    // border-left: 3px solid $--theme-color;
  }

  .record-content {
    padding: 20px 0;
  }

  .files {
    font-size: 12px;
    color: #5eade6;
    cursor: pointer;
  }

  .files:hover {
    // color: $--theme-color;
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
