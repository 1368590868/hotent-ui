<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <span class="el-dropdown-link export_link">
      <ht-icon name="export" />
      {{ $t('ht.subTable.subTableExport') }}
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="current">
        {{ $t('ht.subTable.currentPageData') }}
      </el-dropdown-item>
      <el-dropdown-item command="all">
        {{ $t('ht.subTable.allData') }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script>
  import SubPagination from '@/services/SubPagination.js'
  import { decode } from '@/util/base64.js'
  const { saveAs } = require('file-saver')
  import utils from '@/utils.js'
  import { t } from '@/locale'

  export default {
    name: 'HtSubExportDialog',
    props: {
      dataSubname: {
        type: String,
        required: true,
      },
      dataColumns: {
        type: String,
        required: true,
      },
      subtablePagination: {
        type: Boolean,
        default: false,
      },
      dataSubdesc: {
        type: String,
        default() {
          return t('ht.subTable.subTableData')
        },
      },
    },
    computed: {
      columns: function() {
        return eval(decode(this.dataColumns))
      },
    },
    created() {
      if (!this.$XLSX) {
        console.warn(this.$t('ht.subTable.xlsxWarnMsg'))
      }
    },
    methods: {
      changeRowKey(rows) {
        var exportData = []
        rows.forEach((row) => {
          var exportRow = {}
          this.columns.forEach((col) => {
            if (col.ctrlType != 'suntable') {
              exportRow[col.desc] = row[col.name]
            }
          })
          exportData.push(exportRow)
        })
        return exportData
      },
      handleCommand(type) {
        const pInst = utils.getOnlineFormInstance(this)
        SubPagination.exportData(
          this.dataSubname,
          type,
          pInst,
          this.subtablePagination
        )
          .then((data) => {
            let exportData = this.changeRowKey(data)
            const sheet = this.$XLSX.utils.json_to_sheet(exportData),
              blob = this.sheet2blob(sheet)

            saveAs(blob, `${this.dataSubdesc}.xls`)
          })
          .catch((err) => {
            this.$message.error(`${this.$t('ht.subTable.exportError')}：${err}`)
          })
      },
      sheet2blob(sheet, sheetName) {
        sheetName = sheetName || 'sheet1'
        var workbook = {
          SheetNames: [sheetName],
          Sheets: {},
        }
        workbook.Sheets[sheetName] = sheet
        // 生成excel的配置项
        var wopts = {
          bookType: 'xls', // 要生成的文件类型
          bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
          type: 'binary',
        }
        var wbout = this.$XLSX.write(workbook, wopts)
        var blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
        // 字符串转ArrayBuffer
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length)
          var view = new Uint8Array(buf)
          for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
          return buf
        }
        return blob
      },
    },
  }
</script>
<style lang="scss" scoped>
  .export_link {
    font-weight: normal;
    color: $base-color-blue;
    cursor: pointer;
  }
</style>
