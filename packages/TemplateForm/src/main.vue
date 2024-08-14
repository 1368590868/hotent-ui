<template>
  <el-main class="base-main">
    <div class="base-main_box">
      <div id="printData">
        <div v-if="!inDialog" class="form-container">
          <span>{{ $t('ht.templateForm.formContent') }}</span>
        </div>
        <div class="form-content">
          <form v-if="html">
            <ht-online-form
              ref="onlineForm"
              class="custom-form"
              :html="html"
              :data="data"
              :permission="permission"
              :is-view="isView"
              :is-print="print"
              @loadSuccess="loadSuccess"
            />
          </form>
        </div>
      </div>
      <div v-if="showOperation" ref="btnRegion" class="base-main_bottom_btn">
        <el-button
          v-if="startFlow && startFlow != 'false' && action != 'get'"
          type="success"
          :disabled="disabled"
          @click="start"
        >
          {{ startLable }}
        </el-button>
        <el-button
          v-if="isShow && action != 'editDraft'"
          type="primary"
          :disabled="disabled"
          @click="boSave()"
        >
          {{ $t('ht.common.save') }}
        </el-button>
        <!-- <el-button
          v-if="action === 'editDraft'"
          type="primary"
          :disabled="disabled"
          @click="boSaveAndDelDraft"
        >
          保存至列表
        </el-button>
        <el-button
          v-if="!id"
          type="primary"
          :disabled="disabled"
          @click="boSaveDraft"
        >
          保存草稿
        </el-button> -->
        <el-button type="default" :disabled="disabled" @click="printDetail()">
          {{ printLable }}
        </el-button>
        <el-button type="default" @click="close(false)">
          {{ $t('ht.common.return') }}
        </el-button>
      </div>
    </div>
  </el-main>
</template>
<script>
  import utils from '@/utils.js'
  import { encode, decode } from '@/util/base64'
  // eslint-disable-next-line no-unused-vars
  import $ from 'jquery'
  export default {
    name: 'HtTemplateForm',
    props: {
      templateKey: {
        type: String,
      },
      action: {
        type: String,
      },
      isShare: {
        type: Boolean,
      },
      openType: {
        type: String,
      },
      dataParam: String,
      inDialog: {
        type: Boolean,
        default: false,
      },
      dialogParam: {
        type: Object,
      },
      isCustomHandleClose: {
        type: Boolean,
        default: false,
      },
      quitAfterSaving: {
        type: Boolean,
        default: false,
      },
      // 是否显示底部操作按钮
      showOperation: {
        type: Boolean,
        default: true,
      },
      // 是否为移动端
      isMobile: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        alias_new: 'statement',
        html: null,
        data: null,
        permission: null,
        reloadOnlineForm: false,
        isView: false,
        disabled: false,
        boAlias: '',
        id: '',
        startFlow: false,
        recordId: '',
        defKey: '',
        formKey: '',
        fillField: '',
        fillValue: '',
        bindList: [],
        print: false,
        isShow: true,
        tempAlias: '',
        startLable: '发起流程',
        printLable: '打印',
      }
    },
    computed: {
      closeSave() {
        if (
          this.$route.query.quitAfterSaving &&
          this.$route.query.quitAfterSaving == 'true'
        ) {
          return true
        }
        return this.quitAfterSaving
      },
    },
    watch: {
      templateKey: function (n, o) {
        if (n && o && n != o) {
          this.init()
        }
      },
      //控件的联动会导致表单的permission发生变化，联动显示会变成'w'，需要改回原来的权限
      permission: {
        handler(newVal) {
          if (this.formKey && this.action == 'get') {
            for (let key in newVal.fields[this.formKey]) {
              if (newVal.fields[this.formKey][key] == 'w') {
                newVal.fields[this.formKey][key] = 'r'
              }
            }
          }
        },
        deep: true,
      },
    },
    updated() {
      let result = window.location.href.split('?')[0].split('/')
      if (
        this.action == 'get' ||
        result[result.length - 1] == 'get' ||
        result[result.length - 2] == 'get'
      ) {
        this.isShow = false
      }
      //判断是否显示发起流程按钮
      if (
        window.location.href.split('?')[1] &&
        window.location.href.split('?')[1].split('&')
      ) {
        if (
          window.location.href.split('?')[1].split('&')[1] &&
          window.location.href.split('?')[1].split('&')[1] == 'startFlow=false'
        ) {
          this.startFlow = false
        }
      }
      if (this.dialogParam && this.dialogParam.isStartFlow) {
        this.startFlow = false
      }
    },
    created() {
      this.init()
    },
    methods: {
      loadSuccess() {
        if (this.$route.query.isPrint) {
          this.printDetail()
        }
      },
      printDetail() {
        this.$refs.btnRegion.style.display = 'none'
        setTimeout(() => {
          //解决input输入框没有值的问题
          const input = $('input')
          input.each(function () {
            $(this).attr('value', $(this).val())
          })
          const textarea = $('textarea')
          if (textarea) {
            for (var i = 0; i < textarea.length; i++) {
              $(textarea[i]).html(textarea[i].value)
            }
          }

          document.body.innerHTML =
            document.getElementsByClassName('custom-form')[0].innerHTML
          window.print()
          this.$refs.btnRegion.style.display = 'block'
          location.reload()
        }, 500)
      },
      //获取表单数据
      getFormData(verify) {
        return this.$refs.onlineForm.getData(verify)
      },
      //启动
      start() {
        this.getFormData(true)
          .then((formData) => this.processStart(formData))
          .catch(() => {})
      },
      processStart(formDataStr) {
        // utils.closeAllNotification()
        let data = { flowKey: this.defKey }
        if (formDataStr) {
          data.data = encode(JSON.stringify(formDataStr))
        }
        this.disabled = true
        this.$requestConfig
          .start(data)
          .then(() => {
            this.close(true)
          })
          .catch(() => {
            this.disabled = false
          })
      },
      //保存
      boSave(delDraftId) {
        this.getFormData(true)
          .then((formData) => {
            // utils.closeAllNotification()
            let data = {
              boAlias: this.boAlias,
              boData: formData,
            }
            this.disabled = true

            if (delDraftId) {
              data.delDraftId = delDraftId
            }
            data.formKey = this.formKey
            data.templateKey = this.templateKey
            this.$requestConfig
              .boSave(data)
              .then((result) => {
                if (result.state) {
                  if (this.closeSave) {
                    this.close()
                    return
                  }
                  //当操作为编辑是，点击保存成功后提示继续编辑还是返回
                  if (this.action === 'edit' || this.action === 'add') {
                    this.$message.success(result.message)
                    if (this.isMobile) {
                      this.$dialog
                        .confirm({
                          title: '提示',
                          message: '保存成功，是否退出？',
                          confirmButtonText: '立即退出',
                          cancelButtonText: '继续操作',
                        })
                        .then(() => {
                          // on confirm
                          this.close(false)
                        })
                        .catch(() => {
                          // on cancel
                          this.$refs.onlineForm.init()
                          this.disabled = false
                          if (this.action === 'editDraft') {
                            this.editDraftHandler()
                          } else {
                            this.handler()
                          }
                        })
                    } else {
                      this.$confirm('保存成功，是否退出？', '提示', {
                        confirmButtonText: '立即退出',
                        cancelButtonText: '继续操作',
                        type: 'warning',
                      })
                        .then(() => {
                          this.close(false)
                        })
                        .catch(() => {
                          this.$refs.onlineForm.init()
                          this.disabled = false
                          if (this.action === 'editDraft') {
                            this.editDraftHandler()
                          } else {
                            this.handler()
                          }
                        })
                    }
                  } else {
                    this.close(true)
                  }
                } else {
                  this.disabled = false
                }
              })
              .catch(() => {
                this.disabled = false
              })
          })
          .catch(() => {})
      },
      boSaveAndDelDraft() {
        this.boSave(this.draftId)
      },
      //保存
      boSaveDraft() {
        this.getFormData(false)
          .then((formData) => {
            let data = {
              tempAlias: this.tempAlias,
              dataJson: JSON.stringify(formData),
            }
            if (this.draft) {
              data.id = this.draft.id
              data.title = this.draft.title
              data.createBy = this.draft.createBy
              data.createTime = this.draft.createTime
            }
            this.disabled = true
            this.$requestConfig.boSaveDraft(data).then((result) => {
              if (result.state) {
                this.$message.success(result.message)
                if (this.inDialog || this.isCustomHandleClose) {
                  this.$emit('close')
                } else {
                  this.$router.go(-1)
                }
              } else {
                this.disabled = false
                this.$message.error(result.message)
              }
            })
          })
          .catch(() => {})
      },

      //关闭窗口
      close() {
        if (this.inDialog || this.isCustomHandleClose) {
          this.$emit('close')
          return
        }
        //外链表单不返回问题
        debugger
        if (sessionStorage.getItem('replaceHome')) {
          this.$router.push('/')
          sessionStorage.setItem('replaceHome', false)
        } else if (this.$requestConfig.goBack) {
          this.$requestConfig.goBack()
        } else {
          this.$router.go(-1)
        }
      },
      handler() {
        let _me = this
        this.$requestConfig
          .getDataTemplateForm(
            this.formKey,
            this.boAlias,
            this.id || '',
            this.action,
            this.recordId || '',
            this.templateKey || ''
          )
          .then((rep) => {
            if (rep.result) {
              _me.data = rep.data
              //数据视图控件
              if (_me.bindList && _me.bindList.length > 0) {
                for (var i = 0; i < _me.bindList.length; i++) {
                  //不区分字段大小写，判断数据中是否存在字段名
                  let key = _me.bindList[i].key
                  if (_me.data[_me.boAlias][key] == undefined) {
                    key = key.toUpperCase()
                  }
                  if (_me.data[_me.boAlias][key] == '') {
                    // 回填数据
                    _me.data[_me.boAlias][key] = _me.bindList[i].value
                  }
                }
              }
              //是否是数据报表明细
              if (rep.permission && _me.action == 'get') {
                const permissionObj = rep.permission
                let commonRight = ''
                //如果是管理端进入，则将页面字段的权限修改为可编辑
                if (_me.type == 'manage') {
                  commonRight = 'w'
                  //如果是查看实例，也是获取发起流程的表单和权限。只不过所有可见的权限要变成编辑
                } else {
                  commonRight = 'r'
                }
                if (permissionObj.fields && commonRight) {
                  for (let key in permissionObj.fields) {
                    const bodef = permissionObj.fields[key]
                    if (bodef) {
                      for (var fname in bodef) {
                        if (
                          commonRight == 'w' ||
                          (commonRight == 'r' && bodef[fname] != 'n')
                        ) {
                          bodef[fname] = commonRight
                        }
                      }
                    }
                    permissionObj.fields[key] = bodef
                  }
                }
                if (permissionObj.table && commonRight) {
                  for (let key in permissionObj.table) {
                    const table = permissionObj.table[key]
                    if (table) {
                      if (commonRight == 'w') {
                        table['hidden'] = false
                        table['add'] = true
                        table['del'] = true
                      } else if (commonRight == 'r') {
                        table['add'] = false
                        table['del'] = false
                        table['required'] = false
                        table['edit'] = false
                      }
                    }
                    permissionObj.table[key] = table
                  }
                }
                _me.permission = permissionObj
              } else {
                _me.permission = rep.permission
              }
              _me.html = rep.form.formHtml
              this.handlerJs(rep.form)
              this.handlerParams()
            }
          })
      },
      handlerJs(rep) {
        let _this = this
        _this.reloadOnlineForm = true
        setTimeout(() => {
          eval(rep.diyJs)
        }, 10)
      },
      handlerParams() {
        if (this.dataParam) {
          let parameters = JSON.parse(decode(this.dataParam))
          for (let key in parameters) {
            this.data[this.boAlias][key] = parameters[key]
          }
        }
      },
      editDraftHandler() {
        let _me = this
        this.$requestConfig.getTempDraftData(_me.draftId).then((rep) => {
          if (rep.result) {
            _me.data = rep.data
            _me.draft = rep.draft
            if (rep.permission) {
              _me.permission = rep.permission
            }
            _me.html = rep.form.formHtml
            this.handlerJs(rep.form)
          }
        })
      },
      init() {
        this.id = this.inDialog ? this.dialogParam.id : utils.getUrlKey('id')
        //this.startFlow = utils.getUrlKey('startFlow');
        this.recordId = this.inDialog
          ? this.dialogParam.recordId
          : utils.getUrlKey('recordId')
        let bindList = this.inDialog
          ? this.dialogParam.bindList
          : utils.getUrlKey('bindList')
        if (bindList) {
          this.bindList = JSON.parse(decode(decodeURIComponent(bindList)))
        }
        this.draftId = this.inDialog
          ? this.dialogParam.draftId
          : utils.getUrlKey('draftId')
        this.isView = this.action == 'get'
        let _me = this

        this.$requestConfig
          .getBpmDataTemplateInfo({
            templateKey: this.templateKey,
          })
          .then((result) => {
            if (result.state) {
              if (result.value.allowShare == 2 && _me.isShare) {
                _me.$router.push('/messageFillPage/5')
                return
              }
              _me.boAlias = result.value.boDefAlias
              _me.defKey = result.value.defId
              _me.formKey = _me.isMobile
                ? result.value.mobileFormAlias
                : result.value.formKey
              _me.tempAlias = result.value.alias
              if (result.value.manageField) {
                let re = JSON.parse(result.value.manageField)
                re.forEach((item) => {
                  if (item.name == 'startFlow') {
                    if (item.right) {
                      this.getStartFlowRight(item.right)
                        .then((res) => {
                          if (res) {
                            this.startFlow = true
                            this.startLable = item.desc
                          } else {
                            this.startFlow = false
                          }
                        })
                        .catch(() => {
                          this.startFlow = false
                        })
                    }
                  } else if (item.name == 'print') {
                    this.printLable = item.desc
                  }
                })
              } else {
                this.startFlow = true
              }
              this.reloadOnlineForm = false
              //如果编辑的是草稿数据
              if (this.action === 'editDraft') {
                this.editDraftHandler()
              } else {
                this.handler()
              }
            }
          })
      },
      getStartFlowRight(rightStr) {
        return new Promise((resolve) => {
          let rightArr = JSON.parse(rightStr)
          for (let i = 0; i < rightArr.length; i++) {
            let right = rightArr[i]
            if (right.type == 'everyone') {
              resolve(true)
              return
            }
          }
          let userId = this.$requestConfig.getUserId()
          this.$requestConfig.getUserRightMapByIds(userId).then((resp) => {
            let rightMap = resp[userId]
            for (let i = 0; i < rightArr.length; i++) {
              let type = rightArr[i].type == 'pos' ? 'job' : rightArr[i].type
              if (this.calcAuth(rightArr[i].id, rightMap[type])) {
                resolve(true)
                return
              }
            }
            resolve(false)
          })
        })
      },
      //计算权限
      calcAuth(btnIds, userIds) {
        if (!btnIds || !userIds) {
          return false
        }
        let btnIdsArr = btnIds.split(',')
        let userIdsArr = userIds.replace(/'/g, '').split(',')
        return userIdsArr.some((item) => {
          return btnIdsArr.includes(item)
        })
      },
    },
  }
</script>

<style lang="scss" scoped>
  >>> .el-form-item {
    margin-bottom: 15px !important;
    margin-top: 10px !important;
    margin-right: 10px !important;
  }
  .base-main {
    background-color: #e9eef3;
    height: 100%;
    .base-main_box {
      width: 96%;
      margin: 0px auto 0;
      background-color: #fff;
      padding: 20px;
      margin-top: 20px;
    }
    .base-main_bottom_btn {
      width: 100%;
      text-align: center;
      padding-top: 20px;
    }
  }

  >>> .form-table {
    width: 100%;
    border-top: 1px solid #ebeef5;
    border-left: 1px solid #ebeef5;
  }

  >>> .form-table > thead > tr > th,
  >>> .form-table > tbody > tr > th {
    text-align: right;
    color: #666;
    font-weight: normal;
  }

  >>> .form-table > tbody > tr > th.group-th {
    text-align: left;
    background: #f9f9f9;
    font-weight: bold;
  }

  >>> .form-table > thead > tr.sub-table-header > th {
    text-align: center;
    background: #fafafa;
  }

  >>> .form-table > tbody > tr > th > span,
  >>> .form-table > thead > tr > th > span {
    color: #f00;
  }

  >>> .form-table > tbody > tr > th,
  >>> .form-table > tbody > tr > td,
  >>> .form-table > tfoot > tr > td,
  >>> .form-table > thead > tr > th {
    border-right: 1px solid #ebeef5;
    border-bottom: 1px solid #ebeef5;
    padding: 10px;
    min-width: 0;
    box-sizing: border-box;
    text-overflow: ellipsis;
    vertical-align: middle;
    position: relative;
  }

  >>> .form-table > tfoot > tr > td {
    padding: 5px 10px;
  }

  .form-container {
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 10px;
  }

  .form-container > span {
    font-weight: bold;
    font-size: 14px;
    padding-left: 10px;
    color: #666;
  }

  .form-content {
    padding: 11px 0;
  }

  >>> div[aria-invalid='true'] + small,
  >>> small.error-message {
    display: block;
    margin-top: 8px;
    color: #f56c6c;
    font-size: 12px;
    font-weight: bold;
    line-height: 1;
  }
  .form-empty {
    position: absolute;
    text-align: center;
    width: 100%;
    font-size: 20px;
    top: 200px;
    color: #ccc;
  }
</style>
