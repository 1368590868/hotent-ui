<template>
  <div>
    <el-dialog
      v-if="dialogVisible"
      :title="$t('ht.templateTaskCirculate.title')"
      :visible.sync="dialogVisible"
      width="70%"
      @close="closeDialog"
    >
      <span>
        <el-form
          ref="form"
          :model="form"
          label-width="100px"
          :inline="false"
          size="normal"
          data-vv-scope="todoReadForm"
        >
          <ht-form-item
            :label="$t('ht.templateTaskCirculate.circulators')"
            required
          >
            <ht-user-selector-input
              ref="htUserSelector"
              v-model="form.users"
              append-to-body
              quick-search-props="fullname,account,phone,email"
              permission="b"
              :config="{ id: 'form' }"
              @input="syncInputUserId"
            ></ht-user-selector-input>
          </ht-form-item>
          <ht-form-item
            :label="$t('ht.templateTaskCirculate.circulateExplain')"
            required
          >
            <div class="approval-comments">
              <ht-input
                ref="opinionInput"
                v-model="form.opinion"
                type="textarea"
                display-style="block"
                :placeholder="$t('ht.templateTaskCirculate.placeholder')"
                :name="$t('ht.templateTaskCirculate.approvalOpinion')"
                validate="required"
                :maxlength="500"
                :max="500"
                :autosize="{ minRows: 4, maxRows: 4 }"
                permission="b"
              />
              <div class="common-words">
                <el-button
                  :title="$t('ht.templateTaskCirculate.addCommonWord')"
                  icon="el-icon-plus"
                  size="mini"
                  @click="addCommonOpinion"
                />
                <span>{{ $t('ht.templateTaskCirculate.commonWord') }}：</span>
                <span
                  v-for="commonOpinion in commonWordsList"
                  :key="commonOpinion"
                >
                  <el-tag
                    v-if="commonOpinion.length > 30"
                    :title="commonOpinion"
                    @click.native="choseCommonOpinion(commonOpinion)"
                  >
                    {{ commonOpinion.substring(0, 30) }}...
                  </el-tag>
                  <el-tag
                    v-else
                    effect="plain"
                    type="info"
                    @click.native="choseCommonOpinion(commonOpinion)"
                  >
                    {{ commonOpinion }}
                  </el-tag>
                </span>
                <span class="word-count">{{ wordCount }}/500</span>
              </div>
            </div>
          </ht-form-item>
          <ht-form-item :label="$t('ht.templateTaskCirculate.uploadFile')">
            <ht-file v-model="fileList" type="list" :downloadable="false" />
          </ht-form-item>
        </el-form>
      </span>
      <span slot="footer">
        <el-button type="primary" @click="confirm">
          {{ $t('ht.common.confirm') }}
        </el-button>
        <el-button @click="closeDialog">{{ $t('ht.common.cancle') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'TemplateTaskCirculate',
    data() {
      return {
        dialogVisible: false,
        form: {
          users: '',
          userId: '',
          opinion: '',
        },
        fileList: '',
        defKey: '',
        instId: '',
        taskId: '',
        commonWordsList: [],
        commonWordLoaded: false,
        wordCount: 0,
      }
    },
    watch: {
      'form.opinion': {
        handler(val) {
          this.$emit('get-opinion', val)
          this.opinionInput()
        },
        deep: true,
      },
    },
    methods: {
      showDialog(row, flowBtnPermission) {
        const instId = row['bpm_proc_inst_id_']
        this.defKey = row['bpm_proc_def_key_']
        this.instId = instId
        if (instId) {
          this.taskId = flowBtnPermission[instId]
            ? flowBtnPermission[instId].taskId || ''
            : ''
        }
        this.$validator = this.$root.$validator
        this.commonWordLoaded || this.loadCommonWord()
        this.dialogVisible = true
      },
      confirm() {
        this.$validator.validateAll('todoReadForm').then((result) => {
          if (!result) {
            this.$message.warning(
              this.$t('ht.templateTaskCirculate.validateErrorMsg')
            )
            return false
          }
          const data = {
            copyToType: '0',
            files: JSON.stringify(this.fileList || []),
            instanceId: this.instId,
            opinion: this.form.opinion,
            messageType: 'inner',
            userId: this.form.userId,
            taskId: this.taskId,
          }
          this.$requestConfig.transToMore(data).then((resp) => {
            if (resp.state) {
              this.$message.success(resp.message)
              this.closeDialog()
            } else if (resp.message) {
              this.$message.error(resp.message)
            }
          })
        })
      },
      loadCommonWord() {
        this.$requestConfig
          .getCommonWordsByDefKeyAndTypeId(this.defKey)
          .then((resp) => {
            this.commonWordLoaded = true
            this.commonWordsList = resp
          })
      },
      closeDialog() {
        this.$set(this, 'form', {
          users: '',
          userId: '',
          opinion: '',
        })
        this.taskId = ''
        this.instId = ''
        this.fileList = ''
        this.dialogVisible = false
      },
      //选择常用语
      choseCommonOpinion(commonOpinion) {
        this.form.opinion += commonOpinion
        this.opinionInput()
        // 触发校验
        this.$nextTick(() => {
          this.$refs.opinionInput.$validator.validate()
        })
        if (this.form.opinion.length >= 500) {
          this.form.opinion = this.form.opinion.substr(0, 500)
          this.opinionInput()
          return
        }
      },
      //统计输入和选择常用语长度
      opinionInput() {
        this.wordCount = this.form.opinion.length
      },
      //添加常用语
      addCommonOpinion() {
        if (!this.form.opinion) {
          this.$message.warning(
            `${this.$t('ht.common.enter')}${this.$t(
              'ht.templateTaskCirculate.approvalOpinion'
            )}`
          )
          return
        }
        this.$confirm(
          this.$t('ht.templateTaskCirculate.confirmMsg', {
            opinion: this.form.opinion,
          })
        )
          .then(() => {
            const params = {
              expression: this.form.opinion,
              departmentId: '',
              postId: '',
              roleId: '',
              type: 4,
            }
            this.$requestConfig.savaCommonWords(params).then((data) => {
              if (data.state) {
                this.$message({ type: 'success', message: data.message })
                this.loadCommonWord()
              } else if (data.message) {
                this.$message.error(data.message)
              }
            })
          })
          .catch(() => {})
      },
      syncInputUserId() {
        let selection = this.$refs['htUserSelector'].$refs['userSelectorEl']
          .selectors
        this.form.userId = selection.map((item) => item.id).join(',')
      },
    },
  }
</script>

<style lang="scss" scoped>
  .approval-comments {
    outline: 1px solid;

    .common-words {
      padding: 5px 10px;
      border-top: 1px solid;

      .el-button {
        margin-right: 10px;
      }
      .word-count {
        float: right;
      }
    }

    ::v-deep {
      .inputs {
        .el-textarea__inner {
          border: none;
        }
      }
    }
    .el-tag {
      margin-right: 10px;
      cursor: pointer;
    }
  }
</style>
