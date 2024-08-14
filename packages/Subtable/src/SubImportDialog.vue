<template>
  <div class="import-container">
    <el-button
      type="text"
      size="mini"
      class="import-btn"
      @click="dialogVisible = true"
    >
      <ht-icon name="import" />
      {{ $t('ht.subTable.subTableImport') }}
    </el-button>
    <el-button
      type="text"
      size="mini"
      class="download-btn"
      @click="exportFormSub"
    >
      <ht-icon name="download" />
      {{ $t('ht.subTable.template') }}
    </el-button>
    <el-dialog
      :visible.sync="dialogVisible"
      width="600px"
      :title="$t('ht.subTable.importDialogTitle')"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form
        v-form="{ inputsDisplay: 'block' }"
        label-width="100px"
        label-position="left"
      >
        <el-form-item :label="`${$t('ht.subTable.importFile')}：`">
          <input
            ref="selectFile"
            type="file"
            accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            @change="fileChange"
          />
        </el-form-item>
        <el-form-item :label="`${$t('ht.subTable.importModel')}：`">
          <ht-radio
            v-model="mode"
            :options="modeOptions"
            :props="{ key: 'mode', value: 'desc' }"
          ></ht-radio>
        </el-form-item>
        <el-tag
          v-if="importRows && importRows.length > 0"
          type="warning"
          class="read-success__label"
        >
          {{ $t('ht.subTable.hasRead') }}
          <b>{{ importRows.length }}</b>
          {{ $t('ht.subTable.strip') }}{{ $t('ht.subTable.data') }}，
          <a @click="showRowData = !showRowData">
            {{ $t('ht.subTable.checkDetail') }}
          </a>
          。
        </el-tag>
        <pre v-if="showRowData" class="import-rows__pre">{{ importRows }}</pre>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="small"
          type="primary"
          :disabled="!importRows || importRows.length == 0"
          @click="dialogConfirm"
        >
          {{ $t('ht.common.confirm') }}
        </el-button>
        <el-button size="small" @click="dialogVisible = false">
          {{ $t('ht.common.cancle') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import SubPagination from '@/services/SubPagination.js'
  import utils from '@/utils.js'
  import { decode } from '@/util/base64.js'
  import { t } from '@/locale'
  const { saveAs } = require('file-saver')

  export default {
    name: 'HtSubImportDialog',
    props: {
      rows: Array,
      subDesc: {
        type: String,
        default() {
          return t('ht.subTable.subTableTemplate')
        },
      },
      dataSubname: {
        type: String,
        required: true,
      },
      maxRow: {
        type: String,
        default: null,
      },
      mergeExpression: {
        type: String,
        default: null,
      },
      dataColumns: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        dialogVisible: false,
        importRows: null,
        showRowData: false,
        mergeFunc: null,
        mode: 'append',
        modeOptions: [
          { mode: 'append', desc: this.$t('ht.subTable.append') },
          { mode: 'override', desc: this.$t('ht.subTable.override') },
          {
            mode: 'merge',
            desc: this.$t('ht.subTable.merge'),
            disabled: true,
          },
        ],
      }
    },
    computed: {
      columns: function() {
        return eval(decode(this.dataColumns))
      },
    },
    watch: {
      dialogVisible: {
        handler: function(newVal) {
          // 清空附件
          if (!newVal && this.$refs.selectFile) {
            this.$refs.selectFile.value = ''
            this.importRows = null
            this.showRowData = false
          }
        },
        immediate: true,
      },
      mergeExpression: {
        handler: function(newVal) {
          if (newVal) {
            // 如果有导入合并的代码，则允许选择合并导入模式
            this.$set(this.modeOptions[2], 'disabled', false)
            // 并设置默认为 合并导入
            this.mode = 'merge'
            // 解码合并的代码
            const funcExp = decode(newVal)
            this.mergeFunc = eval(`(${funcExp})`)
          }
        },
        immediate: true,
      },
    },
    created() {
      if (!this.$XLSX) {
        console.warn(this.$t('ht.subTable.xlsxWarnMsg'))
      }
    },
    mounted() {
      // 初始化导入时需要的参数
      const pInst = utils.getOnlineFormInstance(this)
      if (!SubPagination._map.has(this.dataSubname)) {
        SubPagination.set(this.dataSubname, {
          rows: this.rows || [],
        })
      }
      const instKey = SubPagination._vueComponentKey(this.dataSubname)
      if (!SubPagination._map.has(instKey) && pInst) {
        // 将子表数据所属的VueComponent对象实例存储（用于数据导入）
        SubPagination._map.set(instKey, pInst)
      }
    },
    destroyed() {
      SubPagination.clear(this.dataSubname)
    },
    methods: {
      //子表模板导出
      exportFormSub() {
        let columns = this.columns.filter((item) => {
          return !(
            item.ctrlType &&
            (item.ctrlType === 'sunDiv' || item.ctrlType === 'suntable')
          )
        })
        this.$requestConfig
          .downloadSubtableTemplate(this.subDesc, columns)
          .then(({ data }) => {
            // 附件下载
            const blob = new Blob([data])
            saveAs(blob, `${this.subDesc}.xls`)
          })
          .catch((err) => {
            this.$message.error(
              `${this.$t('ht.subTable.downloadTemplateError')}：${err}`
            )
          })
      },
      getNameByDesc(desc) {
        var name = ''
        this.columns.forEach((col) => {
          if (col.desc == desc) {
            name = col.name
          }
        })
        return name
      },
      changeRowKey(rows) {
        var importRows = []
        rows.forEach((row) => {
          var importRow = {}
          for (let key in row) {
            importRow[this.getNameByDesc(key)] = row[key]
          }
          importRows.push(importRow)
        })
        return importRows
      },
      dialogConfirm() {
        if (this.importRows.length == 0) {
          this.$message.error(this.$t('ht.subTable.selectImportData'))
          return
        }
        if (this.maxRow) {
          let maxRowInt = parseInt(this.maxRow)
          if (this.mode == 'override') {
            //覆盖导入
            let count = this.importRows.length
            if (count > maxRowInt && maxRowInt != 0) {
              this.$message.error(
                this.$t('ht.subTable.exceededMaximumRows') +
                  '【' +
                  maxRowInt +
                  '】'
              )
              return
            }
          } else if (this.mode == 'append') {
            const formInstance = utils.getOnlineFormInstance(
              this.$parent.$parent
            )
            if (!formInstance || !formInstance.data) {
              this.$message.error(this.$t('ht.subTable.cannotImport'))
            }
            //追加导入/合并导入
            let boData = formInstance.data
            let pathArr = this.dataSubname.split('.')
            let subInitData = boData[pathArr[1]][pathArr[2]] || [] //子表数据
            let num = this.importRows.length + subInitData.length
            if (num > maxRowInt && maxRowInt != 0) {
              this.$message.error(
                this.$t('ht.subTable.exceededMaximumRows') +
                  '【' +
                  maxRowInt +
                  '】'
              )
              return
            }
          } else if (this.mode == 'merge') {
            const formInstance = utils.getOnlineFormInstance(
              this.$parent.$parent
            )
            if (!formInstance || !formInstance.data) {
              this.$message.error(this.$t('ht.subTable.cannotImport'))
            }
          }
        }
        SubPagination.importData(
          this.dataSubname,
          this.importRows,
          this.mode,
          this.mergeFunc
        )
          .then(() => {
            this.$message.success(this.$t('ht.subTable.importSuccess'))
            this.dialogVisible = false
          })
          .catch((err) => {
            this.$message.error(`${this.$t('ht.subTable.importError')}：${err}`)
          })
      },
      fileChange(m) {
        if (!m || !m.target || !m.target.files || m.target.files.length != 1) {
          return
        }
        this.importRows = []
        this.readWorkbookFromLocalFile(m.target.files[0], (rows) => {
          this.importRows = this.changeRowKey(rows)
        })
      },
      // 读取本地excel文件
      readWorkbookFromLocalFile(file, callback) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = e.target.result
          let workbook = null
          try {
            // 读取Excel内容
            workbook = this.$XLSX.read(data, { type: 'binary' })
          } catch (err) {
            this.$message.error(this.$t('ht.subTable.notValidExcelFile'))
            return
          }
          const sheetNames = workbook.SheetNames,
            // 只读取第一个sheet的数据
            worksheet = workbook.Sheets[sheetNames[0]]

          if (worksheet['!merges'] && worksheet['!merges'].length > 0) {
            const merge = worksheet['!merges'][0],
              rowNum = Number(merge['e']['r'])
            // 合并单元格时会导致转换出来的JSON数据格式错乱
            this.$message.error(
              this.$t('ht.subTable.cannotHaveMergedCells', {
                rowNum: rowNum + 1,
              })
            )
            return
          }
          // 放在数字精度问题 以字符串形式读取
          const json = this.$XLSX.utils.sheet_to_json(worksheet, { raw: false })
          if (!json || json.constructor != Array) {
            this.$message.error(this.$t('ht.subTable.dataWrongFormat'))
            return
          }
          if (callback) callback(json)
        }
        reader.readAsBinaryString(file)
      },
    },
  }
</script>
<style lang="scss" scoped>
  .import-container {
    margin: 0 10px;
    .import-btn,
    .download-btn {
      font-size: 14px;
      padding-right: 14px;
    }
  }
  .read-success__label {
    display: block;
    font-size: 13px;
  }
  .read-success__label a {
    color: $base-color-blue;
    cursor: pointer;
  }
  .read-success__label b {
    color: red;
  }
  .import-rows__pre {
    margin-top: 20px;
    max-height: 270px;
    overflow-y: scroll;
  }
</style>
