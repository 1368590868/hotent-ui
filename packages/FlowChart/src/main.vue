<template>
  <div>
    <el-dialog
      width="80%"
      :title="$t('ht.flowChart.title')"
      :visible.sync="showFlowChart"
      :close-on-click-modal="false"
      append-to-body
      :custom-class="customClass"
    >
      <div class="btn-group">
        <div v-for="item in btnList" :key="item.id" class="btn-item">
          <span class="icon" :style="{ background: item.bgColor }"></span>
          <span class="label">{{ item.label }}</span>
        </div>
      </div>

      <div class="flow-chart">
        <div
          :style="{
            position: 'relative',
            width: imgWidth + 'px',
            height: imgHeight + 'px',
            background: 'url(' + backGroundImg + ') no-repeat',
          }"
        >
          <template v-for="layout in listLayout">
            <el-popover
              v-if="instId"
              :key="layout.nodeId"
              trigger="hover"
              placement="bottom-start"
            >
              <div v-if="nodeOpinions[layout.nodeId]" class="options">
                <div class="title">
                  {{ $t('ht.flowChart.taskApprovalDetail') }}
                </div>
                <!-- 已审批/待审批节点 -->
                <template v-if="hasOpinion(layout)">
                  <table v-for="op in getData(layout)" :key="op.id">
                    <tr>
                      <td class="label">{{ $t('ht.flowChart.taskName') }}</td>
                      <td class="value">{{ op.taskName }}</td>
                    </tr>
                    <tr v-show="op.auditor">
                      <td class="label">{{ $t('ht.flowChart.executor') }}</td>
                      <td class="value">{{ op.auditorName }}</td>
                    </tr>
                    <tr v-show="!op.auditor">
                      <td class="label">
                        <span>{{ $t('ht.flowChart.candidate') }}</span>
                        <el-tooltip
                          effect="light"
                          :content="$t('ht.flowChart.tooltipContent')"
                          placement="right"
                        >
                          <i class="el-icon-question"></i>
                        </el-tooltip>
                      </td>
                      <td class="value">
                        <span v-for="user in op.qualfieds" :key="user.id">
                          <el-button v-if="!user.users" :disabled="true">
                            {{ user.name }}
                          </el-button>
                          <el-tooltip
                            v-if="user.users"
                            effect="light"
                            :content="user.users"
                            placement="top"
                          >
                            <el-button>{{ user.name }}</el-button>
                          </el-tooltip>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td class="label">{{ $t('ht.date.startTime') }}</td>
                      <td class="value">{{ op.createTime }}</td>
                    </tr>
                    <tr>
                      <td class="label">{{ $t('ht.date.endTime') }}</td>
                      <td class="value">{{ op.completeTime }}</td>
                    </tr>
                    <tr>
                      <td class="label">
                        {{ $t('ht.flowChart.approvalTime') }}
                      </td>
                      <td class="value">{{ op.durMs | calcDuration }}</td>
                    </tr>
                    <tr>
                      <td class="label">{{ $t('ht.common.status') }}</td>
                      <td class="value">{{ op.statusVal }}</td>
                    </tr>
                    <tr>
                      <td class="label">{{ $t('ht.flowChart.opinion') }}</td>
                      <td class="opinion">{{ op.opinion }}</td>
                    </tr>
                  </table>
                </template>

                <!-- 未审批节点 -->
                <template v-else>
                  <div class="sub-title">
                    {{ $t('ht.flowChart.nodeSettingDetails') }}
                  </div>
                  <table>
                    <tr>
                      <td class="label">{{ $t('ht.common.status') }}</td>
                      <td class="value">
                        {{ $t('ht.flowChart.notTask') }}
                      </td>
                    </tr>
                    <tr>
                      <td class="label">
                        <span>{{ $t('ht.flowChart.tentativeCandidate') }}</span>
                        <el-tooltip
                          effect="light"
                          :content="$t('ht.flowChart.tentativeCandidateTip')"
                          placement="right"
                        >
                          <i class="el-icon-question"></i>
                        </el-tooltip>
                      </td>
                      <td class="value">
                        <span v-for="user in getData(layout)" :key="user.id">
                          <el-button
                            v-if="!user.users"
                            :disabled="true"
                            style="margin-right: 5px"
                          >
                            {{ user.name }}
                          </el-button>
                          <el-tooltip
                            v-else
                            effect="light"
                            :content="user.users"
                            placement="top"
                          >
                            <el-button>
                              {{ user.name }}
                            </el-button>
                          </el-tooltip>
                        </span>
                      </td>
                    </tr>
                  </table>
                </template>
              </div>

              <el-button
                v-if="showLayout(layout)"
                slot="reference"
                :style="getStyle(layout)"
              ></el-button>
            </el-popover>
          </template>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { t } from '@/locale'
  const btnList = [
    { id: 1, label: t('ht.flowChart.notApproval'), bgColor: '#FF0000' },
    { id: 2, label: t('ht.flowChart.commit'), bgColor: '#F89800' },
    { id: 3, label: t('ht.flowChart.recommit'), bgColor: '#FFE76E' },
    { id: 4, label: t('ht.flowChart.agree'), bgColor: '#00FF00' },
    { id: 5, label: t('ht.flowChart.suspend'), bgColor: '#C33A1F' },
    { id: 6, label: t('ht.flowChart.oppose'), bgColor: '#0000FF' },
    { id: 7, label: t('ht.flowChart.reject'), bgColor: '#8A0902' },
    { id: 8, label: t('ht.flowChart.rejectToStart'), bgColor: '#FFA500' },
    { id: 9, label: t('ht.flowChart.withdraw'), bgColor: '#023B62' },
    { id: 10, label: t('ht.flowChart.withdrawToPromoter'), bgColor: '#F23B62' },
    {
      id: 11,
      label: t('ht.flowChart.countersignaturePassed'),
      bgColor: '#338848',
    },
    {
      id: 12,
      label: t('ht.flowChart.countersignatureNotPassed'),
      bgColor: '#82B7D7',
    },
    { id: 13, label: t('ht.flowChart.manualTermination'), bgColor: '#EEAF97' },
    { id: 14, label: t('ht.flowChart.finish'), bgColor: '#4A4A4A' },
  ]
  export default {
    name: 'FlowChart',
    filters: {
      calcDuration(ts) {
        let duration = '',
          st = 1000,
          mt = 60 * st,
          ht = 60 * mt,
          dt = 24 * ht,
          days = Math.floor(ts / dt),
          hours = Math.floor((ts % dt) / ht),
          mins = Math.floor((ts % ht) / mt),
          secs = Math.floor((ts % mt) / st)
        if (days > 0) duration += days + t('ht.common.day')
        if (hours > 0) duration += hours + t('ht.common.hour')
        if (mins > 0) duration += mins + t('ht.common.minute')
        if (secs > 0) duration += secs + t('ht.common.second')
        return duration
      },
    },

    props: {
      defId: {
        type: String,
        default: '',
      },
      instId: {
        type: String,
        default: '',
      },
      bpmnInstId: {
        type: String,
        default: '',
      },
      customClass: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        showFlowChart: false,

        btnList: btnList,
        imgWidth: '',
        imgHeight: '',
        backGroundImg: '',
        listLayout: '',
        nodeOpinions: [],
      }
    },
    methods: {
      showLayout(layout) {
        const taskNames = ['USERTASK', 'SIGNTASK', 'CUSTOMSIGNTASK']
        return taskNames.includes(layout.nodeType)
      },
      hasOpinion(layout) {
        return this.nodeOpinions[layout.nodeId].hasOpinion
      },
      getData(layout) {
        return this.nodeOpinions[layout.nodeId].data
      },
      getStyle(layout) {
        return {
          position: 'absolute',
          top: layout.y + 'px',
          left: layout.x + 'px',
          width: layout.width + 'px',
          height: layout.height + 'px',
          border: 'none',
          background: 'none',
        }
      },
      handleOpen() {
        this.showFlowChart = true

        const data = {
          defId: this.defId,
          instId: this.instId,
          bpmnInstId: this.bpmnInstId,
        }
        this.$requestConfig.instanceFlowImage(data, (instFlowInfo) => {
          const { defId, instanceId, bpmDefLayout } = instFlowInfo
          let myDefId = ''
          if (['', 'null', 'undefined'].includes(instanceId)) {
            myDefId = defId
          }
          this.$requestConfig.getBpmImage('', instanceId, myDefId, (res) => {
            this.imgWidth = bpmDefLayout.width
            this.imgHeight = bpmDefLayout.height
            this.backGroundImg = res

            bpmDefLayout.listLayout.forEach((item) => {
              const style = {
                position: 'absolute',
                left: item.x + 'px',
                top: item.y + 'px',
                width: item.width + 'px',
                height: item.height + 'px',
              }
              item.style = style
            })
            this.listLayout = bpmDefLayout.listLayout

            const tempIds = []
            this.listLayout.forEach((layout) => {
              const { nodeId, nodeType } = layout
              if (['USERTASK', 'SIGNTASK'].includes(nodeType)) {
                tempIds.push(nodeId)
              }
            })

            let nodeIds = tempIds.join(',')
            const data = { instId: this.instId, nodeIds }
            if (this.instId) {
              this.$requestConfig.getNodeOpinions(data, (options) => {
                if (options) {
                  for (const key in options) {
                    const { data, hasOpinion } = options[key]
                    if (data && hasOpinion) {
                      data.forEach((ele) => {
                        if (ele.qualfieds) {
                          ele.qualfieds = eval('(' + ele.qualfieds + ')')
                        }
                      })
                    }
                  }
                }
                if (nodeIds && tempIds.length == 1) {
                  this.nodeOpinions = {
                    [nodeIds]: options,
                  }
                } else {
                  this.nodeOpinions = options
                }
              })
            }
          })
        })
      },
    },
  }
</script>

<style lang="scss" scoped>
  .btn-group {
    display: flex;
    flex-wrap: wrap;
    .btn-item {
      display: flex;
      align-items: center;
      margin: 0 15px 5px 0;
      .icon {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 5px;
        border: 1px solid #868686;
      }
      .lable {
        color: #606266;
      }
    }
  }
  .flow-chart {
    overflow: auto;
    min-height: 500px;
    margin-top: 30px;
  }
  .title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .sub-title {
    font-size: 12px;
  }
  .options {
    max-height: 420px;
    overflow-y: auto;

    ::v-deep table {
      margin-bottom: 10px;
      font-size: 12px;
      border-spacing: 0;
      border-bottom: 1px solid #e7eaec;
      border-left: 1px solid #e7eaec;
      td {
        padding: 8px;
        line-height: 1.42857;
        border-top: 1px solid #e7eaec;
        border-right: 1px solid #e7eaec;
        vertical-align: middle;
      }
      .label {
        width: 80px;
        font-weight: bold;
      }
      .value {
        width: 160px;
      }
      .opinion {
        max-width: 250px;
        min-width: 250px;
        word-wrap: break-word;
      }
    }
  }
  ::v-deep .start-btn__flow-chart {
    width: 60% !important;
    .flow-chart {
      min-height: unset;
    }
  }
</style>
