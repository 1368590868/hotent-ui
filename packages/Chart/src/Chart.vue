<template>
  <el-tabs
    v-if="permission != 'n'"
    type="card"
    :style="{ width: charWidth }"
    @tab-click="initClick"
  >
    <el-tab-pane :label="t('ht.chart.viewChart')">
      <div
        v-if="showTable"
        :id="chartKey"
        :style="{ width: charWidth, height: charHeight }"
      ></div>
    </el-tab-pane>
    <el-tab-pane :label="t('ht.chart.viewData')">
      <ht-table
        v-if="showTable"
        ref="table"
        :data="data"
        :page-result="pageResult"
        :default-querys="defaultQuery"
        :selectable="false"
        :show-export="false"
        :show-custom-column="false"
        :quick-search-props="quickSearchProp"
        :nopagination="true"
        height="500"
        @load="loadData"
      >
        <ht-table-column
          v-for="xaxisField in customChart.xaxisField"
          :key="xaxisField.field"
          :prop="xaxisField.field.toUpperCase()"
          :label="xaxisField.comment"
        ></ht-table-column>
        <ht-table-column
          v-for="displayfield in customChart.displayfield"
          :key="displayfield.field"
          :prop="displayfield.field.toUpperCase()"
          :label="displayfield.comment"
        ></ht-table-column>
      </ht-table>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
  import { decode } from '@/util/base64'
  import utils from '@/utils.js'
  import permission from '@/mixins/permission.js'
  import locale from '@/mixins/locale.js'
  export default {
    name: 'HtChart',
    mixins: [permission, locale],
    props: {
      id: {
        type: [String, Number],
        required: true,
      },
      width: {
        type: String,
        default: '',
      },
      height: {
        type: String,
        default: '',
      },
      selectList: {
        type: String,
        default: '',
      },
      chartKey: {
        type: [String, Number],
        required: true,
      },
    },
    data() {
      return {
        showTable: false,
        customChart: {},
        pageResult: {
          page: -1,
          pageSize: 20,
          total: 0,
        },
        data: [],
        quickSearchProp: '',
        defaultQuery: [],
        queryOpTransObj: {
          EQ: 'EQUAL',
          BETWEEN: 'BETWEEN',
          GE: 'GREAT_EQUAL',
          LE: 'LESS_EQUAL',
          LK: 'LIKE',
          IN: 'IN',
        },
        querrySelectList: [],
        myChart: null,
      }
    },
    computed: {
      charWidth() {
        if (this.width) {
          return this.width + 'px'
        }
        return '100%'
      },
      charHeight() {
        if (this.height) {
          return this.height + 'px'
        }
        return this.customChart.height + 'px'
      },
    },
    watch: {
      id: function(newV) {
        if (newV) {
          this.customChart = []
          this.data = []
          this.quickSearchProp = ''
          this.defaultQuery = []
          this.showTable = false
          this.initData()
        }
      },
    },
    created() {
      this.$root.$on('collapse-active-names', (result) => {
        if (result && result.length > 0) {
          this.$nextTick(() => {
            this.resizeChart()
          })
        }
      })
    },
    mounted() {
      this.$nextTick(() => {
        this.initData()
      })
      if (this.selectList) {
        this.querrySelectList = JSON.parse(decode(this.selectList))
        const pInst = utils.getOnlineFormInstance(this)
        this.querrySelectList.forEach((obj) => {
          let path = 'data.' + obj.selectField
          pInst.$watch(path, () => {
            this.customChart = []
            this.data = []
            this.quickSearchProp = ''
            this.defaultQuery = []
            this.showTable = false
            this.$nextTick(() => {
              this.initData()
            })
          })
        })
      }
      window.addEventListener('resize', this.resizeChart)
    },
    destroyed() {
      window.removeEventListener('resize', this.resizeChart)
    },
    methods: {
      resizeChart() {
        this.myChart ? this.myChart.resize() : ''
      },
      initClick(tabVue) {
        if (tabVue.index == '1') {
          this.$refs.table.load()
        }
      },
      loadData(param, cb) {
        if (this.customChart.alias) {
          if (
            this.customChart.conf.maxLength &&
            this.customChart.conf.maxLength != '0'
          ) {
            param.pageBean.pageSize = parseInt(this.customChart.conf.maxLength)
          } else {
            param.pageBean.pageSize = -1
          }
          const pInst = utils.getOnlineFormInstance(this)
          let conditions = this.customChart.conditionfield
          let querrySelectList = this.querrySelectList
          let queryFilter = param && param.querys ? param.querys : []
          querrySelectList.forEach((item) => {
            let value = utils.getValueByPath(pInst.data, item.selectField)
            let query = conditions.find((obj) => obj.field == item.bindSelectd)
            queryFilter.push({
              property: query.field,
              value: value,
              operation: this.queryOpTransObj[query.condition],
              group: 'main',
            })
          })
          param.querys = queryFilter
          this.$requestConfig
            .getChartListData(this.customChart.alias, param)
            .then((response) => {
              this.data = response.rows
              this.customChart.rows = this.data
              this.buildChart(this.customChart)
            })
            .finally(() => {
              cb()
            })
        } else {
          cb()
        }
      },
      initData() {
        this.$requestConfig.getChartById(this.id).then((data) => {
          if (data) {
            data.conditionfield = JSON.parse(data.conditionfield)
            data.displayfield = JSON.parse(data.displayfield)
            data.xaxisField = JSON.parse(data.xaxisField)
            data.sortfield = JSON.parse(data.sortfield)
            data.conf = JSON.parse(data.conf)
            this.customChart = data
            this.initCondition()
            this.showTable = true
          }
        })
      },
      initCondition() {
        let conditions = this.customChart.conditionfield
        for (let i = 0; i < conditions.length; i++) {
          if (conditions[i].defaultType === '1') {
            this.quickSearchProp += conditions[i].field.toUpperCase() + ','
          } else {
            this.defaultQuery.push({
              property: conditions[i].field,
              value: conditions[i].defaultValue,
              operation: this.queryOpTransObj[conditions[i].condition],
              group: 'main',
            })
          }
        }
      },
      buildChart(data) {
        this.myChart = this.$echarts.init(
          document.getElementById(this.chartKey),
          'default'
        )
        let grid = this.getGrid()
        data.conf.title.text = data.name
        data.conf.title.top = this.getTitlePosition()
        let option = {
          title: data.conf.title,
          tooltip: {},
          toolbox: { feature: { saveAsImage: {} } },
          legend: {},
          grid: grid,
          series: {},
        }
        switch (data.style) {
          case 1:
            option = this.buildLine(data, option)
            break
          case 3:
            option = this.buildPie(data, option)
            break
          case 4:
            option = this.buildRadar(data, option)
            break
          case 5:
            option = this.buildFunnel(data, option)
            break
          case 6:
            option = this.buildScatter(data, option)
            break
          case 7:
            option = this.buildHeatmap(data, option)
            break
          default:
            break
        }
        this.adjustChatTitle(data, option)
        this.myChart.setOption(option)
      },
      buildLine(data, option) {
        let displayField = this.customChart.displayfield
        let legendData = []
        let xAxisData = []
        let seriesData = []
        let xAxisField = {}
        let series = this.customChart.conf.series
        if (this.customChart.xaxisField)
          xAxisField = this.customChart.xaxisField[0]

        for (let i = 0, d; (d = displayField[i++]); ) {
          if (d) {
            let arr = []
            let type = d.type
            legendData.push(d.comment)
            for (let j = 0, res; (res = data.rows[j++]); ) {
              if (i === 1) {
                let value = res[xAxisField.field.toUpperCase()]
                if (
                  xAxisField.dbType === 'date' &&
                  value &&
                  typeof value === 'number'
                ) {
                  value = new Date(value).format(this.defaultFormat)
                }
                xAxisData.push(value)
              }
              if (res) {
                let value = res[d.field.toUpperCase()]
                if (value && value.length >= 8) option.grid.left = '25%'
                arr.push(value)
              }
            }
            let se = {
              name: d.comment,
              type: d.type,
              data: arr,
              stack: series.stack ? 'one' : null,
            }
            if (!series.doubleYAxis) {
              se.yAxisIndex = d.yAxis === 1 ? 0 : 1
            }
            if (type === 'line') {
              se.smooth = series.smooth
            }
            seriesData.push(se)
          }
        }
        option.series = seriesData
        option.tooltip = {
          trigger: 'axis',
        }
        option.legend.y = 50
        if (series.showType || !series.doubleYAxis) {
          option.xAxis = [{ type: 'category', data: xAxisData }]
          option.yAxis = series.doubleYAxis
            ? [{ type: 'value' }]
            : [{ type: 'value' }, { type: 'value' }]
        } else {
          option.xAxis = [{ type: 'value' }]
          option.yAxis = [{ type: 'category', data: xAxisData }]
        }
        option.yAxis[0].axisLabel = {
          color: '#444343',
          formatter: function(value, index) {
            // value大于1000时除以1000并拼接k，小于1000按原格式显示
            if (value >= 1000) {
              value = value / 1000 + 'k'
            } else if (value < 1000) {
              value
            }
            return value
          },
        }
        //柱状图的时候两端留空。避免柱状图挡住y轴。折线图则不留空，
        if (data.style === 2) option.xAxis[0]['boundaryGap'] = true
        if (data.conf) {
          let obj = data.conf
          if (obj.yMin === 2) option.yAxis[0]['min'] = 'dataMin'
          if (obj.xShowAll === 2)
            option.xAxis[0]['axisLabel'] = {
              interval: 0, //横轴信息全部显示
              rotate: 30,
            }
        }
        if (data.rows && data.rows.length > 20 && !series.dataZoom) {
          option.dataZoom = [
            {
              start: 0,
              end: 10,
              handleIcon:
                'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
              handleSize: '80%',
              handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2,
              },
            },
          ]
          option.grid.bottom = 50
        } else {
          delete option.dataZoom
        }
        option.legend = data.conf.legend
        option.legend.data = legendData
        return option
      },
      buildPie(data, option) {
        let displayField = data.displayfield
        let legendData = []
        let seriesData = []
        let xAxisField = data.xaxisField
        let series = data.conf.series
        if (xAxisField) xAxisField = xAxisField[0]
        if (series.showType) {
          let duration = 100 / data.rows.length
          for (let j = 0; j < data.rows.length; j++) {
            let value = []
            for (let i = 0; i < displayField.length; i++) {
              value.push({
                name: displayField[i].comment,
                value: data.rows[j][displayField[i].field.toUpperCase()],
              })
              if (j === 0) {
                legendData.push(displayField[i].comment)
              }
            }
            seriesData.push({
              name: data.rows[j][xAxisField.field.toUpperCase()],
              type: 'pie',
              data: value,
              radius: [series.radius[0] + '%', series.radius[1] + '%'],
              center: [
                Number(series.center[0]) + j * duration + '%',
                series.center[1] + '%',
              ],
              roseType: series.roseType,
              selectedMode: series.selectedMode,
              label: {
                position: series.label.position,
              },
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            })
          }
        } else {
          let duration = 100 / displayField.length
          for (let i = 0; i < displayField.length; i++) {
            let value = []
            for (let j = 0; j < data.rows.length; j++) {
              value.push({
                name: data.rows[j][xAxisField.field.toUpperCase()],
                value: data.rows[j][displayField[i].field.toUpperCase()],
              })
              if (i === 0) {
                legendData.push(
                  data.rows[j][xAxisField.field.toUpperCase()] + ''
                )
              }
            }
            seriesData.push({
              name: displayField[i].comment,
              type: 'pie',
              data: value,
              radius: [series.radius[0] + '%', series.radius[1] + '%'],
              center: [
                Number(series.center[0]) + i * duration + '%',
                series.center[1] + '%',
              ],
              roseType: series.roseType,
              selectedMode: series.selectedMode,
              label: {
                position: series.label.position,
              },
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            })
          }
        }

        option.series = seriesData
        option.tooltip = {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        }
        option.legend = data.conf.legend
        option.legend.data = legendData
        return option
      },
      buildRadar(data, option) {
        let displayField = data.displayfield
        let legendData = []
        let xAxisField = data.xaxisField
        let arr = []
        let seriesData = []
        let indicator = []
        let series = data.conf.series
        if (xAxisField) xAxisField = xAxisField[0]

        if (series.showType) {
          for (let j = 0; j < data.rows.length; j++) {
            let value = []
            for (let i = 0; i < displayField.length; i++) {
              value.push(data.rows[j][displayField[i].field.toUpperCase()])
              if (j === 0) {
                indicator.push({
                  name: displayField[i].comment,
                })
              }
            }
            legendData.push(data.rows[j][xAxisField.field.toUpperCase()] + '')
            arr.push({
              name: data.rows[j][xAxisField.field.toUpperCase()],
              value: value,
              areaStyle: {
                opacity: '0',
              },
            })
          }
          seriesData = [
            {
              type: 'radar',
              data: arr,
              itemStyle: {
                emphasis: {
                  areaStyle: {
                    opacity: series.areaStyle ? '0' : '0.5',
                  },
                },
              },
            },
          ]
        } else {
          for (let i = 0; i < displayField.length; i++) {
            let value = []
            for (let j = 0; j < data.rows.length; j++) {
              value.push(data.rows[j][displayField[i].field.toUpperCase()])
              if (i === 0) {
                indicator.push({
                  name: data.rows[j][xAxisField.field.toUpperCase()],
                })
              }
            }
            legendData.push(displayField[i].comment)
            arr.push({
              name: displayField[i].comment,
              value: value,
              areaStyle: {
                opacity: '0',
              },
            })
          }
          seriesData = [
            {
              type: 'radar',
              data: arr,
              itemStyle: {
                emphasis: {
                  areaStyle: {
                    opacity: series.areaStyle ? '0' : '0.5',
                  },
                },
              },
            },
          ]
        }

        option.series = seriesData
        option.radar = {
          center: [series.center[0] + '%', series.center[1] + '%'],
          radius: series.radius,
          indicator: indicator,
        }
        option.legend = data.conf.legend
        option.legend.data = legendData
        return option
      },
      buildFunnel(data, option) {
        let displayField = data.displayfield
        let legendData = []
        let xAxisField = data.xaxisField
        let seriesData = []
        let series = data.conf.series
        if (xAxisField) xAxisField = xAxisField[0]

        //列数据展示
        if (series.showType) {
          let duration = 100 / data.rows.length
          for (let j = 0; j < data.rows.length; j++) {
            let value = []
            for (let i = 0; i < displayField.length; i++) {
              value.push({
                name: displayField[i].comment,
                value: data.rows[j][displayField[i].field.toUpperCase()],
              })
              if (j === 0) {
                legendData.push(displayField[i].comment)
              }
            }
            seriesData.push({
              name: data.rows[j][xAxisField.field.toUpperCase()],
              type: 'funnel',
              data: value,
              width: duration - 5 + '%',
              left: j * duration + '%',
              funnelAlign: series.funnelAlign,
              sort: series.sort,
              label: {
                position: series.label.position,
              },
            })
          }
        } else {
          //行数据展示
          let duration = 100 / displayField.length
          for (let i = 0; i < displayField.length; i++) {
            let value = []
            for (let j = 0; j < data.rows.length; j++) {
              value.push({
                name: data.rows[j][xAxisField.field.toUpperCase()],
                value: data.rows[j][displayField[i].field.toUpperCase()],
              })
              if (i === 0) {
                legendData.push(
                  data.rows[j][xAxisField.field.toUpperCase()] + ''
                )
              }
            }
            seriesData.push({
              name: displayField[i].comment,
              type: 'funnel',
              data: value,
              width: duration - 5 + '%',
              left: i * duration + '%',
              funnelAlign: series.funnelAlign,
              sort: series.sort,
              label: {
                position: series.label.position,
              },
            })
          }
        }

        option.series = seriesData

        option.legend = data.conf.legend
        option.legend.data = legendData
        return option
      },
      buildScatter(data, option) {
        let displayField = data.displayfield
        let legendData = []
        let xAxisData = []
        let xAxisField = data.xaxisField
        let seriesData = []
        let series = data.conf.series
        if (xAxisField) xAxisField = xAxisField[0]

        if (series.showType) {
          for (let j = 0; j < data.rows.length; j++) {
            let value = []
            for (let i = 0; i < displayField.length; i++) {
              if (j === 0) {
                xAxisData.push(displayField[i].comment)
              }
              value.push([
                displayField[i].comment,
                data.rows[j][displayField[i].field.toUpperCase()],
              ])
            }
            legendData.push(data.rows[j][xAxisField.field.toUpperCase()] + '')
            seriesData.push({
              name: data.rows[j][xAxisField.field.toUpperCase()],
              type: 'scatter',
              data: value,
            })
          }
        } else {
          for (let i = 0; i < displayField.length; i++) {
            let value = []
            for (let j = 0; j < data.rows.length; j++) {
              if (i === 0) {
                xAxisData.push(
                  data.rows[j][xAxisField.field.toLocaleUpperCase()]
                )
              }
              value.push([
                data.rows[j][xAxisField.field.toLocaleUpperCase()],
                data.rows[j][displayField[i].field.toLocaleUpperCase()],
              ])
            }
            legendData.push(displayField[i].comment)
            seriesData.push({
              name: displayField[i].comment,
              type: 'scatter',
              data: value,
            })
            if (
              displayField[i].regression &&
              displayField[i].regression !== 'none'
            ) {
              let myRegression = this.$ecStat.regression(
                displayField[i].regression,
                value
              )
              myRegression.points.sort(function(a, b) {
                return a[0] - b[0]
              })
              seriesData.push({
                name: 'line',
                type: 'line',
                showSymbol: false,
                data: myRegression.points,
                markPoint: {
                  itemStyle: {
                    color: 'transparent',
                  },
                  label: {
                    show: true,
                    position: 'left',
                    formatter: myRegression.expression,
                    color: '#333',
                    fontSize: 14,
                  },
                  data: [
                    {
                      coord:
                        myRegression.points[myRegression.points.length - 1],
                    },
                  ],
                },
              })
            }
          }
        }

        option.series = seriesData
        option.xAxis = {
          type: data.conf.series.xAxisType,
        }
        if (data.conf.series.xAxisType === 'category') {
          option.xAxis.data = xAxisData
        }
        option.yAxis = {}

        option.legend = data.conf.legend
        option.legend.data = legendData
        return option
      },
      buildHeatmap(data, option) {
        let displayField = data.displayfield
        let legendData = []
        let rows = []
        let columns = []
        let arr = []
        let max = 0
        let xAxisField = data.xaxisField
        if (xAxisField) xAxisField = xAxisField[0]

        for (let i = 0; i < data.rows.length; i++) {
          for (let j = 0; j < displayField.length; j++) {
            if (i === 0) {
              columns.push(displayField[j].comment)
            }
            arr.push([i, j, data.rows[i][displayField[j].field.toUpperCase()]])
            if (data.rows[i][displayField[j].field.toUpperCase()] > max) {
              max = data.rows[i][displayField[j].field.toUpperCase()]
            }
          }
          rows.push(data.rows[i][xAxisField.field.toUpperCase()])
        }
        option.series = [
          {
            type: 'heatmap',
            data: arr,
            label: {
              normal: {
                show: true,
              },
            },
          },
        ]
        option.xAxis = {
          type: 'category',
          data: rows,
          splitArea: {
            show: true,
          },
        }
        option.yAxis = {
          type: 'category',
          data: columns,
          splitArea: {
            show: true,
          },
        }
        option.visualMap = {
          min: 0,
          max: max,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
        }
        option.tooltip = {
          position: 'top',
        }

        option.legend = data.conf.legend
        option.legend.data = legendData
        return option
      },
      getGrid() {
        let top = 0
        let bottom = 0
        let grid = {}
        if (this.customChart.conf.title.show) {
          if (this.customChart.conf.title.top === 'top') {
            top += 7
            if (this.customChart.conf.title.subtext) {
              top += 5
            }
          } else if (this.customChart.conf.title.top === 'bottom') {
            bottom += 16
          }
        }
        if (this.customChart.conf.legend.show) {
          if (this.customChart.conf.legend.top === 'top') {
            top += 7
          } else if (this.customChart.conf.legend.top === 'bottom') {
            bottom += 10
          }
        }
        if (top !== 0) {
          grid.top = top + '%'
        } else {
          grid.top = '5%'
        }
        if (bottom !== 0) {
          grid.bottom = bottom + '%'
        }
        return grid
      },
      getTitlePosition() {
        if (this.customChart.conf.title.top === 'top') {
          return this.customChart.conf.legend.show &&
            this.customChart.conf.legend.top === 'top'
            ? '20'
            : 'auto'
        } else if (this.customChart.conf.title.top === 'bottom') {
          return this.customChart.conf.legend.show &&
            this.customChart.conf.legend.top === 'bottom'
            ? '84%'
            : '88%'
        } else {
          return this.customChart.conf.title.top
        }
      },
      adjustChatTitle(data, option) {
        option.legend.top = 30
        option.grid.top = 80
        if (data.conf && data.conf.title && data.conf.title.subtext) {
          option.legend.top = 50
          option.grid.top = 100
        }
      },
    },
  }
</script>

<style scoped>
  ::v-deep .el-table--scrollable-y {
    max-height: 100% !important;
    height: 100% !important;
  }
</style>
