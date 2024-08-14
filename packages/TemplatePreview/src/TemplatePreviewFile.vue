<template>
  <div v-if="fileList.length > 0">
    <div v-if="fileList.length <= 2">
      <div
        v-for="(item, index) in showList"
        :key="index"
        style="margin-right: 10px"
      >
        <ht-icon :name="item.icon" />
        <el-link type="primary" @click="openDialog">
          {{ item.name }}
        </el-link>
      </div>
    </div>
    <div v-else>
      <span
        v-for="(item, index) in showList"
        :key="index"
        style="margin-right: 6px"
      >
        <ht-icon :name="item.icon" />
      </span>
      <el-link type="primary" @click="openDialog">
        ...{{
          $t('ht.templatePreview.fileCount', { fileListCount: fileList.length })
        }}
      </el-link>
    </div>

    <el-dialog
      v-if="dialogVisible"
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="40%"
      append-to-body
    >
      <el-row v-for="(item, index) in fileList" :key="index">
        <el-col
          :span="16"
          style="
            display: flex;
            justify-content: space-between;
            text-align: left;
          "
        >
          <div
            style="
              font-size: 14px;
              font-family: Source Han Sans SC;
              font-weight: 400;
              line-height: 24px;
              color: #333333;
              opacity: 1;
              white-space: initial;
              margin-right: 16px;
            "
          >
            <ht-icon :name="item.icon" />
            {{ item.name }}
          </div>
          <span
            style="
              margin-right: 50px;
              height: 18px;
              font-size: 12px;
              font-family: Source Han Sans SC;
              font-weight: 400;
              line-height: 22px;
              color: #999999;
              opacity: 1;
            "
          >
            {{ item.username }}
          </span>
        </el-col>

        <el-col :span="8">
          <el-button size="mini" type="text" @click="previewFile(item)">
            预览
          </el-button>
          <el-button size="mini" type="text" @click="download(item.id)">
            下载
          </el-button>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  const { saveAs } = require('file-saver')
  export default {
    name: 'HtTemplatePreviewFile',
    props: ['value'],
    data() {
      return {
        fileList: [],
        showList: [],
        dialogVisible: false,
        dialogTitle: '',
      }
    },
    watch: {
      value() {
        this.loadFile()
      },
    },
    mounted() {
      this.loadFile()
    },
    methods: {
      openDialog() {
        this.dialogTitle = `附件(${this.fileList.length})个`
        this.dialogVisible = true
      },
      download(fileId) {
        this.$requestConfig
          .download(fileId)
          .then(({ data, headers }) => {
            if (data && headers) {
              // 附件下载
              const fileName = decodeURIComponent(
                headers['content-disposition']
                  .split(';')[1]
                  .split('filename=')[1]
              )
              const blob = new Blob([data])
              saveAs(blob, fileName)
            }
          })
          .catch((err) => {
            this.$message.error(`附件下载失败：${err}`)
          })
      },
      previewFile(file) {
        this.$preview(file)
      },
      loadFile() {
        this.fileList = []
        if (this.value) {
          let file = JSON.parse(this.value)
          for (let i = 0; i < file.length; i++) {
            let item = file[i].response
            let obj = {
              id: item.fileId,
              name: item.fileName,
              username: item.username,
            }
            let exe = item.fileName.substring(
              item.fileName.lastIndexOf('.') + 1
            )
            let icon = ''
            if (exe == 'ppt' || exe == 'pptx') {
              icon = 'ppt'
            } else if (exe == 'doc' || exe == 'docx') {
              icon = 'word'
            } else if (exe == 'xls' || exe == 'xlsx') {
              icon = 'excel'
            } else {
              icon = 'file'
            }
            obj.icon = icon
            obj.response = item
            this.fileList.push(obj)
            if (i < 3) {
              this.showList.push(obj)
            }
          }
        }
      },
    },
  }
</script>

<style scoped></style>
